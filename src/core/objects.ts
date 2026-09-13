import type {Project,WritingMode} from './model';
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
