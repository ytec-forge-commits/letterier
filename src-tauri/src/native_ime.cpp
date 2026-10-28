// Native TSF input connection for the vertical document. Project/Undo stay in React.
#define UNICODE
#define _UNICODE
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <msctf.h>
#include <textstor.h>
#include <initguid.h>
#include <tsattrs.h>
#include <algorithm>
#include <string>
#include <vector>
#include "native_ime.h"
static HWND mainWindow=nullptr,inputWindow=nullptr;
static ITfThreadMgr* manager=nullptr;
static ITfDocumentMgr* documentManager=nullptr;
static ITfContext* context=nullptr;
static ITfKeystrokeMgr* keys=nullptr;
static ITfCategoryMgr* categories=nullptr;
static ITfDisplayAttributeMgr* displayAttributes=nullptr;
static ITfSource* editSource=nullptr;
static DWORD textEditSinkCookie=TF_INVALID_COOKIE;
static HHOOK messageHook=nullptr;
static LetterierImeCallback callback=nullptr;
static void* callbackUser=nullptr;
static uint64_t currentSession=0,sequence=0;
static bool closing=false,inHook=false,programmatic=false;
static LetterierImeRect controlRect={0,0,1,1},selectionRect={0,0,1,1};
static double displayScale=1;
static void logEvent(const char*,long=0){}
static RECT screenRect(LetterierImeRect value){POINT point={LONG(value.x*displayScale),LONG(value.y*displayScale)};ClientToScreen(mainWindow,&point);return {point.x,point.y,point.x+LONG(value.width*displayScale),point.y+LONG(value.height*displayScale)};}
static void emitNative(uint32_t kind,LONG start,LONG end,const wchar_t* text,ULONG length,LONG selectedStart,LONG selectedEnd,UINT key=0,UINT modifiers=0){if(!callback||closing||programmatic)return;LetterierImeEvent event={kind,currentSession,++sequence,start,end,selectedStart,selectedEnd,reinterpret_cast<const uint16_t*>(text),length,key,modifiers};callback(callbackUser,&event);}
class TextStore final:public ITextStoreACP,public ITfContextOwnerCompositionSink,public ITfTextEditSink {
 LONG refs=1;ITextStoreACPSink* sink=nullptr;DWORD sinkMask=0,lock=0,pending=0;
 std::vector<TS_ATTRID> requested;
 LONG geometryStart=0;std::vector<LetterierImeRect> geometry;uint32_t geometryRevision=1;
 LONG requestedStart=-1,requestedEnd=-1;
 std::vector<std::pair<LONG,LONG>> lastFormats;
 uint32_t contentRevision=0,lastFormatRevision=uint32_t(-1);
public:
 std::wstring text;
 TS_SELECTION_ACP selection={0,0,{TS_AE_END,FALSE}};
 bool composing=false;
 ~TextStore(){if(sink)sink->Release();}
 HRESULT STDMETHODCALLTYPE QueryInterface(REFIID id,void** out) override {if(!out)return E_POINTER;*out=nullptr;if(id==IID_IUnknown||id==IID_ITextStoreACP)*out=static_cast<ITextStoreACP*>(this);else if(id==IID_ITfContextOwnerCompositionSink)*out=static_cast<ITfContextOwnerCompositionSink*>(this);else if(id==IID_ITfTextEditSink)*out=static_cast<ITfTextEditSink*>(this);else return E_NOINTERFACE;AddRef();return S_OK;}
 ULONG STDMETHODCALLTYPE AddRef() override{return InterlockedIncrement(&refs);}
 ULONG STDMETHODCALLTYPE Release() override{auto n=InterlockedDecrement(&refs);if(!n)delete this;return n;}
 void refresh(){}
 void layoutChanged(){if(sink&&!lock&&(sinkMask&TS_AS_LAYOUT_CHANGE))sink->OnLayoutChange(TS_LC_CHANGE,0);}
 void invalidateGeometry(){geometry.clear();++geometryRevision;requestedStart=requestedEnd=-1;}
 HRESULT STDMETHODCALLTYPE OnEndEdit(ITfContext* edited,TfEditCookie cookie,ITfEditRecord*)override{
  if(!composing||!categories||!displayAttributes)return S_OK;
  ITfProperty* property=nullptr;IEnumTfRanges* enumerator=nullptr;std::vector<std::pair<LONG,LONG>> formats;
  if(SUCCEEDED(edited->GetProperty(GUID_PROP_ATTRIBUTE,&property))&&SUCCEEDED(property->EnumRanges(cookie,&enumerator,nullptr))){
   ITfRange* range=nullptr;ULONG got=0;for(unsigned i=0;i<64&&enumerator->Next(1,&range,&got)==S_OK;++i){VARIANT value;VariantInit(&value);
    if(SUCCEEDED(property->GetValue(cookie,range,&value))&&value.vt==VT_I4){GUID guid={};ITfDisplayAttributeInfo* info=nullptr;TF_DISPLAYATTRIBUTE attribute={};
     if(SUCCEEDED(categories->GetGUID(TfGuidAtom(value.lVal),&guid))&&SUCCEEDED(displayAttributes->GetDisplayAttributeInfo(guid,&info,nullptr))){
      if(SUCCEEDED(info->GetAttributeInfo(&attribute))&&(attribute.bAttr==TF_ATTR_TARGET_CONVERTED||attribute.bAttr==TF_ATTR_TARGET_NOTCONVERTED)){ITfRangeACP* acp=nullptr;if(SUCCEEDED(range->QueryInterface(IID_PPV_ARGS(&acp)))){LONG start=0,length=0;if(SUCCEEDED(acp->GetExtent(&start,&length))&&start>=0&&length>0&&size_t(start)+size_t(length)<=text.size())formats.push_back({start,start+length});acp->Release();}}info->Release();
     }
    }VariantClear(&value);range->Release();range=nullptr;
   }enumerator->Release();
  }if(property)property->Release();
  if(formats!=lastFormats||contentRevision!=lastFormatRevision){lastFormats=formats;lastFormatRevision=contentRevision;emitNative(7,0,0,nullptr,0,selection.acpStart,selection.acpEnd,0);for(const auto& item:formats)emitNative(7,item.first,item.second,nullptr,0,selection.acpStart,selection.acpEnd,1);emitNative(7,0,0,nullptr,0,selection.acpStart,selection.acpEnd,2);}return S_OK;
 }
 void requestGeometry(LONG start,LONG end){end=std::min<LONG>(end,start+512);if(start==requestedStart&&end==requestedEnd)return;requestedStart=start;requestedEnd=end;emitNative(6,start,end,nullptr,0,selection.acpStart,selection.acpEnd,geometryRevision);}
 void characterBounds(uint32_t revision,LONG start,const LetterierImeRect* rects,ULONG length){if(revision!=geometryRevision||start<0||length>512||size_t(start)+length>text.size())return;geometryStart=start;geometry.assign(rects,rects+length);if(sink&&(sinkMask&TS_AS_LAYOUT_CHANGE))sink->OnLayoutChange(TS_LC_CHANGE,0);}
 void externalInsert(const std::wstring& value){LONG start=selection.acpStart,end=selection.acpEnd;text.replace(start,end-start,value);++contentRevision;invalidateGeometry();selection.acpStart=selection.acpEnd=start+LONG(value.size());emitNative(1,start,end,value.data(),ULONG(value.size()),selection.acpStart,selection.acpEnd);if(sink){TS_TEXTCHANGE c={start,end,selection.acpEnd};if(sinkMask&TS_AS_TEXT_CHANGE)sink->OnTextChange(0,&c);if(sinkMask&TS_AS_SEL_CHANGE)sink->OnSelectionChange();if(sinkMask&TS_AS_LAYOUT_CHANGE)sink->OnLayoutChange(TS_LC_CHANGE,0);}refresh();}
 void select(LONG start,LONG end){selection.acpStart=std::clamp<LONG>(start,0,LONG(text.size()));selection.acpEnd=std::clamp<LONG>(end,selection.acpStart,LONG(text.size()));if(sink&&(sinkMask&TS_AS_SEL_CHANGE))sink->OnSelectionChange();refresh();}
 HRESULT STDMETHODCALLTYPE AdviseSink(REFIID id,IUnknown* source,DWORD mask)override{if(id!=IID_ITextStoreACPSink)return E_INVALIDARG;if(!source)return E_POINTER;ITextStoreACPSink* next=nullptr;auto hr=source->QueryInterface(IID_PPV_ARGS(&next));if(FAILED(hr))return hr;if(sink)sink->Release();sink=next;sinkMask=mask;return S_OK;}
 HRESULT STDMETHODCALLTYPE UnadviseSink(IUnknown*)override{if(sink){sink->Release();sink=nullptr;}return S_OK;}
 HRESULT STDMETHODCALLTYPE RequestLock(DWORD flags,HRESULT* session)override{if(!session)return E_POINTER;if(!sink){*session=E_UNEXPECTED;return E_UNEXPECTED;}if(lock){if(flags&TS_LF_SYNC)*session=TS_E_SYNCHRONOUS;else{pending|=flags;*session=TS_S_ASYNC;}return S_OK;}lock=flags;*session=sink->OnLockGranted(flags);lock=0;while(pending){DWORD next=pending;pending=0;lock=next;sink->OnLockGranted(next);lock=0;}return S_OK;}
 HRESULT STDMETHODCALLTYPE GetStatus(TS_STATUS* s)override{if(!s)return E_POINTER;s->dwDynamicFlags=0;s->dwStaticFlags=TS_SS_NOHIDDENTEXT;return S_OK;}
 HRESULT STDMETHODCALLTYPE QueryInsert(LONG a,LONG b,ULONG,LONG* x,LONG* y)override{if(!x||!y)return E_POINTER;if(a<0||b<a||b>LONG(text.size()))return TS_E_INVALIDPOS;*x=a;*y=b;return S_OK;}
 HRESULT STDMETHODCALLTYPE GetSelection(ULONG index,ULONG count,TS_SELECTION_ACP* s,ULONG* got)override{if(!got)return E_POINTER;*got=0;if(index!=0&&index!=TS_DEFAULT_SELECTION)return E_INVALIDARG;if(count&&s){*s=selection;*got=1;}return S_OK;}
 HRESULT STDMETHODCALLTYPE SetSelection(ULONG count,const TS_SELECTION_ACP* s)override{if(count!=1||!s)return E_INVALIDARG;if(s->acpStart<0||s->acpEnd<s->acpStart||s->acpEnd>LONG(text.size()))return TS_E_INVALIDPOS;selection=*s;emitNative(2,0,0,nullptr,0,selection.acpStart,selection.acpEnd);refresh();return S_OK;}
 HRESULT STDMETHODCALLTYPE GetText(LONG start,LONG end,WCHAR* buffer,ULONG capacity,ULONG* copied,TS_RUNINFO* runs,ULONG runCapacity,ULONG* runCount,LONG* next)override{if(start<0||start>LONG(text.size()))return TS_E_INVALIDPOS;if(end==-1)end=LONG(text.size());if(end<start||end>LONG(text.size()))return TS_E_INVALIDPOS;ULONG n=std::min<ULONG>(ULONG(end-start),capacity);if(n&&buffer)std::copy_n(text.data()+start,n,buffer);if(copied)*copied=n;if(runCount){*runCount=runCapacity&&runs?1:0;if(*runCount)runs[0]={n,TS_RT_PLAIN};}if(next)*next=start+LONG(n);return S_OK;}
 HRESULT STDMETHODCALLTYPE SetText(DWORD,LONG start,LONG end,const WCHAR* value,ULONG length,TS_TEXTCHANGE* change)override{if(start<0||end<start||end>LONG(text.size())||(!value&&length))return TS_E_INVALIDPOS;text.replace(start,end-start,value?value:L"",length);++contentRevision;invalidateGeometry();selection.acpStart=selection.acpEnd=start+LONG(length);if(change)*change={start,end,selection.acpEnd};emitNative(1,start,end,value,length,selection.acpStart,selection.acpEnd);refresh();return S_OK;}
 HRESULT STDMETHODCALLTYPE GetFormattedText(LONG,LONG,IDataObject** p)override{if(p)*p=nullptr;return E_NOTIMPL;}
 HRESULT STDMETHODCALLTYPE GetEmbedded(LONG,REFGUID,REFIID,IUnknown** p)override{if(p)*p=nullptr;return TS_E_NOOBJECT;}
 HRESULT STDMETHODCALLTYPE QueryInsertEmbedded(const GUID*,const FORMATETC*,BOOL* yes)override{if(!yes)return E_POINTER;*yes=FALSE;return S_OK;}
 HRESULT STDMETHODCALLTYPE InsertEmbedded(DWORD,LONG,LONG,IDataObject*,TS_TEXTCHANGE*)override{return E_NOTIMPL;}
 HRESULT STDMETHODCALLTYPE InsertTextAtSelection(DWORD flags,const WCHAR* value,ULONG length,LONG* start,LONG* end,TS_TEXTCHANGE* change)override{LONG a=selection.acpStart,b=selection.acpEnd;if(start)*start=a;if(end)*end=flags&TS_IAS_QUERYONLY?b:a+LONG(length);if(flags&TS_IAS_QUERYONLY)return S_OK;return SetText(0,a,b,value,length,change);}
 HRESULT STDMETHODCALLTYPE InsertEmbeddedAtSelection(DWORD,IDataObject*,LONG*,LONG*,TS_TEXTCHANGE*)override{return E_NOTIMPL;}
 HRESULT STDMETHODCALLTYPE RequestSupportedAttrs(DWORD,ULONG count,const TS_ATTRID* attrs)override{requested.clear();for(ULONG i=0;i<count;i++)if(attrs[i]==TSATTRID_Text_VerticalWriting||attrs[i]==TSATTRID_Text_Orientation){requested.push_back(attrs[i]);logEvent(attrs[i]==TSATTRID_Text_VerticalWriting?"vertical-attribute-request":"orientation-attribute-request");}return S_OK;}
 HRESULT STDMETHODCALLTYPE RequestAttrsAtPosition(LONG,ULONG count,const TS_ATTRID* attrs,DWORD flags)override{return RequestSupportedAttrs(flags,count,attrs);}
 HRESULT STDMETHODCALLTYPE RequestAttrsTransitioningAtPosition(LONG,ULONG,const TS_ATTRID*,DWORD)override{requested.clear();return S_OK;}
 HRESULT STDMETHODCALLTYPE FindNextAttrTransition(LONG,LONG end,ULONG,const TS_ATTRID*,DWORD,LONG* next,BOOL* found,LONG* offset)override{if(next)*next=end;if(found)*found=FALSE;if(offset)*offset=0;return S_OK;}
 HRESULT STDMETHODCALLTYPE RetrieveRequestedAttrs(ULONG count,TS_ATTRVAL* values,ULONG* fetched)override{if(!fetched||(!values&&count))return E_POINTER;*fetched=std::min<ULONG>(count,ULONG(requested.size()));for(ULONG i=0;i<*fetched;i++){values[i].idAttr=requested[i];values[i].dwOverlapId=0;VariantInit(&values[i].varValue);if(requested[i]==TSATTRID_Text_VerticalWriting){values[i].varValue.vt=VT_BOOL;values[i].varValue.boolVal=VARIANT_TRUE;}else{values[i].varValue.vt=VT_I4;values[i].varValue.lVal=2700;}}requested.erase(requested.begin(),requested.begin()+*fetched);return S_OK;}
 HRESULT STDMETHODCALLTYPE GetEndACP(LONG* end)override{if(!end)return E_POINTER;*end=LONG(text.size());return S_OK;}
 HRESULT STDMETHODCALLTYPE GetActiveView(TsViewCookie* view)override{if(!view)return E_POINTER;*view=0;return S_OK;}
 HRESULT STDMETHODCALLTYPE GetACPFromPoint(TsViewCookie,const POINT* screen,DWORD flags,LONG* offset)override{if(!screen||!offset)return E_POINTER;double nearest=1e100;LONG at=-1;for(size_t i=0;i<geometry.size();++i){const RECT r=screenRect(geometry[i]);const double dx=screen->x<std::min(r.left,r.right)?r.left-screen->x:screen->x>r.right?screen->x-r.right:0,dy=screen->y<r.top?r.top-screen->y:screen->y>r.bottom?screen->y-r.bottom:0;const double distance=dx*dx+dy*dy;if(distance<nearest){nearest=distance;at=geometryStart+LONG(i);if(flags&GXFPF_ROUND_NEAREST&&screen->y>(r.top+r.bottom)/2)++at;}}if(at>=0&&(nearest==0||(flags&GXFPF_NEAREST))){*offset=at;return S_OK;}if(geometry.empty()){requestGeometry(std::max<LONG>(0,selection.acpStart-64),std::min<LONG>(LONG(text.size()),selection.acpEnd+64));return TS_E_NOLAYOUT;}return TS_E_INVALIDPOINT;}
 HRESULT STDMETHODCALLTYPE GetTextExt(TsViewCookie,LONG start,LONG end,RECT* rect,BOOL* clipped)override{
  if(!rect||!clipped)return E_POINTER;if(start<0||end<start||end>LONG(text.size()))return TS_E_INVALIDPOS;
  if(start==end&&start==selection.acpEnd)*rect=screenRect(selectionRect);
  else if(start>=geometryStart&&end<=geometryStart+LONG(geometry.size())&&start<geometryStart+LONG(geometry.size())){*rect=screenRect(geometry[start-geometryStart]);for(LONG i=start+1;i<end;++i){RECT next=screenRect(geometry[i-geometryStart]),united;UnionRect(&united,rect,&next);*rect=united;}if(start==end)rect->bottom=rect->top;}
  else{requestGeometry(start,std::max<LONG>(end,std::min<LONG>(LONG(text.size()),start+1)));return TS_E_NOLAYOUT;}
  if(rect->right<=rect->left)rect->right=rect->left+1;if(rect->bottom<=rect->top)rect->bottom=rect->top+1;const RECT visible=screenRect(controlRect);*clipped=rect->left<visible.left||rect->right>visible.right||rect->top<visible.top||rect->bottom>visible.bottom;return S_OK;
 }
 HRESULT STDMETHODCALLTYPE GetScreenExt(TsViewCookie,RECT* rect)override{if(!rect)return E_POINTER;*rect=screenRect(controlRect);return S_OK;}
 HRESULT STDMETHODCALLTYPE GetWnd(TsViewCookie,HWND* window)override{if(!window)return E_POINTER;*window=inputWindow;return S_OK;}
 HRESULT STDMETHODCALLTYPE OnStartComposition(ITfCompositionView*,BOOL* yes)override{if(!yes)return E_POINTER;*yes=TRUE;composing=true;lastFormatRevision=uint32_t(-1);emitNative(0,0,0,text.data(),ULONG(text.size()),selection.acpStart,selection.acpEnd);return S_OK;}
 HRESULT STDMETHODCALLTYPE OnUpdateComposition(ITfCompositionView*,ITfRange*)override{logEvent("composition-update");refresh();return S_OK;}
 HRESULT STDMETHODCALLTYPE OnEndComposition(ITfCompositionView*)override{composing=false;emitNative(3,0,0,nullptr,0,selection.acpStart,selection.acpEnd);return S_OK;}
};

static TextStore* store=nullptr;
#include "native_ime_candidates.h"
static bool copyText(const std::wstring& text){
 if(text.empty()||!OpenClipboard(inputWindow))return false;
 bool copied=false;const SIZE_T bytes=(text.size()+1)*sizeof(wchar_t);HGLOBAL memory=GlobalAlloc(GMEM_MOVEABLE,bytes);
 if(memory){auto buffer=GlobalLock(memory);if(buffer){memcpy(buffer,text.c_str(),bytes);GlobalUnlock(memory);if(EmptyClipboard()&&SetClipboardData(CF_UNICODETEXT,memory))copied=true;else GlobalFree(memory);}else GlobalFree(memory);}
 CloseClipboard();return copied;
}
static std::wstring pastedText(){std::wstring result;if(!OpenClipboard(inputWindow))return result;HANDLE data=GetClipboardData(CF_UNICODETEXT);if(data){auto buffer=static_cast<const wchar_t*>(GlobalLock(data));if(buffer){const size_t limit=std::min<size_t>(GlobalSize(data)/sizeof(wchar_t),2000000);size_t length=0;while(length<limit&&buffer[length])++length;result.assign(buffer,length);GlobalUnlock(data);}}CloseClipboard();return result;}
static void terminateComposition(){if(!context||!store||!store->composing)return;ITfContextOwnerCompositionServices* owner=nullptr;if(SUCCEEDED(context->QueryInterface(IID_PPV_ARGS(&owner)))){owner->TerminateComposition(nullptr);owner->Release();}}
static LRESULT CALLBACK inputProc(HWND window,UINT message,WPARAM w,LPARAM l){
 switch(message){
 case WM_SETFOCUS:if(manager&&documentManager)manager->SetFocus(documentManager);return 0;
 case WM_KILLFOCUS:terminateComposition();if(manager)manager->SetFocus(nullptr);emitNative(5,0,0,nullptr,0,0,0);return 0;
 case WM_KEYDOWN:if(store){UINT modifiers=((GetKeyState(VK_CONTROL)&0x8000)?1:0)|((GetKeyState(VK_SHIFT)&0x8000)?2:0)|((GetKeyState(VK_MENU)&0x8000)?4:0)|(store->composing?8:0);if((modifiers&5)==1&&!store->composing){if(w=='C'||w=='X'){const auto a=store->selection.acpStart,b=store->selection.acpEnd;if(a<b){const bool copied=copyText(store->text.substr(a,b-a));if(copied&&w=='X')store->externalInsert(L"");if(!copied)emitNative(9,0,0,nullptr,0,a,b);}return 0;}if(w=='V'){const auto pasted=pastedText();if(!pasted.empty())store->externalInsert(pasted);return 0;}}emitNative(4,0,0,nullptr,0,store->selection.acpStart,store->selection.acpEnd,UINT(w),modifiers);}return 0;
 case WM_CHAR:if(store&&!store->composing&&w>=32&&w!=0x7f){static wchar_t high=0;if(w>=0xD800&&w<=0xDBFF){high=wchar_t(w);return 0;}std::wstring value;if(high){value+=high;high=0;}value+=wchar_t(w);store->externalInsert(value);}return 0;
 case WM_GETDLGCODE:return DLGC_WANTALLKEYS|DLGC_WANTCHARS;
 case WM_CLOSE:PostMessageW(mainWindow,WM_CLOSE,0,0);return 0;
 }
 return DefWindowProcW(window,message,w,l);
}
static LRESULT CALLBACK getMessage(int code,WPARAM removed,LPARAM value){
 if(code>=0&&removed==PM_REMOVE&&!inHook&&keys){auto message=reinterpret_cast<MSG*>(value);if(message->hwnd==inputWindow&&(message->message==WM_KEYDOWN||message->message==WM_KEYUP)){inHook=true;BOOL consumed=FALSE;HRESULT result=message->message==WM_KEYDOWN?keys->TestKeyDown(message->wParam,message->lParam,&consumed):keys->TestKeyUp(message->wParam,message->lParam,&consumed);if(result==S_OK&&consumed){result=message->message==WM_KEYDOWN?keys->KeyDown(message->wParam,message->lParam,&consumed):keys->KeyUp(message->wParam,message->lParam,&consumed);if(result==S_OK&&consumed){message->message=WM_NULL;message->wParam=0;message->lParam=0;}}inHook=false;}}
 return CallNextHookEx(messageHook,code,removed,value);
}
extern "C" int32_t letterier_ime_stop(uint64_t session){
 if(session&&session!=currentSession)return 0;const bool restoreFocus=inputWindow&&GetFocus()==inputWindow;closing=true;
 LetterierCandidates::stop();
 if(editSource){if(textEditSinkCookie!=TF_INVALID_COOKIE)editSource->UnadviseSink(textEditSinkCookie);editSource->Release();editSource=nullptr;textEditSinkCookie=TF_INVALID_COOKIE;}
 terminateComposition();if(manager)manager->SetFocus(nullptr);
 if(messageHook){UnhookWindowsHookEx(messageHook);messageHook=nullptr;}
 if(documentManager)documentManager->Pop(TF_POPF_ALL);
 if(context){context->Release();context=nullptr;}if(documentManager){documentManager->Release();documentManager=nullptr;}
 if(keys){keys->Release();keys=nullptr;}if(manager){manager->Deactivate();manager->Release();manager=nullptr;}
 if(categories){categories->Release();categories=nullptr;}if(displayAttributes){displayAttributes->Release();displayAttributes=nullptr;}
 if(inputWindow){DestroyWindow(inputWindow);inputWindow=nullptr;}if(store){store->Release();store=nullptr;}
 callback=nullptr;callbackUser=nullptr;currentSession=0;closing=false;return restoreFocus?1:0;
}
extern "C" int32_t letterier_ime_start(intptr_t parent,uint64_t session,const uint16_t* text,uint32_t length,int32_t start,int32_t end,LetterierImeCallback emit,void* user){
 letterier_ime_stop(0);mainWindow=reinterpret_cast<HWND>(parent);currentSession=session;sequence=0;callback=emit;callbackUser=user;
 static ATOM registered=0;if(!registered){WNDCLASSW cls={};cls.hInstance=GetModuleHandleW(nullptr);cls.lpfnWndProc=inputProc;cls.lpszClassName=L"LetterierNativeTextInput";registered=RegisterClassW(&cls);if(!registered)return int32_t(HRESULT_FROM_WIN32(GetLastError()));}
 inputWindow=CreateWindowExW(WS_EX_NOACTIVATE,L"LetterierNativeTextInput",L"",WS_CHILD|WS_VISIBLE,-10,-10,1,1,mainWindow,nullptr,GetModuleHandleW(nullptr),nullptr);if(!inputWindow){letterier_ime_stop(0);return E_FAIL;}
 auto result=CoCreateInstance(CLSID_TF_ThreadMgr,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&manager));TfClientId client=0;if(SUCCEEDED(result))result=manager->Activate(&client);if(SUCCEEDED(result))result=manager->CreateDocumentMgr(&documentManager);
 store=new TextStore;store->text.assign(reinterpret_cast<const wchar_t*>(text),length);store->selection.acpStart=start;store->selection.acpEnd=end;TfEditCookie editCookie=0;
 if(SUCCEEDED(result))result=documentManager->CreateContext(client,0,static_cast<ITextStoreACP*>(store),&context,&editCookie);if(SUCCEEDED(result))result=documentManager->Push(context);
 // CreateContext queries the text store for ITfContextOwnerCompositionSink
 // and installs it itself. This interface is not an ITfSource advise sink.
 if(SUCCEEDED(result))result=manager->QueryInterface(IID_PPV_ARGS(&keys));
 if(SUCCEEDED(result)){
  CoCreateInstance(CLSID_TF_CategoryMgr,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&categories));CoCreateInstance(CLSID_TF_DisplayAttributeMgr,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&displayAttributes));
  if(SUCCEEDED(context->QueryInterface(IID_PPV_ARGS(&editSource))))editSource->AdviseSink(IID_ITfTextEditSink,static_cast<ITfTextEditSink*>(store),&textEditSinkCookie);
 }
 if(SUCCEEDED(result))LetterierCandidates::start(mainWindow,manager);
 if(SUCCEEDED(result)){ITfDocumentMgr* previous=nullptr;result=manager->AssociateFocus(inputWindow,documentManager,&previous);if(previous)previous->Release();}
 if(SUCCEEDED(result)){messageHook=SetWindowsHookExW(WH_GETMESSAGE,getMessage,nullptr,GetCurrentThreadId());if(!messageHook)result=HRESULT_FROM_WIN32(GetLastError());}
 if(FAILED(result))letterier_ime_stop(0);return result;
}
extern "C" int32_t letterier_ime_sync(uint64_t session,const uint16_t* text,uint32_t length,int32_t start,int32_t end){
 if(session!=currentSession||!store)return E_ABORT;if(store->composing)return S_FALSE;
 const std::wstring next(reinterpret_cast<const wchar_t*>(text),length);programmatic=true;if(store->text!=next){store->select(0,LONG(store->text.size()));store->externalInsert(next);}store->select(start,end);programmatic=false;return S_OK;
}
extern "C" void letterier_ime_selection(uint64_t session,int32_t start,int32_t end){if(session!=currentSession||!store||store->composing)return;programmatic=true;store->select(start,end);programmatic=false;}
extern "C" void letterier_ime_bounds(uint64_t session,LetterierImeRect control,LetterierImeRect selection,double scale){if(session!=currentSession)return;const bool changed=memcmp(&controlRect,&control,sizeof(control))||memcmp(&selectionRect,&selection,sizeof(selection))||displayScale!=scale;controlRect=control;selectionRect=selection;displayScale=scale;LetterierCandidates::moved(screenRect(selection));if(store&&changed){store->invalidateGeometry();store->layoutChanged();}}
extern "C" void letterier_ime_characters(uint64_t session,uint32_t revision,int32_t start,const LetterierImeRect* rects,uint32_t length){if(session==currentSession&&store)store->characterBounds(revision,start,rects,length);}
extern "C" void letterier_ime_focus(uint64_t session){if(session!=currentSession||!inputWindow)return;if(GetAncestor(GetForegroundWindow(),GA_ROOT)!=mainWindow)return;SetFocus(inputWindow);}
