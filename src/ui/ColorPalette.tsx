import {useEffect,useRef,useState} from 'react';
const colors=['#273b35','#000000','#ffffff','#596b60','#315a45','#659372','#a6b5aa','#a5c8c0','#2f617e','#568cb0','#9ec5db','#716082','#ad9dbf','#b23b42','#d7818b','#eabcc6','#b47b35','#d9b257','#e7d4a9','#865437'];
export function ColorPalette({label,value,onChange}:{label:string;value:string;onChange:(color:string)=>void}){
 const [open,setOpen]=useState(false);
 const [position,setPosition]=useState({left:0,top:0});
 const picker=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const close=()=>{
  const returnFocus=picker.current?.contains(document.activeElement);
  setOpen(false);
  if(returnFocus)queueMicrotask(()=>trigger.current?.focus({preventScroll:true}));
 };
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!picker.current?.contains(event.target))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{
   if(event.key!=='Escape'||event.isComposing)return;
   event.preventDefault();event.stopPropagation();close();
  };
  document.addEventListener('pointerdown',outside,true);
  document.addEventListener('keydown',escape,true);
  return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);};
 },[open]);
 return <div className="color-picker" ref={picker}><button ref={trigger} className="color-trigger" aria-label={label} aria-expanded={open} onMouseDown={e=>e.preventDefault()} onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();setPosition({left:Math.max(8,Math.min(rect.left,window.innerWidth-240)),top:Math.min(rect.bottom+4,window.innerHeight-190)});setOpen(v=>!v);}}><span className="color-letter">A</span><span className="color-sample" style={{background:value}}/><span>▾</span></button>{open&&<div className="color-popover" style={position}><div className="color-grid" role="group" aria-label={label+'のパレット'}>{colors.map(color=><button key={color} aria-label={`${label} ${color}`} aria-pressed={value.toLowerCase()===color} title={color} style={{background:color}} onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(color);close();}}/>)}</div><label>任意の色<input aria-label={label+'（任意の色）'} type="color" value={value} onChange={e=>onChange(e.target.value)}/></label><button className="palette-close" onMouseDown={e=>e.preventDefault()} onClick={close}>閉じる</button></div>}</div>;
}
