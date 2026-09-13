import { bodyText, paperSize, pageVisual, type Project, type TextStyle, type FloatingObject, type PageVisual } from './model';
import { graphemes, lineEnd } from './layout';
export interface Token { text: string; start: number; end: number; advance: number; style: TextStyle; tcy: boolean }
export interface LayoutLine { pageIndex: number; x: number; y: number; extent: number; spacing: number; start: number; end: number; tokens: Token[]; breakAfter?: '\n' | '\f';breakText?:string }
export interface LayoutPage { index: number; visual: PageVisual; lines: LayoutLine[]; caretLines: LayoutLine[]; start: number; end: number }
export interface PlacedObject extends FloatingObject { actualX: number; actualY: number; actualPage: number }
export interface Layout { width: number; height: number; pages: LayoutPage[]; objects: PlacedObject[]; warnings: string[] }
export type Measure = (text: string, style: TextStyle) => number;
export const emMm = (style: TextStyle) => style.sizePt * 25.4 / 72;
export function tokenize(project: Project, measure: Measure): Token[] {
  const vertical = project.settings.writingMode === 'vertical';
  const text = bodyText(project);
  const tokens: Token[] = [];
  let offset = 0;
  for (const run of project.body.runs) {
    const style = {...project.baseStyle,...run.style};
    const chars = graphemes(run.text);
    for (let i=0;i<chars.length;i++) {
      let piece=chars[i];
      const start=offset;
      let tcy=false;
      if (vertical && style.verticalInlineMode==='tate-chu-yoko' && !/[\n\f]/.test(piece)) {
        while (i+1<chars.length && !/[\n\f]/.test(chars[i+1]) && piece.length<4) piece+=chars[++i];
        tcy=true;
      } else if (vertical && style.verticalInlineMode==='auto' && /^[0-9]$/.test(piece) && /^[0-9]$/.test(chars[i+1]??'') && !/[0-9]/.test(text[offset-1]??'') && !/[0-9]/.test(text[offset+2]??'')) {
        piece+=chars[++i]; tcy=true;
      }
      offset+=piece.length;
      const advance = /[\n\f]/.test(piece) ? 0 : tcy ? emMm(style) : vertical && !/^[\u0020-\u007e]+$/.test(piece) ? emMm(style) : measure(piece,style);
      tokens.push({text:piece,start,end:offset,advance,style,tcy});
    }
  }
  return tokens;
}

export function subtractIntervals(start: number, end: number, cuts: [number,number][]): [number,number][] {
  const result: [number,number][]=[];
  let cursor=start;
  for (const [left,right] of [...cuts].sort((a,b)=>a[0]-b[0])) {
    if (right<=cursor || left>=end) continue;
    if (left>cursor) result.push([cursor,Math.min(end,left)]);
    cursor=Math.max(cursor,right);
    if(cursor>=end) break;
  }
  if(cursor<end) result.push([cursor,end]);
  return result;
}

export function objectBounds(object: PlacedObject, padded=true) {
  const angle=object.rotation*Math.PI/180;
  const width=Math.abs(object.width*Math.cos(angle))+Math.abs(object.height*Math.sin(angle));
  const height=Math.abs(object.width*Math.sin(angle))+Math.abs(object.height*Math.cos(angle));
  const pad=padded?object.paddingMm:0;
  return {left:object.actualX+(object.width-width)/2-pad,right:object.actualX+(object.width+width)/2+pad,top:object.actualY+(object.height-height)/2-pad,bottom:object.actualY+(object.height+height)/2+pad};
}

function pass(project: Project, tokens: Token[], objects: PlacedObject[], forced: Set<number>): Layout {
  const {width,height}=paperSize(project), vertical=project.settings.writingMode==='vertical';
  const pages: LayoutPage[]=[];
  const warnings=new Set<string>();
  const minimum=Math.max(project.pages.length,...objects.filter(o=>o.anchorMode==='page').map(o=>o.actualPage+1),1);
  let cursor=0, pageIndex=0, trailing=false;
  do {
    const visual=pageVisual(project,pageIndex), m=visual.ruling.margins, spacing=visual.ruling.spacingMm;
    const tracks=Math.floor((vertical?width-m.left-m.right:height-m.top-m.bottom)/spacing+0.000001);
    const extent=vertical?height-m.top-m.bottom:width-m.left-m.right;
    if(tracks<1 || extent<1 || !Number.isFinite(tracks)) throw new Error('余白が広すぎて本文を置けません。余白または罫線間隔を小さくしてください。');
    const page: LayoutPage={index:pageIndex,visual,lines:[],caretLines:[],start:tokens[cursor]?.start??bodyText(project).length,end:tokens[cursor]?.start??bodyText(project).length};
    pages.push(page);
    let pageBreak=false;
    trailing=false;
    for(let row=0;row<tracks && !pageBreak;row++) {
      const x=vertical?width-m.right-(row+1)*spacing:m.left;
      const y=vertical?m.top:m.top+row*spacing;
      const cuts: [number,number][]=[];
      for(const object of objects.filter(o=>o.actualPage===pageIndex && o.wrap)) {
        const box=objectBounds(object);
        if(vertical ? box.left<x+spacing && box.right>x : box.top<y+spacing && box.bottom>y) cuts.push(vertical?[box.top,box.bottom]:[box.left,box.right]);
      }
      const intervals=subtractIntervals(vertical?m.top:m.left,vertical?height-m.bottom:width-m.right,cuts);
      for(const [a,b] of intervals) {
        if(tokens[cursor] && forced.has(tokens[cursor].start) && page.lines.length>0) { pageBreak=true; break; }
        if(cursor>=tokens.length) {
          const empty={pageIndex,x:vertical?x:a,y:vertical?a:y,extent:b-a,spacing,start:bodyText(project).length,end:bodyText(project).length,tokens:[]};
          if(!page.lines.length || (tokens.at(-1)?.text==='\n' && page.lines.at(-1)?.breakAfter==='\n')) page.lines.push(empty);
          else page.caretLines.push(empty);
          // Keep a real editable line at every remaining ruling.  A single
          // trailing zero-width line made clicks in blank paper restore the
          // caret beside earlier text instead of where the user clicked.
          trailing=false; break;
        }
        if(tokens[cursor].advance>b-a && b-a<extent-0.01) continue;
        let end=lineEnd(tokens,cursor,b-a);
        const line: LayoutLine={pageIndex,x:vertical?x:a,y:vertical?a:y,extent:b-a,spacing,start:tokens[cursor].start,end:tokens[end-1]?.end??tokens[cursor].start,tokens:tokens.slice(cursor,end)};
        if(tokens[end]?.text==='\n' || tokens[end]?.text==='\f') {
          const separator=tokens[end++];
          line.breakAfter=separator.text as '\n'|'\f'; line.end=separator.end;
          // A hard page boundary immediately after a newline belongs to this
          // line, including when it is the last available row on the page.
          if(line.breakAfter==='\n'&&tokens[end]?.text==='\f'){line.breakAfter='\f';line.breakText='\n\f';line.end=tokens[end++].end;}
        }
        page.lines.push(line); cursor=end; page.end=line.end;
        if(line.tokens.some(t=>emMm(t.style)>spacing*0.92 || t.advance>line.extent)) warnings.add('文字サイズが罫線の間隔や本文領域を超えています。文字を小さくするか、ページ全体の罫線間隔・余白を調整してください。');
        if(line.breakAfter==='\f') { pageBreak=true; trailing=cursor===tokens.length; break; }
        if(line.breakAfter==='\n') { trailing=cursor===tokens.length; break; }
      }
    }
    page.end=page.lines.at(-1)?.end??page.start;
    pageIndex++;
    if(pageIndex>=1000 && cursor<tokens.length) throw new Error('ページが多すぎます。画像の回り込み・余白を見直すか、文書を分けてください。');
  } while(cursor<tokens.length || pageIndex<minimum || trailing);
  return {width,height,pages,objects,warnings:[...warnings]};
}

function balance(project: Project, tokens: Token[], objects: PlacedObject[]): Layout {
  const forced=new Set<number>();
  let result=pass(project,tokens,objects,forced);
  if(!project.settings.orphanControl) return result;
  const text=bodyText(project);
  for(let iteration=0;iteration<8;iteration++) {
    let changed=false;
    for(let i=1;i<result.pages.length;i++) {
      const left=result.pages[i-1],right=result.pages[i];
      if(!left.lines.length || !right.lines.length || /[\n\f]/.test(text[right.start-1]??'')) continue;
      const start=Math.max(text.lastIndexOf('\n',right.start-1),text.lastIndexOf('\f',right.start-1))+1;
      let end=text.slice(right.start).search(/[\n\f]/); end=end<0?text.length:right.start+end;
      const before=left.lines.filter(l=>l.start>=start), after=right.lines.filter(l=>l.start<end);
      const tracks=(lines: LayoutLine[])=>[...new Map(lines.map(l=>[project.settings.writingMode==='vertical'?l.x:l.y,l])).values()];
      const a=tracks(before),b=tracks(after);
      let split: number|undefined;
      if(b.length===1 && a.length>=3 && right.end>=end) split=a.at(-1)!.start;
      else if(a.length===1 && before.length<left.lines.length && b.length>0) split=a[0].start;
      if(split!==undefined && !forced.has(split)) {forced.add(split);changed=true;}
    }
    if(!changed) break;
    result=pass(project,tokens,objects,forced);
  }
  return result;
}

export function lineAt(layout: Layout, offset: number): LayoutLine {
  const lines=layout.pages.flatMap(p=>[...p.lines,...p.caretLines]);
  return lines.find(l=>offset>=l.start && offset<l.end) ?? lines.find(l=>l.start===offset&&l.end===offset) ?? lines.at(-1)!;
}

export function compose(project: Project, measure: Measure,adjustFlow?:(object:FloatingObject,basis:LayoutLine)=>FloatingObject): Layout {
  const tokens=tokenize(project,measure);
  const fixed=project.objects.filter(o=>o.anchorMode==='page').map(o=>({...o,actualX:o.x,actualY:o.y,actualPage:o.pageIndex}));
  let result=balance(project,tokens,fixed);
  const placed:PlacedObject[]=[...fixed];
  // Stable source order breaks equal-anchor ties. Later objects see earlier
  // wrapping, while an object never chases the text displaced by itself.
  for(const original of project.objects.filter(o=>o.anchorMode==='flow').sort((a,b)=>a.anchorOffset-b.anchorOffset)){
    const line=lineAt(result,original.anchorOffset),o=adjustFlow?.(original,line)??original;
    placed.push({...o,actualX:line.x+o.x,actualY:line.y+o.y,actualPage:line.pageIndex});
    if(o.wrap)result=balance(project,tokens,placed);
  }
  const objects=project.objects.map(o=>placed.find(p=>p.id===o.id)!);
  result.objects=objects;
  if(objects.some(o=>{const b=objectBounds(o,false);return b.left<0 || b.top<0 || b.right>result.width || b.bottom>result.height;})) result.warnings.push('用紙からはみ出した要素があります。位置やサイズを確認してください。');
  return result;
}

export function flowAnchor(project:Project,object:Pick<FloatingObject,'id'|'anchorOffset'>,measure:Measure):LayoutLine{
  let index=project.objects.findIndex(o=>o.id===object.id);if(index<0)index=project.objects.length;
  const preceding=project.objects.filter((o,i)=>o.id!==object.id&&(o.anchorMode==='page'||o.anchorOffset<object.anchorOffset||o.anchorOffset===object.anchorOffset&&i<index));
  return lineAt(compose({...project,objects:preceding},measure),object.anchorOffset);
}

export function rulingSegments(layout: Layout, pageIndex: number, vertical: boolean): {x1:number;y1:number;x2:number;y2:number}[] {
  const ruling=layout.pages[pageIndex].visual.ruling;
  if(!ruling.enabled) return [];
  const m=ruling.margins,s=ruling.spacingMm;
  const tracks=Math.floor((vertical?layout.width-m.left-m.right:layout.height-m.top-m.bottom)/s+0.000001);
  const result: {x1:number;y1:number;x2:number;y2:number}[]=[];
  for(let row=0;row<tracks;row++) {
    const cross=vertical?layout.width-m.right-(row+1)*s:m.top+(row+1)*s;
    const cuts: [number,number][]=[];
    for(const o of layout.objects.filter(o=>o.actualPage===pageIndex && o.hideRuling)) {
      const b=objectBounds(o);
      if(vertical?b.left<=cross && b.right>=cross:b.top<=cross && b.bottom>=cross) cuts.push(vertical?[b.top,b.bottom]:[b.left,b.right]);
    }
    for(const [a,b] of subtractIntervals(vertical?m.top:m.left,vertical?layout.height-m.bottom:layout.width-m.right,cuts)) result.push(vertical?{x1:cross,y1:a,x2:cross,y2:b}:{x1:a,y1:cross,x2:b,y2:cross});
  }
  return result;
}
