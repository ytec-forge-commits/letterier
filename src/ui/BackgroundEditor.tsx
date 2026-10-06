import {useEffect,useRef,useState,type PointerEvent,type KeyboardEvent} from 'react';
import type {Background,Asset} from '../core/model';
import {backgroundRect,moveBackground,resizeBackground,type BackgroundCorner} from '../core/background';
type Size={width:number;height:number};
type Gesture={background:Background;image:Size;corner?:BackgroundCorner;x:number;y:number;mmPerPixel:number};
const corners=[['nw','左上'],['ne','右上'],['sw','左下'],['se','右下']] as const;
export function BackgroundEditor({background,asset,paper,onChange}:{background:Background;asset:Asset;paper:Size;onChange:(value:Background)=>void}){
  const surface=useRef<HTMLDivElement>(null),gesture=useRef<Gesture|null>(null);
  const [imageSize,setImageSize]=useState<Size|null>(null);
  useEffect(()=>{
    let active=true;const image=new Image();setImageSize(null);
    image.onload=()=>{if(active&&image.naturalWidth&&image.naturalHeight)setImageSize({width:image.naturalWidth,height:image.naturalHeight});};image.src=asset.data;
    return ()=>{active=false;gesture.current=null;};
  },[asset.data]);
  const begin=(event:PointerEvent<HTMLButtonElement>,corner?:BackgroundCorner)=>{
    if(event.button!==0||!imageSize||!surface.current)return;
    event.preventDefault();event.stopPropagation();
    // preventDefault suppresses native pointer focus; keep gesture keys on the surface.
    event.currentTarget.focus({preventScroll:true});
    gesture.current={background,image:imageSize,corner,x:event.clientX,y:event.clientY,mmPerPixel:paper.width/surface.current.getBoundingClientRect().width};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move=(event:PointerEvent)=>{
    const g=gesture.current;if(!g)return;
    const dx=(event.clientX-g.x)*g.mmPerPixel,dy=(event.clientY-g.y)*g.mmPerPixel;
    onChange(g.corner?resizeBackground(g.background,paper,g.image,g.corner,dx,dy):moveBackground(g.background,paper,g.image,dx,dy));
  };
  const cancel=()=>{const g=gesture.current;gesture.current=null;if(g)onChange(g.background);};
  const keys=(event:KeyboardEvent)=>{
    if(event.key==='Escape'&&gesture.current){event.preventDefault();event.stopPropagation();cancel();return;}
    if(!imageSize||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();const step=event.shiftKey?5:1;
    onChange(moveBackground(background,paper,imageSize,event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0));
  };
  const rect=imageSize?backgroundRect(background,paper,imageSize):null;
  return <div ref={surface} className="background-editor" onPointerMove={move} onPointerUp={()=>{gesture.current=null;}} onPointerCancel={cancel} onKeyDown={keys}>
    <button type="button" className="background-move" aria-label="背景画像を移動" title="ドラッグで移動。矢印キーで微調整" disabled={!imageSize} onPointerDown={event=>begin(event)}/>
    {rect&&<><div className="background-image-outline" style={{left:`${rect.x}mm`,top:`${rect.y}mm`,width:`${rect.width}mm`,height:`${rect.height}mm`}}/>
      {corners.map(([corner,label])=>{
        const x=rect.x+(corner.includes('e')?rect.width:0),y=rect.y+(corner.includes('s')?rect.height:0);
        return <button key={corner} type="button" className={`background-resize ${corner}`} aria-label={`背景画像を${label}から拡縮`} title="ドラッグで縦横比を保って拡縮" style={{left:`${Math.max(7,Math.min(paper.width-7,x))}mm`,top:`${Math.max(7,Math.min(paper.height-7,y))}mm`}} onPointerDown={event=>begin(event,corner)}/>;
      })}
    </>}
  </div>;
}
