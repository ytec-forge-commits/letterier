import { useEffect,useRef,type CSSProperties,type PointerEvent } from 'react';
import type { FloatingObject,Project } from '../core/model';
import type { Layout,PlacedObject } from '../core/compose';
import {autoScrollDelta,dropObjectOnPage,nearestPageIndex,type PageRect} from '../core/object-drag';
import { textCss } from './typography';
export function ObjectArtwork({object,project}:{object:PlacedObject;project:Project}){
  return object.kind==='image'?<img alt="" draggable={false} src={project.assets[object.assetId!]?.data} style={{width:'100%',height:'100%',objectFit:'fill'}}/>:<div className="floating-text" style={{...textCss(object.style??project.baseStyle),writingMode:project.settings.writingMode==='vertical'?'vertical-rl':'horizontal-tb'}}>{object.text}</div>;
}
export function objectCss(object:PlacedObject):CSSProperties{return {position:'absolute',left:`${object.actualX}mm`,top:`${object.actualY}mm`,width:`${object.width}mm`,height:`${object.height}mm`,transform:`rotate(${object.rotation}deg)`,opacity:object.opacity,zIndex:object.z,overflow:'hidden'};}
interface Props {project:Project;layout:Layout;page:number;zoom:number;selected:string|null;onSelect:(id:string)=>void;onPreview:(id:string,patch:Partial<FloatingObject>|null)=>void;onChange:(id:string,patch:Partial<FloatingObject>)=>void;onDelete:(id:string)=>void}
export function ObjectLayer(props:Props){
  const drag=useRef<{object:PlacedObject;startX:number;startY:number;lastX:number;lastY:number;action:'move'|'resize'|'rotate';patch:Partial<FloatingObject>;centerX:number;centerY:number;grab:{x:number;y:number};scroll:HTMLElement;raf:number;dirty:boolean}|null>(null);
  const pageRects=()=>Array.from(drag.current?.scroll.querySelectorAll<HTMLElement>('.paper')??[]).map(element=>element.getBoundingClientRect() as PageRect);
  const updateMove=(clientX:number,clientY:number,preview=true)=>{
    const d=drag.current;if(!d)return;
    const pages=pageRects(),target=nearestPageIndex(clientX,clientY,pages);if(target<0)return;
    const position=dropObjectOnPage(clientX,clientY,d.grab,pages[target],props.layout.width,props.layout.height,d.object.width,d.object.height);
    const patch:Partial<FloatingObject>=target===d.object.actualPage
      ? d.object.anchorMode==='flow'?{x:position.x-(d.object.actualX-d.object.x),y:position.y-(d.object.actualY-d.object.y)}:position
      : {anchorMode:'page',pageIndex:target,...position};
    d.patch=patch;
    if(preview){
      const visible=target===d.object.actualPage?patch:{x:d.object.x+(clientX-d.startX)/(96/25.4*props.zoom),y:d.object.y+(clientY-d.startY)/(96/25.4*props.zoom)};
      props.onPreview(d.object.id,visible);
    }
  };
  const tick=()=>{
    const d=drag.current;if(!d)return;
    if(d.action==='move'){
      const viewport=d.scroll.getBoundingClientRect(),delta=autoScrollDelta(d.lastY,viewport.top,viewport.bottom);
      if(delta)d.scroll.scrollTop+=delta;
      if(delta||d.dirty)updateMove(d.lastX,d.lastY);
      d.dirty=false;
    }
    d.raf=requestAnimationFrame(tick);
  };
  const start=(e:PointerEvent<HTMLElement>,object:PlacedObject,action:'move'|'resize'|'rotate')=>{
    e.preventDefault();e.stopPropagation();props.onSelect(object.id);e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);
    const paper=e.currentTarget.closest('.paper')!.getBoundingClientRect(),unit=paper.width/props.layout.width,scroll=e.currentTarget.closest('.paper-scroll') as HTMLElement;
    drag.current={object,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,action,patch:{},centerX:paper.left+(object.actualX+object.width/2)*unit,centerY:paper.top+(object.actualY+object.height/2)*unit,grab:{x:(e.clientX-paper.left)/unit-object.actualX,y:(e.clientY-paper.top)/unit-object.actualY},scroll,raf:0,dirty:true};
    drag.current.raf=requestAnimationFrame(tick);
  };
  const move=(e:PointerEvent<HTMLElement>)=>{
    const d=drag.current;if(!d)return;e.stopPropagation();d.lastX=e.clientX;d.lastY=e.clientY;d.dirty=true;
    const unit=96/25.4*props.zoom,dx=(e.clientX-d.startX)/unit,dy=(e.clientY-d.startY)/unit;
    if(d.action==='move')return;
    if(d.action==='resize'){
      const width=Math.max(5,Math.min(500,d.object.width+dx)),height=d.object.kind==='image'&&!e.shiftKey?width*d.object.height/d.object.width:Math.max(5,d.object.height+dy);
      d.patch={width,height:Math.min(500,height)};
    }
    if(d.action==='rotate'){
      const angle=(Math.atan2(e.clientY-d.centerY,e.clientX-d.centerX)-Math.atan2(d.startY-d.centerY,d.startX-d.centerX))*180/Math.PI;
      d.patch={rotation:Math.round(((d.object.rotation+angle+540)%360)-180)};
    }
    props.onPreview(d.object.id,d.patch);
  };
  const end=(e:PointerEvent<HTMLElement>)=>{const d=drag.current;if(!d)return;if(d.action==='move')updateMove(e.clientX,e.clientY,false);cancelAnimationFrame(d.raf);drag.current=null;props.onPreview(d.object.id,null);if(Object.keys(d.patch).length)props.onChange(d.object.id,d.patch);};
  const cancel=()=>{if(drag.current){cancelAnimationFrame(drag.current.raf);props.onPreview(drag.current.object.id,null);}drag.current=null;};
  useEffect(()=>()=>{if(drag.current)cancelAnimationFrame(drag.current.raf);},[]);
  return <>{props.layout.objects.filter(o=>o.actualPage===props.page).map(o=><div key={o.id} className="object-art" style={objectCss(o)}><ObjectArtwork object={o} project={props.project}/></div>)}{props.layout.objects.filter(o=>o.actualPage===props.page).sort((a,b)=>a.z-b.z).map(o=><div key={o.id} className={`object-controls ${props.selected===o.id?'selected':''}`} style={{...objectCss(o),opacity:1,zIndex:100+o.z,overflow:'visible'}} data-object-control="" onPointerMove={move} onPointerUp={end} onPointerCancel={cancel} onKeyDown={e=>{
    if(e.ctrlKey&&['s','o','z','y'].includes(e.key.toLowerCase()))return;e.stopPropagation();if(e.key==='Escape'){cancel();return;}if(['Backspace','Delete'].includes(e.key)){e.preventDefault();props.onDelete(o.id);}const step=e.shiftKey?5:1;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();props.onChange(o.id,{x:o.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),y:o.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)});}
  }}><button className="object-hit" aria-label={`${o.kind==='image'?'画像':'文字箱'}を選択 ${o.kind==='image'?props.project.assets[o.assetId!]?.name:o.text?.slice(0,30)}`} aria-pressed={props.selected===o.id} onPointerDown={e=>start(e,o,'move')} onClick={()=>props.onSelect(o.id)} />{props.selected===o.id&&<><button className="object-handle resize" aria-label="ドラッグして大きさを変更" title="ドラッグで拡大・縮小。画像はShiftで比率を解除" onPointerDown={e=>start(e,o,'resize')}/><button className="object-handle rotate" aria-label="ドラッグして回転" title="ドラッグで回転" onPointerDown={e=>start(e,o,'rotate')}>↻</button></>}</div>)}</>;
}
