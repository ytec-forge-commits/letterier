import {paperSize,type Margins,type PageVisual,type Project,type WritingMode} from './model';

export const illustratedTemplateIds=new Set(['ichimatsu','sakura','nanohana','asagao','goldfish','momiji','moon','snow-garden','camellia','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas']);

export type DecorationPattern='classic-diagonal';
export interface DecorationMotifPlacement {art:'primary'|'companion';x:number;y:number;width:number;height:number;rotation:number;opacity:number}
export interface DecorationMotifLayout {pattern:DecorationPattern;placements:DecorationMotifPlacement[];reserved:Margins}

export const stationeryBodyMargins:Margins={top:20,right:20,bottom:20,left:20};

const round=(value:number)=>Math.round(value*100)/100;

export function decorationMotifLayout(_id:string,pageWidth:number,pageHeight:number,writingMode:WritingMode,continuation:boolean):DecorationMotifLayout {
  const size=46,vertical=writingMode==='vertical';
  const motif=(art:'primary'|'companion',x:number,y:number,opacity:number):DecorationMotifPlacement=>({art,x:round(x),y:round(y),width:size,height:size,rotation:0,opacity});
  return {
    pattern:'classic-diagonal',
    placements:[
      motif('primary',vertical?0:pageWidth-size,0,continuation?.32:.58),
      motif('companion',vertical?pageWidth-size:0,pageHeight-size,continuation?.22:.42),
    ],
    reserved:{...stationeryBodyMargins},
  };
}

const equalMargins=(a:Margins,b:Margins,tolerance=0)=>Math.abs(a.top-b.top)<=tolerance&&Math.abs(a.right-b.right)<=tolerance&&Math.abs(a.bottom-b.bottom)<=tolerance&&Math.abs(a.left-b.left)<=tolerance;
const legacyMargins=(mode:WritingMode,continuation:boolean):Margins=>mode==='vertical'
  ? {top:continuation?30:36,right:20,bottom:20,left:continuation?30:36}
  : {top:20,right:continuation?30:36,bottom:continuation?30:36,left:20};

type LegacyPattern='corner-left'|'corner-right'|'diagonal'|'sides'|'footer';
const legacyPatternSets:Record<LegacyPattern,Set<string>>={
  'corner-left':new Set(['asagao','camellia','moon','lemon']),
  'corner-right':new Set(['nanohana','goldfish','mimosa','christmas']),
  diagonal:new Set(['sakura','momiji','autumn-leaf','snowflake']),
  sides:new Set(['ichimatsu','woodland']),
  footer:new Set(['tulip','seaside','snow-garden']),
};
function legacyExpandedMargins(id:string,pageWidth:number,pageHeight:number,continuation:boolean):Margins {
  const pattern=(Object.entries(legacyPatternSets).find(([,ids])=>ids.has(id))?.[0] as LegacyPattern|undefined)??'corner-left';
  const main=round(Math.min(48,Math.max(34,Math.min(pageWidth,pageHeight)*.21)));
  const small=round(main*(continuation?.68:.64)),side=round(main*.92);
  if(pattern==='corner-left')return {top:round((continuation?small:main)+10),right:20,bottom:20,left:round((continuation?small:main)+10)};
  if(pattern==='corner-right')return {top:round((continuation?small:main)+10),right:round((continuation?small:main)+10),bottom:20,left:20};
  if(pattern==='diagonal')return continuation
    ? {top:20,right:round(small+10),bottom:round(small+10),left:20}
    : {top:round(main+10),right:round(small+10),bottom:round(small+10),left:round(main+10)};
  if(pattern==='sides')return {top:20,right:round((continuation?small:side)+10),bottom:20,left:round((continuation?small:side)+10)};
  return {top:20,right:20,bottom:round((continuation?small:side)+10),left:20};
}

function restoreFixedBodyMargin(visual:PageVisual,id:string,width:number,height:number,mode:WritingMode,continuation:boolean):PageVisual {
  const margins=visual.ruling.margins;
  const isKnownAutomaticMargin=equalMargins(margins,stationeryBodyMargins)
    ||equalMargins(margins,legacyMargins(mode,continuation),.02)
    ||equalMargins(margins,legacyExpandedMargins(id,width,height,continuation),.02);
  return isKnownAutomaticMargin?{...visual,ruling:{...visual.ruling,margins:{...stationeryBodyMargins}}}:visual;
}

export function ensureStationeryMargins(project:Project):Project {
  if(!illustratedTemplateIds.has(project.templateId))return project;
  const {width,height}=paperSize(project),matches=(visual:PageVisual)=>visual.design===`${project.templateId}-first`||visual.design===`${project.templateId}-continuation`;
  return {
    ...project,
    pages:project.pages.map(visual=>matches(visual)?restoreFixedBodyMargin(visual,project.templateId,width,height,project.settings.writingMode,visual.design.endsWith('-continuation')):visual),
    continuation:matches(project.continuation)?restoreFixedBodyMargin(project.continuation,project.templateId,width,height,project.settings.writingMode,true):project.continuation,
  };
}
