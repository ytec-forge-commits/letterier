import {paperSize,type Margins,type PageVisual,type Project,type WritingMode} from './model';

export const illustratedTemplateIds=new Set(['ichimatsu','sakura','nanohana','asagao','goldfish','momiji','moon','snow-garden','camellia','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas']);

export type DecorationPattern='corner-left'|'corner-right'|'diagonal'|'sides'|'footer';
export interface DecorationMotifPlacement {x:number;y:number;width:number;height:number;rotation:number;opacity:number}
export interface DecorationMotifLayout {pattern:DecorationPattern;placements:DecorationMotifPlacement[];reserved:Margins}

const patterns:Record<DecorationPattern,Set<string>>={
  'corner-left':new Set(['asagao','camellia','moon','lemon']),
  'corner-right':new Set(['nanohana','goldfish','mimosa','christmas']),
  diagonal:new Set(['sakura','momiji','autumn-leaf','snowflake']),
  sides:new Set(['ichimatsu','woodland']),
  footer:new Set(['tulip','seaside','snow-garden']),
};
const round=(value:number)=>Math.round(value*100)/100;
function patternFor(id:string):DecorationPattern{return (Object.entries(patterns).find(([,ids])=>ids.has(id))?.[0] as DecorationPattern|undefined)??'corner-left';}

export function decorationMotifLayout(id:string,pageWidth:number,pageHeight:number,_writingMode:WritingMode,continuation:boolean):DecorationMotifLayout {
  const pattern=patternFor(id),outer=4;
  const main=round(Math.min(48,Math.max(34,Math.min(pageWidth,pageHeight)*.21)));
  const small=round(main*(continuation?.68:.64)),side=round(main*.92),opacity=continuation?.56:.84;
  const motif=(x:number,y:number,size:number,rotation=0,customOpacity=opacity):DecorationMotifPlacement=>({x:round(x),y:round(y),width:size,height:size,rotation,opacity:customOpacity});
  if(pattern==='corner-left'){
    const size=continuation?small:main;
    return {pattern,placements:[motif(outer,outer,size,id==='moon'?-4:-8)],reserved:{top:round(size+10),right:20,bottom:20,left:round(size+10)}};
  }
  if(pattern==='corner-right'){
    const size=continuation?small:main;
    return {pattern,placements:[motif(pageWidth-size-outer,outer,size,id==='goldfish'?5:8)],reserved:{top:round(size+10),right:round(size+10),bottom:20,left:20}};
  }
  if(pattern==='diagonal'){
    if(continuation)return {pattern,placements:[motif(pageWidth-small-outer,pageHeight-small-outer,small,12)],reserved:{top:20,right:round(small+10),bottom:round(small+10),left:20}};
    return {pattern,placements:[motif(outer,outer,main,-8),motif(pageWidth-small-outer,pageHeight-small-outer,small,14,.66)],reserved:{top:round(main+10),right:round(small+10),bottom:round(small+10),left:round(main+10)}};
  }
  if(pattern==='sides'){
    const size=continuation?small:side;
    const placements=[motif(outer,round(pageHeight*.16),size,-8),motif(pageWidth-size-outer,round(pageHeight*.58),size,10,continuation?.48:.68)];
    if(!continuation)placements.push(motif(outer,round(pageHeight*.72),small,16,.58));
    return {pattern,placements,reserved:{top:20,right:round(size+10),bottom:20,left:round(Math.max(size,continuation?size:small)+10)}};
  }
  const size=continuation?small:side,y=pageHeight-size-outer;
  const placements=continuation
    ? [motif(outer,y,size,-5),motif(pageWidth-size-outer,y,size,6,.48)]
    : [motif(outer,y,size,-7),motif((pageWidth-size)/2,y,size,0,.72),motif(pageWidth-size-outer,y,size,8,.62)];
  return {pattern,placements,reserved:{top:20,right:20,bottom:round(size+10),left:20}};
}

const equalMargins=(a:Margins,b:Margins)=>a.top===b.top&&a.right===b.right&&a.bottom===b.bottom&&a.left===b.left;
const legacyMargins=(mode:WritingMode,continuation:boolean):Margins=>mode==='vertical'
  ? {top:continuation?30:36,right:20,bottom:20,left:continuation?30:36}
  : {top:20,right:continuation?30:36,bottom:continuation?30:36,left:20};
function withReservedMargin(visual:PageVisual,id:string,width:number,height:number,mode:WritingMode,continuation:boolean):PageVisual {
  const margins=visual.ruling.margins,standard={top:20,right:20,bottom:20,left:20};
  if(!equalMargins(margins,standard)&&!equalMargins(margins,legacyMargins(mode,continuation)))return visual;
  return {...visual,ruling:{...visual.ruling,margins:decorationMotifLayout(id,width,height,mode,continuation).reserved}};
}

export function ensureStationeryMargins(project:Project):Project {
  if(!illustratedTemplateIds.has(project.templateId))return project;
  const {width,height}=paperSize(project),matches=(visual:PageVisual)=>visual.design===`${project.templateId}-first`||visual.design===`${project.templateId}-continuation`;
  return {
    ...project,
    pages:project.pages.map(visual=>matches(visual)?withReservedMargin(visual,project.templateId,width,height,project.settings.writingMode,visual.design.endsWith('-continuation')):visual),
    continuation:matches(project.continuation)?withReservedMargin(project.continuation,project.templateId,width,height,project.settings.writingMode,true):project.continuation,
  };
}
