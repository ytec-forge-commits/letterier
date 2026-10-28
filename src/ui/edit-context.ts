// EditContext keeps Windows' candidate UI independent of the vertical DOM's
// writing mode. The document remains the authority; preedit is temporary DOM.
import {NativeInputContext,nativeImeAvailable} from './native-ime';
interface TextUpdate extends Event {updateRangeStart:number;updateRangeEnd:number;text:string;selectionStart:number;selectionEnd:number}
interface CharacterRequest extends Event {rangeStart:number;rangeEnd:number}
interface FormatUpdate extends Event {getTextFormats():{rangeStart:number;rangeEnd:number;underlineThickness:string}[]}
interface Context extends EventTarget {
 text:string;selectionStart:number;selectionEnd:number;
 updateText(start:number,end:number,text:string):void;
 updateSelection(start:number,end:number):void;
 updateControlBounds(rect:DOMRect):void;
 updateSelectionBounds(rect:DOMRect):void;
 updateCharacterBounds(start:number,rects:DOMRect[]):void;
}
type Host=HTMLElement&{editContext?:Context|null};
type RangeOffsets={start:number;end:number};
export interface EditContextBinding {native?:boolean;sync(text:string,selection:RangeOffsets):void;bounds():void;dispose():void}
export function cancelBodyPreedit():void {
 for(const host of document.querySelectorAll('.page-edit[data-ime-composing],.paper-scroll[data-ime-composing]'))host.dispatchEvent(new Event('letterier-before-document-change'));
}
interface Callbacks {
 snapshot():{text:string;selection:RangeOffsets};
 begin():void;
 finish(change:{start:number;end:number;text:string}|null,selection:RangeOffsets,cancelled:boolean,previewPage?:number):void;
 abort():void;
 insert(start:number,end:number,text:string):void;
}

// extractContents clones partially selected ancestors. Keep the original node
// identities so React can reconcile its own lines after preedit ends.
function preserveDom(root:Node):()=>void {
 const entries:{node:Node;children:Node[];text:string|null}[]=[];
 const visit=(node:Node)=>{entries.push({node,children:Array.from(node.childNodes),text:node.nodeType===Node.TEXT_NODE?node.nodeValue:null});for(const child of node.childNodes)visit(child);};
 visit(root);
 return()=>{for(const {node,children,text} of entries){if(text!==null){node.nodeValue=text;continue;}if(node.childNodes.length!==children.length||children.some((child,i)=>node.childNodes[i]!==child)){while(node.firstChild)node.removeChild(node.firstChild);for(const child of children)node.appendChild(child);}}};
}

export function bindEditContext(host:HTMLElement,callbacks:Callbacks):EditContextBinding|null {
 const Constructor=(window as unknown as {EditContext?:new(options:{text:string;selectionStart:number;selectionEnd:number})=>Context}).EditContext;
 const native=nativeImeAvailable();
 if(!native&&!Constructor)return null;
 const create=(options:{text:string;selectionStart:number;selectionEnd:number}):Context=>native?new NativeInputContext(host,options):new Constructor!(options);
 const active=document.activeElement===host;
 const initial=active?callbacks.snapshot():{text:'',selection:{start:0,end:0}};
 let context=create({text:active?initial.text:'',selectionStart:active?initial.selection.start:0,selectionEnd:active?initial.selection.end:0});
 let composing=false,resetting=false,before=initial.text,preview:HTMLSpanElement|null=null,restoreDom:(()=>void)|null=null,previewRange:Range|null=null;
 let previewStart=0,beforeSelection=initial.selection,changeEnd=0,lastLength=0,seenUpdate=false,preeditText='';
 let highlighted=false;
 let removedFromDom=false;
 const clearHighlight=()=>{if(highlighted){CSS.highlights?.delete('letterier-ime-target');highlighted=false;}};
 const rectAt=(offset:number,character=false):DOMRect=>{
  const previewLength=preview?.textContent?.length??0;
  if(preview?.firstChild&&offset>=previewStart&&(character?offset<previewStart+previewLength:offset<=previewStart+previewLength)){
   const length=preview.firstChild.textContent?.length??0,at=Math.min(offset-previewStart,length);const range=document.createRange();range.setStart(preview.firstChild,at);range.setEnd(preview.firstChild,character?Math.min(length,at+1):at);return range.getBoundingClientRect();
  }
  const originalOffset=preview&&offset>=previewStart+previewLength?offset-previewLength+(changeEnd-previewStart):offset;
  for(const node of host.querySelectorAll<HTMLElement>('[data-offset]')){
   const start=Number(node.dataset.offset),end=Number(node.dataset.end);
   if(originalOffset<start||(character?originalOffset>=end:originalOffset>end)||!node.firstChild)continue;
   const removed=preview&&removedFromDom?Math.max(0,Math.min(originalOffset,changeEnd)-Math.max(start,previewStart)):0;
   let at=node.dataset.empty!==undefined?0:Math.max(0,originalOffset-start-removed);
   const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT,{acceptNode:text=>preview?.contains(text)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
   let text=walker.nextNode();while(text){const length=text.textContent?.length??0,next=walker.nextNode();if(at<length||!character&&at===length||!next){at=Math.min(at,length);const range=document.createRange();range.setStart(text,at);range.setEnd(text,character?Math.min(length,at+1):at);return range.getBoundingClientRect();}at-=length;text=next;}
  }
  return host.getBoundingClientRect();
 };
 const bounds=()=>{
  if(document.activeElement!==host)return;
  context.updateControlBounds(host.getBoundingClientRect());
  const selected=window.getSelection();
  let r:DOMRect;
  if((!preview||host.contains(preview))&&selected?.focusNode&&host.contains(selected.focusNode)){const range=document.createRange();range.setStart(selected.focusNode,selected.focusOffset);range.collapse(true);r=range.getBoundingClientRect();}else r=rectAt(context.selectionEnd);
  context.updateSelectionBounds(new DOMRect(r.x,r.y,Math.max(1,r.width),Math.max(1,r.height)));
 };
 const sync=(text:string,selection:RangeOffsets)=>{
  if(document.activeElement!==host){if(!native&&!composing&&context.text){context.updateText(0,context.text.length,'');context.updateSelection(0,0);}return;}
  // A toolbar action such as Undo can replace the rendered lines without
  // blurring this host. Its old preedit snapshot must never overwrite them.
  if(composing&&preview&&!preview.isConnected){
   clearHighlight();preview=null;restoreDom=null;previewRange=null;composing=false;delete host.dataset.imeComposing;callbacks.abort();
   resetContext(text,selection);
  }
  if(composing){bounds();return;}
  if(context.text!==text)context.updateText(0,context.text.length,text);
  const start=Math.max(0,Math.min(text.length,selection.start)),end=Math.max(start,Math.min(text.length,selection.end));
  if(context.selectionStart!==start||context.selectionEnd!==end)context.updateSelection(start,end);
  bounds();
 };
 const focus=()=>{const s=callbacks.snapshot();sync(s.text,s.selection);if(context instanceof NativeInputContext)context.focus();};
 const blur=()=>{if(context instanceof NativeInputContext){
  // Moving OS focus to our native child also blurs WebView2, while its DOM
  // activeElement remains this host. Native WM_KILLFOCUS owns that transition.
  if(document.activeElement!==host&&!composing)context.suspend();return;
 }if(!composing){context.updateText(0,context.text.length,'');context.updateSelection(0,0);}};
 const begin=()=>{
  if(resetting)return;
  composing=true;host.dataset.imeComposing='true';before=context.text;beforeSelection={start:context.selectionStart,end:context.selectionEnd};callbacks.begin();
  const selected=window.getSelection();
  previewRange=selected?.rangeCount?selected.getRangeAt(0).cloneRange():null;
  previewStart=context.selectionStart;
  changeEnd=context.selectionEnd;lastLength=before.length;seenUpdate=false;preeditText='';
  if(previewRange){
   const insertion=previewRange.cloneRange();insertion.collapse(true);
   const startPage=previewRange.startContainer.parentElement?.closest('.page-edit'),endPage=previewRange.endContainer.parentElement?.closest('.page-edit');
   const inside=!!startPage&&startPage===endPage;
   const ancestor=inside?previewRange.commonAncestorContainer:insertion.startContainer;
   restoreDom=preserveDom(ancestor.nodeType===Node.TEXT_NODE?ancestor.parentNode!:ancestor);
   // Never extract a selection spanning separate editable page hosts.
   removedFromDom=inside;if(inside)previewRange.extractContents();
   preview=document.createElement('span');preview.dataset.imePreedit='';preview.style.textDecoration='underline';preview.style.whiteSpace='pre-wrap';insertion.insertNode(preview);
  }
 };
 const update=(event:Event)=>{
  if(resetting)return;
  const e=event as TextUpdate;
  if(composing){
   if(!seenUpdate){previewStart=e.updateRangeStart;changeEnd=e.updateRangeEnd;seenUpdate=true;}
   else {const previousEnd=changeEnd+lastLength-before.length;if(e.updateRangeEnd>previousEnd)changeEnd+=e.updateRangeEnd-previousEnd;previewStart=Math.min(previewStart,e.updateRangeStart);}
   lastLength=context.text.length;
   preeditText=context.text.slice(previewStart,context.text.length-(before.length-changeEnd));
   if(preview){
    clearHighlight();
    preview.textContent=preeditText;
    // A cross-page selection belongs to the focused page's EditContext. Moving
    // DOM focus to the preview on another page would terminate that composition.
    if(preview.firstChild&&host.contains(preview)){const length=preeditText.length;window.getSelection()?.setBaseAndExtent(preview.firstChild,Math.max(0,Math.min(length,e.selectionStart-previewStart)),preview.firstChild,Math.max(0,Math.min(length,e.selectionEnd-previewStart)));}
    // A selection can begin on an earlier page while the viewport remains at
    // its end. DOM insertion may focus that earlier host without scrolling it.
    preview.scrollIntoView({block:'nearest',inline:'nearest'});
   }
   bounds();
  }else callbacks.insert(e.updateRangeStart,e.updateRangeEnd,e.text);
 };
 const end=()=>{
  if(resetting||!composing)return;
  clearHighlight();
  // A cancelled reconversion removes the preedit from EditContext's buffer;
  // it does not put the replaced selection back. Preserve the real document.
  const cancelled=!seenUpdate||preeditText==='';
  const selection=cancelled?beforeSelection:{start:context.selectionStart,end:context.selectionEnd};
  const previewPage=Number(preview?.closest<HTMLElement>('.page-edit')?.dataset.pageIndex??host.dataset.pageIndex);
  // Restore browser-owned preedit DOM before React reconciles the real edit.
  if(preview)preview.remove();restoreDom?.();
  preview=null;restoreDom=null;previewRange=null;composing=false;delete host.dataset.imeComposing;
  const change=cancelled||before.slice(previewStart,changeEnd)===preeditText?null:{start:previewStart,end:changeEnd,text:preeditText};
  callbacks.finish(change,selection,cancelled,previewPage);
 };
 const characters=(event:Event)=>{const e=event as CharacterRequest;const rects=[];for(let i=e.rangeStart;i<Math.min(e.rangeEnd,context.text.length);i++)rects.push(rectAt(i,true));context.updateCharacterBounds(e.rangeStart,rects);};
 const formats=(event:Event)=>{
  clearHighlight();if(!preview?.firstChild||!CSS.highlights||typeof Highlight==='undefined')return;
  const ranges:Range[]=[],length=preview.textContent?.length??0;
  for(const format of (event as FormatUpdate).getTextFormats())if(format.underlineThickness==='thick'){
   const start=Math.max(0,format.rangeStart-previewStart),end=Math.min(length,format.rangeEnd-previewStart);if(end<=start)continue;
   const range=document.createRange();range.setStart(preview.firstChild,start);range.setEnd(preview.firstChild,end);ranges.push(range);
  }
  if(ranges.length){CSS.highlights.set('letterier-ime-target',new Highlight(...ranges));highlighted=true;}
 };
 const nativeSelection=()=>{
  const selection={start:context.selectionStart,end:context.selectionEnd};
  if(!composing){callbacks.finish(null,selection,false);return;}
  if(preview?.firstChild){const length=preview.textContent?.length??0;window.getSelection()?.setBaseAndExtent(preview.firstChild,Math.max(0,Math.min(length,selection.start-previewStart)),preview.firstChild,Math.max(0,Math.min(length,selection.end-previewStart)));}
  bounds();
 };
 const listen=(target:Context,add:boolean)=>{
  for(const [type,handler] of [['compositionstart',begin],['textupdate',update],['compositionend',end],['characterboundsupdate',characters],['textformatupdate',formats],['selectionchange',nativeSelection]] as const)target[add?'addEventListener':'removeEventListener'](type,handler);
 };
 const resetContext=(text:string,selection:RangeOffsets)=>{
  // Windows can deliver queued events after cancellation. Retire the old
  // object and its listeners instead of letting them mutate the new document.
  const focused=document.activeElement===host;
  resetting=true;try{listen(context,false);if(context instanceof NativeInputContext)context.dispose();else (host as Host).editContext=null;if(focused)host.blur();context=create({text,selectionStart:selection.start,selectionEnd:selection.end});listen(context,true);if(!native)(host as Host).editContext=context;if(focused){host.focus({preventScroll:true});if(context instanceof NativeInputContext)context.focus();}}finally{resetting=false;}
 };
 const cancelForChange=()=>{
  if(!composing)return;
  clearHighlight();preview?.remove();restoreDom?.();preview=null;restoreDom=null;previewRange=null;composing=false;delete host.dataset.imeComposing;
  resetContext(before,beforeSelection);
  callbacks.abort();
 };
 listen(context,true);
 host.addEventListener('letterier-before-document-change',cancelForChange);
 host.addEventListener('focus',focus);host.addEventListener('blur',blur);if(native){host.dataset.nativeIme='true';if(active)focus();}else (host as Host).editContext=context;
 return {native,sync,bounds,dispose(){clearHighlight();host.removeEventListener('letterier-before-document-change',cancelForChange);host.removeEventListener('focus',focus);host.removeEventListener('blur',blur);listen(context,false);if(context instanceof NativeInputContext)context.dispose();if(composing){if(preview)preview.remove();if(host.isConnected)restoreDom?.();restoreDom=null;composing=false;delete host.dataset.imeComposing;callbacks.abort();}delete host.dataset.nativeIme;if(!native)(host as Host).editContext=null;}};
}
