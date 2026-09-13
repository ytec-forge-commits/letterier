import type {Margins,PageVisual,Project,WritingMode} from './model';

export const illustratedTemplateIds=new Set(['ichimatsu','sakura','nanohana','asagao','goldfish','momiji','moon','snow-garden','camellia','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas']);

export interface DecorationMotifPlacement {
  x:number;
  y:number;
  width:number;
  height:number;
  reserved:Margins;
}

export function decorationMotifPlacement(
  pageWidth:number,
  pageHeight:number,
  writingMode:WritingMode,
  continuation:boolean,
):DecorationMotifPlacement {
  const size=continuation?24:30;
  const outer=4;
  const reserve=size+6;
  if(writingMode==='vertical'){
    return {x:outer,y:outer,width:size,height:size,reserved:{top:reserve,right:20,bottom:20,left:reserve}};
  }
  return {
    x:pageWidth-size-outer,
    y:pageHeight-size-outer,
    width:size,
    height:size,
    reserved:{top:20,right:reserve,bottom:reserve,left:20},
  };
}

function withReservedMargin(visual:PageVisual,mode:WritingMode,continuation:boolean):PageVisual {
  const margins=visual.ruling.margins;
  if(!Object.values(margins).every(value=>value===20))return visual;
  return {...visual,ruling:{...visual.ruling,margins:decorationMotifPlacement(210,297,mode,continuation).reserved}};
}

export function ensureStationeryMargins(project:Project):Project {
  if(!illustratedTemplateIds.has(project.templateId))return project;
  const matches=(visual:PageVisual)=>visual.design===`${project.templateId}-first`||visual.design===`${project.templateId}-continuation`;
  return {
    ...project,
    pages:project.pages.map(visual=>matches(visual)?withReservedMargin(visual,project.settings.writingMode,visual.design.endsWith('-continuation')):visual),
    continuation:matches(project.continuation)?withReservedMargin(project.continuation,project.settings.writingMode,true):project.continuation,
  };
}
