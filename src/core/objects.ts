import type {Project,WritingMode} from './model';
import {cloneProject} from './model';
import {compose,type Measure} from './compose';
export function changeWritingMode(p:Project,writingMode:WritingMode,measure:Measure):Project{
  if(p.settings.writingMode===writingMode)return p;
  const previous=compose(p,measure);
  const next={...p,settings:{...p.settings,writingMode}};
  const placed=compose(next,measure,(o,line)=>{
    const old=previous.objects.find(placed=>placed.id===o.id)!;
    return {...o,x:old.actualX-line.x,y:old.actualY-line.y};
  });
  next.objects=p.objects.map(o=>{const moved=placed.objects.find(m=>m.id===o.id)!;return {...o,x:moved.x,y:moved.y};});return next;
}
export function moveFixedObjectToPage(p:Project,id:string,pageIndex:number):Project{
  if(!Number.isInteger(pageIndex)||pageIndex<0||pageIndex>999)throw new Error('移動先のページが正しくありません。');
  const object=p.objects.find(o=>o.id===id);
  if(!object)throw new Error('移動する要素が見つかりません。');
  if(object.anchorMode!=='page')throw new Error('本文に追従する要素は、固定配置にしてからページを移動してください。');
  const next=cloneProject(p);
  next.objects=next.objects.map(o=>o.id===id?{...o,pageIndex}:o);
  return next;
}
