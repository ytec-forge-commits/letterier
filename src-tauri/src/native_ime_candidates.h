#pragma once
#include <richedit.h>

// The system RichEdit renderer handles vertical glyph shaping, surrogate pairs,
// combining marks and scrolling. Candidate text is never shortened for display.
namespace LetterierCandidates {
static HWND owner=nullptr,popup=nullptr,view=nullptr,previousButton=nullptr,nextButton=nullptr,pageLabel=nullptr;
static WNDPROC richProc=nullptr,buttonProc=nullptr;
static ITfUIElementMgr* elements=nullptr;
static ITfThreadMgr* threadManager=nullptr;
static ITfSource* source=nullptr;
static DWORD sinkCookie=TF_INVALID_COOKIE,active=DWORD(-1);
static ITfCandidateListUIElementBehavior* behavior=nullptr;
static std::vector<std::pair<LONG,LONG>> ranges;
static UINT count=0,selected=0,pageStart=0;
static RECT anchor={};
static int desiredWidth=320,desiredHeight=180;
static bool google=false,rebuilding=false;
static constexpr UINT pageSize=9;
static bool update(DWORD id,bool keepPage=false);
static void detectGoogle(ITfThreadMgr* manager);
static void page(bool forward){if(active==DWORD(-1))return;if(forward){if(pageStart+pageSize<count)pageStart+=pageSize;}else if(pageStart>=pageSize)pageStart-=pageSize;update(active,true);}
static LRESULT CALLBACK pageButtonProc(HWND window,UINT message,WPARAM w,LPARAM l){if(message==WM_MOUSEACTIVATE)return MA_NOACTIVATE;if(message==WM_LBUTTONDOWN){SendMessageW(popup,WM_COMMAND,MAKEWPARAM(GetDlgCtrlID(window),BN_CLICKED),reinterpret_cast<LPARAM>(window));return 0;}if(message==WM_LBUTTONUP)return 0;return CallWindowProcW(buttonProc,window,message,w,l);}

static void hide(){if(popup)ShowWindow(popup,SW_HIDE);ranges.clear();active=DWORD(-1);count=0;if(behavior){behavior->Release();behavior=nullptr;}}
static void choose(UINT index){
 if(!behavior||index>=count)return;
 // Google may synchronously end this UI element during SetSelection.
 auto action=behavior;action->AddRef();
 const auto result=action->SetSelection(index);
 if(SUCCEEDED(result))action->Finalize();
 action->Release();
}
static LRESULT CALLBACK richWindowProc(HWND window,UINT message,WPARAM w,LPARAM l){
 if(message==WM_MOUSEACTIVATE)return MA_NOACTIVATE;
 if(message==WM_LBUTTONDOWN){POINTL point={short(LOWORD(l)),short(HIWORD(l))};LONG at=LONG(SendMessageW(window,EM_CHARFROMPOS,0,reinterpret_cast<LPARAM>(&point)));for(UINT i=0;i<ranges.size();++i)if(at>=ranges[i].first&&at<ranges[i].second){choose(pageStart+i);break;}return 0;}
 if(message==WM_LBUTTONUP||message==WM_LBUTTONDBLCLK)return 0;
 return CallWindowProcW(richProc,window,message,w,l);
}
static LRESULT CALLBACK popupProc(HWND window,UINT message,WPARAM w,LPARAM l){
 if(message==WM_MOUSEACTIVATE)return MA_NOACTIVATE;
 if(message==WM_COMMAND&&HIWORD(w)==BN_CLICKED){if(LOWORD(w)==10)page(false);else if(LOWORD(w)==11)page(true);return 0;}
 if(message==WM_SIZE){const int width=LOWORD(l),height=HIWORD(l),footer=MulDiv(34,GetDpiForWindow(window),96),third=width/3;if(view)MoveWindow(view,0,0,width,std::max(1,height-footer),TRUE);if(previousButton)MoveWindow(previousButton,0,height-footer,third,footer,TRUE);if(nextButton)MoveWindow(nextButton,third,height-footer,third,footer,TRUE);if(pageLabel)MoveWindow(pageLabel,third*2,height-footer,width-third*2,footer,TRUE);return 0;}
 return DefWindowProcW(window,message,w,l);
}
static bool create(){
 if(popup)return true;
 static HMODULE richLibrary=LoadLibraryExW(L"msftedit.dll",nullptr,LOAD_LIBRARY_SEARCH_SYSTEM32);
 if(!richLibrary)return false;
 static ATOM registered=0;if(!registered){WNDCLASSW cls={};cls.hInstance=GetModuleHandleW(nullptr);cls.lpfnWndProc=popupProc;cls.lpszClassName=L"LetterierVerticalCandidates";cls.hbrBackground=GetSysColorBrush(COLOR_WINDOW);registered=RegisterClassW(&cls);if(!registered)return false;}
 popup=CreateWindowExW(WS_EX_NOACTIVATE|WS_EX_TOOLWINDOW,L"LetterierVerticalCandidates",L"レタリエ 縦書き変換候補",WS_POPUP|WS_BORDER,0,0,440,350,owner,nullptr,GetModuleHandleW(nullptr),nullptr);
 if(!popup)return false;
 view=CreateWindowExW(WS_EX_NOACTIVATE,MSFTEDIT_CLASS,L"",WS_CHILD|WS_VISIBLE|WS_HSCROLL|ES_MULTILINE|ES_READONLY|ES_VERTICAL|ES_NOHIDESEL,0,0,438,314,popup,nullptr,GetModuleHandleW(nullptr),nullptr);
 if(!view){DestroyWindow(popup);popup=nullptr;return false;}
 richProc=reinterpret_cast<WNDPROC>(SetWindowLongPtrW(view,GWLP_WNDPROC,reinterpret_cast<LONG_PTR>(richWindowProc)));
 previousButton=CreateWindowExW(WS_EX_NOACTIVATE,L"BUTTON",L"◀ 前の候補",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,0,314,146,34,popup,reinterpret_cast<HMENU>(10),nullptr,nullptr);
 nextButton=CreateWindowExW(WS_EX_NOACTIVATE,L"BUTTON",L"次の候補 ▶",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,146,314,146,34,popup,reinterpret_cast<HMENU>(11),nullptr,nullptr);
 pageLabel=CreateWindowExW(WS_EX_NOACTIVATE,L"STATIC",L"",WS_CHILD|WS_VISIBLE|SS_CENTER|SS_CENTERIMAGE,292,314,146,34,popup,nullptr,nullptr,nullptr);
 if(!previousButton||!nextButton||!pageLabel){DestroyWindow(popup);popup=view=previousButton=nextButton=pageLabel=nullptr;return false;}
 buttonProc=reinterpret_cast<WNDPROC>(SetWindowLongPtrW(previousButton,GWLP_WNDPROC,reinterpret_cast<LONG_PTR>(pageButtonProc)));SetWindowLongPtrW(nextButton,GWLP_WNDPROC,reinterpret_cast<LONG_PTR>(pageButtonProc));
 for(HWND control:{previousButton,nextButton,pageLabel})SendMessageW(control,WM_SETFONT,reinterpret_cast<WPARAM>(GetStockObject(DEFAULT_GUI_FONT)),TRUE);
 SendMessageW(view,EM_SETBKGNDCOLOR,0,GetSysColor(COLOR_WINDOW));SendMessageW(view,EM_SETEVENTMASK,0,0);return true;
}
static void position(){
 if(!popup||!IsWindowVisible(popup))return;
 if(GetAncestor(GetForegroundWindow(),GA_ROOT)!=owner){ShowWindow(popup,SW_HIDE);return;}
 MONITORINFO info={sizeof(info)};GetMonitorInfoW(MonitorFromRect(&anchor,MONITOR_DEFAULTTONEAREST),&info);
 const double dpi=double(GetDpiForWindow(owner))/96.;
 const int width=std::min(int(desiredWidth*dpi),int(info.rcWork.right-info.rcWork.left-16));
 const int height=std::min(int(desiredHeight*dpi),int(info.rcWork.bottom-info.rcWork.top-16));
 const int x=std::clamp(int(anchor.left)-width,int(info.rcWork.left+8),int(info.rcWork.right-width-8));
 const int y=std::clamp(int(anchor.top),int(info.rcWork.top+8),int(info.rcWork.bottom-height-8));
 SetWindowPos(popup,HWND_TOP,x,y,width,height,SWP_NOACTIVATE);
}
static bool update(DWORD id,bool keepPage){
 if(rebuilding)return active==id;if(!elements||!google)return false;
 ITfUIElement* element=nullptr;if(FAILED(elements->GetUIElement(id,&element)))return false;
 ITfCandidateListUIElement* list=nullptr;ITfCandidateListUIElementBehavior* next=nullptr;
 HRESULT result=element->QueryInterface(IID_PPV_ARGS(&list));if(SUCCEEDED(result))result=element->QueryInterface(IID_PPV_ARGS(&next));
 if(FAILED(result)||!create()){if(list)list->Release();if(next)next->Release();element->Release();return false;}
 UINT nextCount=0,nextSelected=0;result=list->GetCount(&nextCount);if(SUCCEEDED(result))result=list->GetSelection(&nextSelected);
 if(FAILED(result)||!nextCount||nextCount>1000000||nextSelected>=nextCount){list->Release();next->Release();element->Release();return false;}
 if(!keepPage||id!=active)pageStart=(nextSelected/pageSize)*pageSize;
 std::wstring display;std::vector<std::pair<LONG,LONG>> nextRanges;UINT longest=0;
 for(UINT i=pageStart;i<std::min(nextCount,pageStart+pageSize);++i){BSTR word=nullptr;result=list->GetString(i,&word);if(FAILED(result)||!word){if(word)SysFreeString(word);break;}
  const auto length=SysStringLen(word);if(length>2000000||display.size()+length>2000000){SysFreeString(word);result=E_OUTOFMEMORY;break;}
  longest=std::max(longest,length);const LONG start=LONG(display.size());display+=std::to_wstring(i+1)+L"　";display.append(word,length);SysFreeString(word);nextRanges.push_back({start,LONG(display.size())});display+=L"\r";
 }
 list->Release();if(FAILED(result)){next->Release();element->Release();return false;}
 rebuilding=true;if(behavior)behavior->Release();behavior=next;active=id;count=nextCount;selected=nextSelected;ranges=std::move(nextRanges);
 desiredWidth=std::clamp(int(ranges.size())*32+24,320,440);desiredHeight=std::clamp(int(std::min<UINT>(longest,20)+4)*18+34,150,400);
 const auto label=std::to_wstring(pageStart/pageSize+1)+L" / "+std::to_wstring((count+pageSize-1)/pageSize);SetWindowTextW(pageLabel,label.c_str());EnableWindow(previousButton,pageStart>=pageSize);EnableWindow(nextButton,pageStart+pageSize<count);
 SendMessageW(view,WM_SETREDRAW,FALSE,0);SetWindowTextW(view,display.c_str());
 CHARFORMAT2W format={};format.cbSize=sizeof(format);format.dwMask=CFM_FACE|CFM_SIZE|CFM_COLOR|CFM_BACKCOLOR;format.yHeight=240;format.crTextColor=GetSysColor(COLOR_WINDOWTEXT);format.crBackColor=GetSysColor(COLOR_WINDOW);lstrcpyW(format.szFaceName,L"Yu Gothic UI");SendMessageW(view,EM_SETCHARFORMAT,SCF_ALL,reinterpret_cast<LPARAM>(&format));
 if(selected>=pageStart&&selected-pageStart<ranges.size()){const auto range=ranges[selected-pageStart];SendMessageW(view,EM_SETSEL,range.first,range.second);format.dwMask=CFM_COLOR|CFM_BACKCOLOR;format.crTextColor=GetSysColor(COLOR_HIGHLIGHTTEXT);format.crBackColor=GetSysColor(COLOR_HIGHLIGHT);SendMessageW(view,EM_SETCHARFORMAT,SCF_SELECTION,reinterpret_cast<LPARAM>(&format));SendMessageW(view,EM_SCROLLCARET,0,0);}else SendMessageW(view,EM_SETSEL,-1,0);
 SendMessageW(view,WM_SETREDRAW,TRUE,0);InvalidateRect(view,nullptr,TRUE);InvalidateRect(popup,nullptr,TRUE);ShowWindow(popup,SW_SHOWNOACTIVATE);position();rebuilding=false;element->Release();return true;
}
class Observer final:public ITfUIElementSink {
 LONG refs=1;
public:
 HRESULT STDMETHODCALLTYPE QueryInterface(REFIID id,void** out)override{if(!out)return E_POINTER;*out=nullptr;if(id!=IID_IUnknown&&id!=IID_ITfUIElementSink)return E_NOINTERFACE;*out=static_cast<ITfUIElementSink*>(this);AddRef();return S_OK;}
 ULONG STDMETHODCALLTYPE AddRef()override{return InterlockedIncrement(&refs);}
 ULONG STDMETHODCALLTYPE Release()override{auto n=InterlockedDecrement(&refs);if(!n)delete this;return n;}
 HRESULT STDMETHODCALLTYPE BeginUIElement(DWORD id,BOOL* show)override{if(threadManager)detectGoogle(threadManager);if(show)*show=TRUE;if(update(id)&&show)*show=FALSE;return S_OK;}
 HRESULT STDMETHODCALLTYPE UpdateUIElement(DWORD id)override{if(!update(id)&&id==active){ITfUIElement* item=nullptr;if(SUCCEEDED(elements->GetUIElement(id,&item))){item->Show(TRUE);item->Release();}hide();}return S_OK;}
 HRESULT STDMETHODCALLTYPE EndUIElement(DWORD id)override{if(id==active)hide();return S_OK;}
};
static void stop(){
 hide();if(source){if(sinkCookie!=TF_INVALID_COOKIE)source->UnadviseSink(sinkCookie);source->Release();source=nullptr;}sinkCookie=TF_INVALID_COOKIE;
 if(elements){elements->Release();elements=nullptr;}if(popup)DestroyWindow(popup);popup=view=previousButton=nextButton=pageLabel=nullptr;owner=nullptr;threadManager=nullptr;
}
static void detectGoogle(ITfThreadMgr* manager){
 google=false;ITfInputProcessorProfileMgr* profiles=nullptr;ITfInputProcessorProfiles* descriptions=nullptr;
 if(FAILED(manager->QueryInterface(IID_PPV_ARGS(&profiles))))CoCreateInstance(CLSID_TF_InputProcessorProfiles,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&profiles));
 if(profiles){TF_INPUTPROCESSORPROFILE profile={};if(SUCCEEDED(profiles->GetActiveProfile(GUID_TFCAT_TIP_KEYBOARD,&profile))&&SUCCEEDED(CoCreateInstance(CLSID_TF_InputProcessorProfiles,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&descriptions)))){BSTR name=nullptr;if(SUCCEEDED(descriptions->GetLanguageProfileDescription(profile.clsid,profile.langid,profile.guidProfile,&name))){google=name&&std::wstring(name,SysStringLen(name)).find(L"Google")!=std::wstring::npos;SysFreeString(name);}descriptions->Release();}profiles->Release();}
}
static void start(HWND parent,ITfThreadMgr* manager){
 stop();owner=parent;threadManager=manager;detectGoogle(manager);if(FAILED(manager->QueryInterface(IID_PPV_ARGS(&elements))))return;
 if(SUCCEEDED(manager->QueryInterface(IID_PPV_ARGS(&source)))){auto observer=new Observer;source->AdviseSink(IID_ITfUIElementSink,observer,&sinkCookie);observer->Release();}
}
static void moved(RECT rect){anchor=rect;position();}
}
