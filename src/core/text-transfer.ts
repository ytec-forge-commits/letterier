import {bodyText,compactRuns,replaceRange,sliceRuns,type Project} from './model';
import {graphemes} from './layout';
export function transferText(project:Project,start:number,end:number,target:number,copy=false):{project:Project;start:number;end:number}{
  const text=bodyText(project),boundaries=new Set([0]);let offset=0;
  for(const part of graphemes(text)){offset+=part.length;boundaries.add(offset);}
  if(![start,end,target].every(value=>Number.isInteger(value)&&boundaries.has(value))||start>end)throw Error('本文の移動位置を確認できません。文字単位で選択し直してください。');
  if(start===end||!copy&&target>=start&&target<=end)return {project,start,end};
  const fragment=sliceRuns(project.body.runs,start,end),length=end-start;
  const at=!copy&&target>end?target-length:target;
  const remaining=copy?project:replaceRange(project,start,end,'');
  const next=replaceRange(remaining,at,at,text.slice(start,end));
  next.body.runs=compactRuns([...sliceRuns(remaining.body.runs,0,at),...fragment,...sliceRuns(remaining.body.runs,at,bodyText(remaining).length)]);
  if(!copy)next.objects=next.objects.map(object=>{
    const original=project.objects.find(o=>o.id===object.id)!;
    if(original.anchorMode==='page')return {...object,anchorOffset:original.anchorOffset};
    return original.anchorMode==='flow'&&original.anchorOffset>=start&&original.anchorOffset<end?{...object,anchorOffset:at+original.anchorOffset-start}:object;
  });
  return {project:next,start:at,end:at+length};
}
