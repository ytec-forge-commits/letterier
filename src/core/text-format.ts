import type {Layout} from './compose';
import {cloneProject,compactRuns,formatRange,type Project,type TextStyle} from './model';

export function hasMixedFontSize(project:Project,start:number,end:number):boolean {
  if(start>=end)return false;
  let offset=0,first:number|undefined;
  for(const run of project.body.runs){
    const next=offset+run.text.length;
    if(next>start&&offset<end&&run.text.length){
      const size=run.style.sizePt??project.baseStyle.sizePt;
      if(first!==undefined&&size!==first)return true;
      first=size;
    }
    offset=next;
    if(offset>=end)break;
  }
  return false;
}

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
export function applyBodyFormat(project:Project,style:Partial<TextStyle>,options:{scope:'all'|'page';pageIndex?:number;layout?:Layout;includeTextBoxes?:boolean}):Project{
  if(style.sizePt!==undefined&&(!Number.isFinite(style.sizePt)||style.sizePt<6||style.sizePt>72))throw Error('文字サイズは6〜72ptで指定してください。');
  const page=options.scope==='page'?options.layout?.pages[options.pageIndex??-1]:undefined;
  if(options.scope==='page'&&!page)throw Error('書式を変更するページが見つかりません。');
  const next=page?formatRange(project,page.start,page.end,style):cloneProject(project);
  if(!page){next.baseStyle={...next.baseStyle,...style};next.body.runs=compactRuns(next.body.runs.map(run=>({...run,style:{...run.style,...style}})));}
  if(options.includeTextBoxes)next.objects=next.objects.map(o=>{
    const owner=options.layout?.objects.find(placed=>placed.id===o.id)?.actualPage??o.pageIndex;
    return o.kind==='text'&&(!page||owner===options.pageIndex)?{...o,style:{...project.baseStyle,...o.style,...style}}:o;
  });
  return next;
}
