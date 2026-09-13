export type WritingMode = 'horizontal' | 'vertical';
export interface TextStyle { fontFamily: string; sizePt: number; bold: boolean; italic: boolean; underline: boolean; color: string; verticalInlineMode: 'auto' | 'normal' | 'tate-chu-yoko' }
export interface TextRun { text: string; style: Partial<TextStyle> }
export interface Margins { top: number; right: number; bottom: number; left: number }
export interface Ruling { enabled: boolean; spacingMm: number; widthMm: number; color: string; margins: Margins }
export interface Background { color: string; assetId?: string; opacity: number; fit: 'cover' | 'contain' | 'stretch'; x: number; y: number; scale: number }
export interface PageVisual { id: string; ruling: Ruling; background: Background; design: string }
export interface FloatingObject {
  id: string; kind: 'image' | 'text'; assetId?: string; text?: string; style?: TextStyle;
  anchorMode: 'flow' | 'page'; anchorOffset: number; pageIndex: number;
  x: number; y: number; width: number; height: number; rotation: number; opacity: number;
  wrap: boolean; paddingMm: number; hideRuling: boolean; z: number;
}
export interface OriginalMaterial {readonly name:string;readonly format:'gif'|'webp'|'heic'|'heif'|'psd'|'ai'|'pdf';readonly index:number;readonly data:string}
export interface Asset { readonly id: string; readonly name: string; readonly mime: string; readonly data: string;readonly original?:OriginalMaterial }
export interface Project {
  format: 'binsen'; version: 2; id: string; title: string;
  settings: { paper: 'A4' | 'B5' | 'POSTCARD'; orientation: 'portrait' | 'landscape'; writingMode: WritingMode; orphanControl: boolean };
  baseStyle: TextStyle; body: { runs: TextRun[] }; pages: PageVisual[]; continuation: PageVisual;
  objects: FloatingObject[]; assets: Record<string, Asset>; templateId: string;
}
export const defaultStyle: TextStyle = { fontFamily: '游明朝', sizePt: 14, bold: false, italic: false, underline: false, color: '#273b35', verticalInlineMode: 'auto' };
export const uid = () => crypto.randomUUID();
export const clone = <T,>(value: T): T => structuredClone(value);
export function cloneProject(project:Project):Project{
  // Asset records and their strings are immutable. Undo shares them across edits.
  return {...structuredClone({...project,assets:{}}),assets:{...project.assets}};
}
export function pruneAssets(project:Project):Project{
  const used=new Set([...project.objects.map(o=>o.assetId),...project.pages.map(p=>p.background.assetId),project.continuation.background.assetId]);
  return {...project,assets:Object.fromEntries(Object.entries(project.assets).filter(([id])=>used.has(id)))};
}
export function newProject(): Project {
  const visual: PageVisual = { id: uid(), ruling: { enabled: true, spacingMm: 8, widthMm: 0.15, color: '#b2c4b8', margins: {top:20,right:20,bottom:20,left:20} }, background: { color: '#fffefa', opacity: 1, fit: 'cover', x:50, y:50, scale:1 }, design:'washi' };
  return { format:'binsen', version:2, id:uid(), title:'新しい手紙', settings:{paper:'A4',orientation:'portrait',writingMode:'horizontal',orphanControl:true}, baseStyle:clone(defaultStyle), body:{runs:[{text:'',style:{}}]}, pages:[visual], continuation:{...clone(visual),id:uid()}, objects:[], assets:{}, templateId:'washi' };
}
export function bodyText(project: Project): string { return project.body.runs.map(r => r.text).join(''); }
export function sliceRuns(runs: TextRun[], start: number, end: number): TextRun[] {
  let offset = 0;
  const result: TextRun[] = [];
  for (const run of runs) {
    const from = Math.max(0, start - offset), to = Math.min(run.text.length, end - offset);
    if (to > from) result.push({text:run.text.slice(from,to),style:{...run.style}});
    offset += run.text.length;
  }
  return result;
}
export function compactRuns(runs: TextRun[]): TextRun[] {
  const result: TextRun[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const last = result.at(-1);
    const keys = Object.keys(defaultStyle) as (keyof TextStyle)[];
    if (last && keys.every(key => last.style[key] === run.style[key])) last.text += run.text;
    else result.push({text:run.text,style:{...run.style}});
  }
  return result.length ? result : [{text:'',style:{}}];
}
export function styleAt(project: Project, offset: number): Partial<TextStyle> {
  let pos = 0;
  for (const run of project.body.runs) { pos += run.text.length; if (offset < pos) return {...run.style}; }
  return {...project.body.runs.at(-1)?.style};
}
export function replaceRange(project: Project, start: number, end: number, text: string, style?: Partial<TextStyle>): Project {
  const length = bodyText(project).length;
  start = Math.max(0,Math.min(length,start)); end = Math.max(start,Math.min(length,end));
  text = text.replace(/\r\n?/g,'\n').replace(/\t/g,'　');
  if (length - (end-start) + text.length > 200000) throw new Error('本文は20万文字までです。別の手紙に分けて保存してください。');
  const next = cloneProject(project);
  next.body.runs = compactRuns([...sliceRuns(project.body.runs,0,start),{text,style:style ?? styleAt(project,Math.max(0,start-1))},...sliceRuns(project.body.runs,end,length)]);
  for (const object of next.objects) {
    if(object.anchorMode==='page'){object.anchorOffset=Math.min(object.anchorOffset,length+text.length-(end-start));continue;}
    if (object.anchorOffset >= end) object.anchorOffset += text.length - (end-start);
    else if (object.anchorOffset > start) object.anchorOffset = start;
  }
  return next;
}
export function formatRange(project: Project, start: number, end: number, style: Partial<TextStyle>): Project {
  const next = cloneProject(project);
  next.body.runs = compactRuns([
    ...sliceRuns(project.body.runs,0,start),
    ...sliceRuns(project.body.runs,start,end).map(run=>({...run,style:{...run.style,...style}})),
    ...sliceRuns(project.body.runs,end,bodyText(project).length),
  ]);
  return next;
}
export function paperSize(project: Project): { width: number; height: number } {
  const [short,long] = {A4:[210,297],B5:[182,257],POSTCARD:[100,148]}[project.settings.paper];
  return project.settings.orientation==='portrait' ? {width:short,height:long} : {width:long,height:short};
}
export function pageVisual(project: Project, index: number): PageVisual { return project.pages[index] ?? project.continuation; }
