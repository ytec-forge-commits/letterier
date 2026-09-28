import type {Layout} from './compose';
import {cloneProject,compactRuns,formatRange,type Project} from './model';

export function applyBodyFont(project:Project,fontFamily:string,options:{scope:'page';pageIndex:number;layout:Layout}|{scope:'all'}):Project {
  if(options.scope==='all'){
    const next=cloneProject(project);
    next.baseStyle={...next.baseStyle,fontFamily};
    next.body.runs=compactRuns(next.body.runs.map(run=>({...run,style:{...run.style,fontFamily}})));
    return next;
  }
  const page=options.layout.pages[options.pageIndex];
  if(!page)throw new Error('フォントを変更するページが見つかりません。');
  return formatRange(project,page.start,page.end,{fontFamily});
}
