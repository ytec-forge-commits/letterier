import {cloneProject,bodyText,clone,compactRuns,sliceRuns,uid,type Project,type FloatingObject,type TextRun,type PageVisual} from './model';
import {compose,type Layout,type Measure} from './compose';
export type PageOperation={type:'duplicate'|'delete'|'add';index:number}|{type:'move';index:number;target:number};
export type VisualScope='page'|'continuation'|'all';
export function applyPageVisual(p:Project,index:number,visual:PageVisual,scope:VisualScope):Project{
  if(!Number.isInteger(index)||index<0||index>=1000)throw new Error('対象ページが見つかりません。');
  const next=cloneProject(p);
  if(scope==='page'){
    while(next.pages.length<=index)next.pages.push({...clone(next.continuation),id:uid()});
    next.pages[index]={...clone(visual),id:next.pages[index].id};
  }else if(scope==='continuation')next.continuation={...clone(visual),id:next.continuation.id};
  else {next.pages=next.pages.map(page=>({...clone(visual),id:page.id}));next.continuation={...clone(visual),id:next.continuation.id};}
  return next;
}
function owner(layout:Layout,o:FloatingObject):number{
  return layout.objects.find(placed=>placed.id===o.id)?.actualPage??Math.min(o.pageIndex,layout.pages.length-1);
}
export function describePage(p:Project,layout:Layout,index:number){
  const page=layout.pages[index];if(!page)throw new Error('対象ページが見つかりません。');
  const text=bodyText(p);
  return {text:text.slice(page.start,page.end).replace(/\f$/,''),start:page.start,end:page.end,objects:p.objects.filter(o=>owner(layout,o)===index),partialParagraph:page.start>0&&!/[\n\f]/.test(text[page.start-1])||page.end<text.length&&!/[\n\f]/.test(text[page.end-1])};
}
export function applyPageOperation(p:Project,layout:Layout,operation:PageOperation,measure:Measure):Project{
  if(!Number.isInteger(operation.index)||!layout.pages[operation.index])throw new Error('対象ページが見つかりません。');
  const positions=new Map(layout.objects.map(o=>[o.id,{x:o.actualX,y:o.actualY}]));
  const segments=layout.pages.map(page=>{
    const info=describePage(p,layout,page.index);
    return {runs:sliceRuns(p.body.runs,page.start,page.start+info.text.length),objects:clone(info.objects).map(o=>({...o,anchorOffset:Math.max(0,Math.min(Math.max(0,info.text.length-1),o.anchorOffset-page.start))})),visual:clone(page.visual)};
  });
  if(operation.type==='delete')segments.splice(operation.index,1);
  if(operation.type==='duplicate'){
    const copy=clone(segments[operation.index]);copy.visual.id=uid();for(const o of copy.objects){const position=positions.get(o.id)!;o.id=uid();positions.set(o.id,position);}segments.splice(operation.index+1,0,copy);
  }
  if(operation.type==='add')segments.splice(operation.index+1,0,{runs:[],objects:[],visual:{...clone(p.continuation),id:uid()}});
  if(operation.type==='move'){
    if(!Number.isInteger(operation.target)||operation.target<0||operation.target>=segments.length)throw new Error('移動先ページが見つかりません。');
    const [moving]=segments.splice(operation.index,1);segments.splice(operation.target,0,moving);
  }
  if(!segments.length)segments.push({runs:[],objects:[],visual:clone(p.pages[0])});
  if(segments.length>1000)throw new Error('ページは1000ページまでです。文書を分けてください。');
  const next=cloneProject(p),runs:TextRun[]=[];next.objects=[];next.pages=[];let offset=0;
  segments.forEach((segment,index)=>{
    next.pages.push(segment.visual);runs.push(...segment.runs);
    for(const object of segment.objects)next.objects.push({...object,anchorOffset:offset+object.anchorOffset,pageIndex:index});
    offset+=segment.runs.reduce((n,r)=>n+r.text.length,0);
    if(index<segments.length-1){runs.push({text:'\f',style:{}});offset++;}
  });
  if(offset>200000)throw new Error('本文が20万文字を超えるため、このページ操作はできません。');
  if(next.objects.length>200)throw new Error('自由配置の要素は200個までです。文書を分けてください。');
  next.body.runs=compactRuns(runs);
  const placed=compose(next,measure,(o,basis)=>{const xy=positions.get(o.id)!;return {...o,x:xy.x-basis.x,y:xy.y-basis.y};});
  next.objects=next.objects.map(o=>{const moved=placed.objects.find(m=>m.id===o.id)!;return {...o,x:moved.x,y:moved.y};});return next;
}
