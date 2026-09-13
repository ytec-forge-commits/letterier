import {paperSize,type Margins,type PageVisual,type Project,type WritingMode} from './model';

export const illustratedTemplateIds=new Set(['ichimatsu','sakura','nanohana','asagao','goldfish','momiji','moon','snow-garden','camellia','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas']);

export type DecorationPattern='corner-pair'|'corner-right'|'side-left'|'side-right'|'top-rhythm'|'footer-rhythm'|'four-corners';
export interface DecorationMotifPlacement {art:'primary'|'companion';x:number;y:number;width:number;height:number;rotation:number;opacity:number}
export interface DecorationMotifLayout {pattern:DecorationPattern;placements:DecorationMotifPlacement[];reserved:Margins}

export const stationeryBodyMargins:Margins={top:20,right:20,bottom:20,left:20};

const patterns:Record<DecorationPattern,Set<string>>={
  'corner-pair':new Set(['sakura','momiji','autumn-leaf']),
  'corner-right':new Set(['moon','camellia','mimosa']),
  'side-left':new Set(['ichimatsu','woodland']),
  'side-right':new Set(['asagao','lemon']),
  'top-rhythm':new Set(['nanohana','snowflake']),
  'footer-rhythm':new Set(['goldfish','snow-garden','tulip','seaside']),
  'four-corners':new Set(['christmas']),
};
const round=(value:number)=>Math.round(value*100)/100;
function patternFor(id:string):DecorationPattern{return (Object.entries(patterns).find(([,ids])=>ids.has(id))?.[0] as DecorationPattern|undefined)??'corner-pair';}

export function decorationMotifLayout(id:string,pageWidth:number,pageHeight:number,_writingMode:WritingMode,continuation:boolean):DecorationMotifLayout {
  type Zone='top-left'|'top-center'|'top-right'|'middle-left'|'middle-right'|'bottom-left'|'bottom-quarter'|'bottom-center'|'bottom-right';
  const pattern=patternFor(id),outer=1,primarySize=continuation?15:18,companionSize=continuation?9.5:11.5;
  const zones:Record<string,[Zone,Zone]>= {
    ichimatsu:['middle-left','top-right'],sakura:['top-left','bottom-right'],nanohana:['bottom-left','top-right'],
    asagao:['top-right','bottom-left'],goldfish:['bottom-right','bottom-left'],momiji:['top-right','bottom-left'],
    moon:['top-right','top-left'],'snow-garden':['bottom-left','top-right'],camellia:['bottom-right','top-left'],
    mimosa:['top-left','bottom-right'],tulip:['bottom-center','top-right'],seaside:['bottom-quarter','top-right'],
    lemon:['top-right','bottom-left'],'autumn-leaf':['top-left','bottom-right'],woodland:['bottom-left','top-right'],
    snowflake:['top-center','bottom-right'],christmas:['top-right','bottom-left'],
  };
  const point=(zone:Zone,size:number):[number,number]=>{
    const left=outer,right=pageWidth-size-outer,top=outer,bottom=pageHeight-size-outer;
    if(zone==='top-left')return [left,top];
    if(zone==='top-center')return [(pageWidth-size)/2,top];
    if(zone==='top-right')return [right,top];
    if(zone==='middle-left')return [left,(pageHeight-size)/2];
    if(zone==='middle-right')return [right,(pageHeight-size)/2];
    if(zone==='bottom-left')return [left,bottom];
    if(zone==='bottom-quarter')return [(pageWidth-size)*.25,bottom];
    if(zone==='bottom-center')return [(pageWidth-size)/2,bottom];
    return [right,bottom];
  };
  const [primaryZone,companionZone]=zones[id]??['top-left','bottom-right'];
  const motif=(art:'primary'|'companion',zone:Zone,size:number,opacity:number):DecorationMotifPlacement=>{
    const [x,y]=point(zone,size);
    return {art,x:round(x),y:round(y),width:size,height:size,rotation:0,opacity};
  };
  return {
    pattern,
    placements:[
      motif('primary',primaryZone,primarySize,continuation?.62:.9),
      motif('companion',companionZone,companionSize,continuation?.48:.76),
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
