import type {Background} from './model';
type Size={width:number;height:number};
export type BackgroundCorner='nw'|'ne'|'sw'|'se';
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
function offsets(bg:Background,paper:Size){
  // Preserve the historical contain/scale horizontal compensation on first edit.
  const explicit=bg.offsetXmm!==undefined||bg.offsetYmm!==undefined;
  return {offsetXmm:explicit?bg.offsetXmm??0:bg.fit==='contain'?(bg.x-50)*(1-bg.scale)*paper.width/100:0,offsetYmm:bg.offsetYmm??0};
}
export function backgroundRect(bg:Background,paper:Size,image:Size){
  const ratio=bg.fit==='cover'?Math.max(paper.width/image.width,paper.height/image.height):Math.min(paper.width/image.width,paper.height/image.height);
  const fitted=bg.fit==='stretch'?paper:{width:image.width*ratio,height:image.height*ratio};
  const offset=offsets(bg,paper);
  return {
    x:paper.width/2+((paper.width-fitted.width)*bg.x/100-paper.width/2)*bg.scale+offset.offsetXmm,
    y:paper.height/2+((paper.height-fitted.height)*bg.y/100-paper.height/2)*bg.scale+offset.offsetYmm,
    width:fitted.width*bg.scale,height:fitted.height*bg.scale,
  };
}
export function moveBackground(bg:Background,paper:Size,image:Size,dx:number,dy:number):Background{
  const rect=backgroundRect(bg,paper,image),offset=offsets(bg,paper);
  const visibleX=Math.min(10,rect.width),visibleY=Math.min(10,rect.height);
  return {...bg,
    offsetXmm:clamp(offset.offsetXmm+clamp(dx,visibleX-rect.x-rect.width,paper.width-visibleX-rect.x),-1000,1000),
    offsetYmm:clamp(offset.offsetYmm+clamp(dy,visibleY-rect.y-rect.height,paper.height-visibleY-rect.y),-1000,1000),
  };
}
export function resizeBackground(bg:Background,paper:Size,image:Size,corner:BackgroundCorner,dx:number,dy:number):Background{
  const rect=backgroundRect(bg,paper,image),west=corner.includes('w'),north=corner.includes('n');
  const factor=(rect.width*(rect.width+(west?-dx:dx))+rect.height*(rect.height+(north?-dy:dy)))/(rect.width**2+rect.height**2);
  const next={...bg,...offsets(bg,paper),scale:clamp(bg.scale*factor,.1,5)};
  const resized=backgroundRect(next,paper,image);
  const anchor={x:rect.x+(west?rect.width:0),y:rect.y+(north?rect.height:0)};
  const movedAnchor={x:resized.x+(west?resized.width:0),y:resized.y+(north?resized.height:0)};
  return {...next,offsetXmm:clamp(next.offsetXmm+anchor.x-movedAnchor.x,-1000,1000),offsetYmm:clamp(next.offsetYmm+anchor.y-movedAnchor.y,-1000,1000)};
}
