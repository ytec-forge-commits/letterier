export interface PageRect {left:number;top:number;right:number;bottom:number;width:number;height:number}

function axisDistance(value:number,start:number,end:number){return value<start?start-value:value>end?value-end:0;}
export function nearestPageIndex(x:number,y:number,pages:PageRect[]):number{
  if(!pages.length)return -1;
  let best=0,distance=Number.POSITIVE_INFINITY;
  pages.forEach((page,index)=>{const dx=axisDistance(x,page.left,page.right),dy=axisDistance(y,page.top,page.bottom),next=dx*dx+dy*dy;if(next<distance){distance=next;best=index;}});
  return best;
}
export function autoScrollDelta(y:number,top:number,bottom:number,edge=72,max=18):number{
  if(y<top+edge)return -max*Math.max(0,Math.min(1,(top+edge-y)/edge));
  if(y>bottom-edge)return max*Math.max(0,Math.min(1,(y-(bottom-edge))/edge));
  return 0;
}
export function dropObjectOnPage(pointerX:number,pointerY:number,grab:{x:number;y:number},page:PageRect,pageWidth:number,pageHeight:number,objectWidth:number,objectHeight:number){
  const unit=page.width/pageWidth;
  const x=(pointerX-page.left)/unit-grab.x,y=(pointerY-page.top)/unit-grab.y;
  return {x:Math.max(0,Math.min(pageWidth-objectWidth,x)),y:Math.max(0,Math.min(pageHeight-objectHeight,y))};
}
export function dragGhostRect(pointerX:number,pointerY:number,grab:{x:number;y:number},unit:number,objectWidth:number,objectHeight:number){
  return {left:pointerX-grab.x*unit,top:pointerY-grab.y*unit,width:objectWidth*unit,height:objectHeight*unit};
}
