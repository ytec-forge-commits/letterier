import {invoke,isTauri} from '@tauri-apps/api/core';
import {listen} from '@tauri-apps/api/event';

interface NativeEvent {kind:number;session:number;sequence:number;start:number;end:number;selectionStart:number;selectionEnd:number;text:number[];key:number;modifiers:number}
interface Options {text:string;selectionStart:number;selectionEnd:number}
type Box={x:number;y:number;width:number;height:number};
const box=(r:DOMRect):Box=>({x:r.x,y:r.y,width:r.width,height:r.height});
const emptyBox:Box={x:0,y:0,width:1,height:1};
let available=false,prepared:Promise<boolean>|undefined,sessionCounter=0;
const connections=new Map<number,NativeInputContext>();
let commands:Promise<unknown>=Promise.resolve();
const send=(request:Record<string,unknown>)=>{const next=commands.then(()=>invoke('native_ime',{request}));commands=next.catch(()=>{});return next;};
const utf16=(units:number[])=>{let result='';for(let i=0;i<units.length;i+=8192)result+=String.fromCharCode(...units.slice(i,i+8192));return result;};
function fail(){if(!available)return;available=false;window.dispatchEvent(new Event('letterier-native-ime-ready'));window.dispatchEvent(new CustomEvent('letterier-native-ime-error',{detail:'Windowsの縦書き入力に接続できなかったため、従来の入力方式へ戻しました。'}));}
export function nativeImeAvailable(){return available;}
export function prepareNativeIme():Promise<boolean>{
 if(!isTauri())return Promise.resolve(false);
 if(!prepared)prepared=listen<NativeEvent>('native-ime',event=>connections.get(event.payload.session)?.receive(event.payload)).then(()=>invoke<{available:boolean}>('native_ime',{request:{op:'status'}})).then(reply=>{available=reply.available;return available;}).catch(()=>false);
 return prepared;
}

/** EditContext-shaped adapter; only real browser contexts are assigned to HTMLElement.editContext. */
export class NativeInputContext extends EventTarget {
 readonly native=true;
 text:string;selectionStart:number;selectionEnd:number;
 private session=0;private sequence=0;private active=false;private disposed=false;private composing=false;
 private control:Box={...emptyBox};private selection:Box={...emptyBox};private boundsQueued=false;
 private caret:HTMLSpanElement|null=null;
 private geometryRevision=0;
 private formats:{rangeStart:number;rangeEnd:number;underlineThickness:string}[]=[];
 constructor(private host:HTMLElement,options:Options){super();this.text=options.text;this.selectionStart=options.selectionStart;this.selectionEnd=options.selectionEnd;}
 focus(){
  if(this.disposed||document.querySelector('dialog[open]')||this.host.closest('[inert]'))return;
  if(!this.active){this.active=true;this.session=++sessionCounter;this.sequence=0;connections.set(this.session,this);void send({op:'start',session:this.session,text:this.text,start:this.selectionStart,end:this.selectionEnd}).catch(fail);this.sendBounds();}
  void send({op:'focus',session:this.session}).catch(fail);this.drawCaret();
 }
 suspend(){if(!this.active)return;const session=this.session;this.active=false;connections.delete(session);this.caret?.remove();this.caret=null;void send({op:'stop',session}).catch(()=>{});}
 dispose(){this.disposed=true;this.suspend();}
 updateText(start:number,end:number,text:string){
  this.text=this.text.slice(0,start)+text+this.text.slice(end);this.selectionStart=Math.min(this.selectionStart,this.text.length);this.selectionEnd=Math.min(this.selectionEnd,this.text.length);
  // A Project edit that did not originate in this connection retires its events.
  if(this.active&&!this.composing){this.suspend();this.focus();}
 }
 updateSelection(start:number,end:number){this.selectionStart=start;this.selectionEnd=end;if(this.active&&!this.composing)void send({op:'select',session:this.session,start,end}).catch(fail);this.drawCaret();}
 updateControlBounds(rect:DOMRect){this.control=box(rect);this.queueBounds();}
 updateSelectionBounds(rect:DOMRect){this.selection=box(rect);this.queueBounds();this.drawCaret();}
 updateCharacterBounds(start:number,rects:DOMRect[]){if(this.active)void send({op:'characters',session:this.session,start,revision:this.geometryRevision,rects:rects.map(box)}).catch(fail);}
 private sendBounds(){if(this.active)void send({op:'bounds',session:this.session,control:this.control,selection:this.selection,scale:window.devicePixelRatio}).catch(fail);}
 private queueBounds(){if(this.boundsQueued)return;this.boundsQueued=true;queueMicrotask(()=>{this.boundsQueued=false;this.sendBounds();});}
 private drawCaret(){
  if(!this.active||this.selectionStart!==this.selectionEnd){this.caret?.remove();this.caret=null;return;}
  if(!this.caret){this.caret=document.createElement('span');this.caret.className='native-ime-caret';this.caret.setAttribute('aria-hidden','true');document.body.append(this.caret);}
  Object.assign(this.caret.style,{left:`${this.selection.x}px`,top:`${this.selection.y}px`,width:`${Math.max(4,this.selection.width)}px`});
 }
 receive(event:NativeEvent){
  if(!this.active||this.disposed||event.session!==this.session||event.sequence<=this.sequence)return;this.sequence=event.sequence;
  if(event.kind===0){this.text=utf16(event.text);this.selectionStart=event.selectionStart;this.selectionEnd=event.selectionEnd;this.composing=true;this.dispatchEvent(new CompositionEvent('compositionstart'));}
  else if(event.kind===1){if(event.start<0||event.end<event.start||event.end>this.text.length){fail();return;}const text=utf16(event.text);this.text=this.text.slice(0,event.start)+text+this.text.slice(event.end);this.selectionStart=event.selectionStart;this.selectionEnd=event.selectionEnd;this.dispatchEvent(Object.assign(new Event('textupdate'),{updateRangeStart:event.start,updateRangeEnd:event.end,text,selectionStart:event.selectionStart,selectionEnd:event.selectionEnd}));}
  else if(event.kind===2){this.selectionStart=event.selectionStart;this.selectionEnd=event.selectionEnd;this.dispatchEvent(new Event('selectionchange'));}
  else if(event.kind===3){this.selectionStart=event.selectionStart;this.selectionEnd=event.selectionEnd;this.composing=false;this.dispatchEvent(new CompositionEvent('compositionend'));}
  else if(event.kind===4){
   const key=({8:'Backspace',9:'Tab',13:'Enter',27:'Escape',33:'PageUp',34:'PageDown',35:'End',36:'Home',37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',46:'Delete'} as Record<number,string>)[event.key]??(event.key>=112&&event.key<=123?`F${event.key-111}`:String.fromCharCode(event.key).toLowerCase());
   const keyboard=new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,ctrlKey:!!(event.modifiers&1),shiftKey:!!(event.modifiers&2),altKey:!!(event.modifiers&4),isComposing:!!(event.modifiers&8)});this.host.dispatchEvent(keyboard);
   if(key==='Tab'&&!keyboard.defaultPrevented&&!(event.modifiers&8)){const nodes=Array.from(document.querySelectorAll<HTMLElement>('button,input,select,textarea,[tabindex="0"]')).filter(n=>!n.matches(':disabled')&&!n.closest('[inert]')&&n.getClientRects().length);const i=nodes.indexOf(this.host),next=nodes[(i+(event.modifiers&2?-1:1)+nodes.length)%nodes.length];this.suspend();next?.focus();}
  }else if(event.kind===5){this.suspend();if(document.activeElement===this.host)this.host.blur();}
  else if(event.kind===6){this.geometryRevision=event.key;this.dispatchEvent(Object.assign(new Event('characterboundsupdate'),{rangeStart:event.start,rangeEnd:Math.min(event.end,event.start+512)}));}
  else if(event.kind===7){if(event.key===0)this.formats=[];else if(event.key===1)this.formats.push({rangeStart:event.start,rangeEnd:event.end,underlineThickness:'thick'});else if(event.key===2)this.dispatchEvent(Object.assign(new Event('textformatupdate'),{getTextFormats:()=>this.formats}));}
  else if(event.kind===9){window.dispatchEvent(new CustomEvent('letterier-native-ime-error',{detail:'クリップボードへコピーできませんでした。選択した文字はそのまま残しています。'}));}
  this.drawCaret();
 }
}
