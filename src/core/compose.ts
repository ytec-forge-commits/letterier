import { bodyText, paperSize, pageVisual, type Project, type TextStyle, type FloatingObject, type PageVisual } from './model';
import { graphemes, lineEnd } from './layout';
import {decorationMotifLayout,illustratedTemplateIds} from './stationery-layout';
import {resolveStationeryArtwork} from './stationery-artwork';
export interface Token { text: string; start: number; end: number; advance: number; style: TextStyle; tcy: boolean }
export interface LayoutLine { pageIndex: number; x: number; y: number; extent: number; spacing: number; start: number; end: number; tokens: Token[]; breakAfter?: '\n' | '\f';breakText?:string }
export interface LayoutPage { index: number; visual: PageVisual; lines: LayoutLine[]; caretLines: LayoutLine[]; rulingTracks?: Pick<LayoutLine,'x'|'y'|'extent'|'spacing'>[]; start: number; end: number }
export interface PlacedObject extends FloatingObject { actualX: number; actualY: number; actualPage: number }
export interface Layout { width: number; height: number; pages: LayoutPage[]; objects: PlacedObject[]; warnings: string[] }
export type Measure = (text: string, style: TextStyle) => number;
export const emMm = (style: TextStyle) => style.sizePt * 25.4 / 72;
export const automaticRulingSpacing = (style: TextStyle) => Math.max(4,Math.ceil(emMm(style)*1.6*2)/2);
export const automaticRulingWidth = (style: TextStyle) => Math.round(Math.max(.1,Math.min(.3,.15*Math.sqrt(style.sizePt/14)))*1000)/1000;
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
      // LineContent renders vertical text upright, except the explicitly rotated ASCII brackets.
      const advance = /[\n\f]/.test(piece) ? 0 : (tcy ? emMm(style) : vertical && !/^[()[\]{}<>]$/.test(piece) ? emMm(style) : measure(piece,style)) + (style.letterSpacingPt??0)*25.4/72;
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

function pass(project: Project, tokens: Token[], objects: PlacedObject[], forced: Set<number>, measure: Measure): Layout {
  const {width,height}=paperSize(project), vertical=project.settings.writingMode==='vertical';
  const pages: LayoutPage[]=[];
  const warnings=new Set<string>();
  const minimum=Math.max(project.pages.length,...objects.filter(o=>o.anchorMode==='page').map(o=>o.actualPage+1),1);
  let cursor=0, pageIndex=0, trailing=false;
  do {
    const visual=pageVisual(project,pageIndex), m={...visual.ruling.margins}, minimumSpacing=visual.ruling.autoSpacing?automaticRulingSpacing(project.baseStyle):visual.ruling.spacingMm;
    const artwork=resolveStationeryArtwork(visual.design);
    const motifs=artwork&&(artwork.primary||illustratedTemplateIds.has(artwork.id))?decorationMotifLayout(artwork.id,width,height,project.settings.writingMode,artwork.continuation).placements:[];
    const count=visual.ruling.charactersPerLine;
    if(count!==undefined) {
      const available=vertical?height-m.top-m.bottom:width-m.left-m.right;
      const target=count*((vertical?emMm(project.baseStyle):measure('あ',project.baseStyle))+(project.baseStyle.letterSpacingPt??0)*25.4/72);
      if(target>available+.001)warnings.add('指定した1行の文字数は現在のフォント・用紙に収まりません。本文幅は用紙に収まる範囲に制限しています。');
      const inset=Math.max(0,(available-target)/2);
      if(vertical){m.top+=inset;m.bottom+=inset;}else{m.left+=inset;m.right+=inset;}
    }
    const crossExtent=vertical?width-m.left-m.right:height-m.top-m.bottom;
    const tracks=Math.floor(crossExtent/minimumSpacing+0.000001);
    const extent=vertical?height-m.top-m.bottom:width-m.left-m.right;
    if(tracks<1 || extent<1 || !Number.isFinite(tracks)) throw new Error('余白が広すぎて本文を置けません。余白または罫線間隔を小さくしてください。');
    const page: LayoutPage={index:pageIndex,visual,lines:[],caretLines:[],rulingTracks:[],start:tokens[cursor]?.start??bodyText(project).length,end:tokens[cursor]?.start??bodyText(project).length};
    pages.push(page);
    let pageBreak=false;
    trailing=false;
    let crossUsed=0;
    for(let row=0;row<tracks && !pageBreak;row++) {
      let spacing=minimumSpacing;
      let x=0,y=0,intervals:[number,number][]=[];
      // Larger glyphs change the occupied band and therefore the wrapping cuts.
      // Plan without consuming tokens until the band's size has stabilized.
      const adaptive=count!==undefined||visual.ruling.autoSpacing===true;
      for(let attempt=0;attempt<=tokens.length+1;attempt++) {
        x=vertical?width-m.right-crossUsed-spacing:m.left;
        y=vertical?m.top:m.top+crossUsed;
        const cuts:[number,number][]=[];
        // Keep the configured body margins, but wrap each occupied text band
        // around the same corner artwork that the ruling already avoids.
        // Recompute when mixed font sizes expand the band's spacing.
        for(const box of motifs){
          if(vertical?box.x-1<x+spacing&&box.x+box.width+1>x:box.y-1<y+spacing&&box.y+box.height+1>y)cuts.push(vertical?[box.y-1,box.y+box.height+1]:[box.x-1,box.x+box.width+1]);
        }
        for(const object of objects.filter(o=>o.actualPage===pageIndex&&o.wrap)){
          const box=objectBounds(object);
          if(vertical?box.left<x+spacing&&box.right>x:box.top<y+spacing&&box.bottom>y)cuts.push(vertical?[box.top,box.bottom]:[box.left,box.right]);
        }
        intervals=subtractIntervals(vertical?m.top:m.left,vertical?height-m.bottom:width-m.right,cuts);
        if(!adaptive)break;
        let planned=cursor,required=spacing;
        if(planned>=tokens.length)required=Math.max(required,emMm(project.baseStyle)/.92);
        for(const [a,b] of intervals){
          if(planned>=tokens.length)break;
          if(tokens[planned].advance>b-a&&b-a<extent-.01)continue;
          const end=lineEnd(tokens,planned,b-a,!vertical);
          for(let i=planned;i<end;i++)required=Math.max(required,visual.ruling.autoSpacing?automaticRulingSpacing(tokens[i].style):emMm(tokens[i].style)/.92);
          planned=end;
          if(tokens[planned]?.text==='\n'||tokens[planned]?.text==='\f')break;
        }
        if(required<=spacing+.00001)break;
        spacing=required;
      }
      if(crossUsed+spacing>crossExtent+.001){
        if(row===0)throw new Error('文字が本文領域に収まりません。文字サイズを小さくするか余白を広げてください。');
        pageBreak=true;break;
      }
      page.rulingTracks!.push({x,y,extent,spacing});
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
        if(adaptive&&tokens[cursor].advance>extent+.001)throw new Error('文字が1行の本文幅に収まりません。1行の文字数を増やすか文字サイズを小さくしてください。');
        let end=lineEnd(tokens,cursor,b-a,!vertical);
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
      crossUsed+=spacing;
    }
    // Ruling is a page decoration, not a by-product of the available text runs.
    // Keep blank bands and bands fully covered by wrapping objects too.
    while(crossUsed+minimumSpacing<=crossExtent+.001){
      page.rulingTracks!.push({x:vertical?width-m.right-crossUsed-minimumSpacing:m.left,y:vertical?m.top:m.top+crossUsed,extent,spacing:minimumSpacing});
      crossUsed+=minimumSpacing;
    }
    page.end=page.lines.at(-1)?.end??page.start;
    pageIndex++;
    if(pageIndex>=1000 && cursor<tokens.length) throw new Error('ページが多すぎます。画像の回り込み・余白を見直すか、文書を分けてください。');
  } while(cursor<tokens.length || pageIndex<minimum || trailing);
  return {width,height,pages,objects,warnings:[...warnings]};
}

function balance(project: Project, tokens: Token[], objects: PlacedObject[], measure: Measure): Layout {
  const forced=new Set<number>();
  let result=pass(project,tokens,objects,forced,measure);
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
    result=pass(project,tokens,objects,forced,measure);
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
  let result=balance(project,tokens,fixed,measure);
  const placed:PlacedObject[]=[...fixed];
  // Stable source order breaks equal-anchor ties. Later objects see earlier
  // wrapping, while an object never chases the text displaced by itself.
  for(const original of project.objects.filter(o=>o.anchorMode==='flow').sort((a,b)=>a.anchorOffset-b.anchorOffset)){
    const line=lineAt(result,original.anchorOffset),o=adjustFlow?.(original,line)??original;
    placed.push({...o,actualX:line.x+o.x,actualY:line.y+o.y,actualPage:line.pageIndex});
    if(o.wrap)result=balance(project,tokens,placed,measure);
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
  const artwork=resolveStationeryArtwork(layout.pages[pageIndex].visual.design);
  const motifs=artwork&&(artwork.primary||illustratedTemplateIds.has(artwork.id))?decorationMotifLayout(artwork.id,layout.width,layout.height,vertical?'vertical':'horizontal',artwork.continuation).placements:[];
  const decorationCuts=(cross:number):[number,number][]=>motifs.filter(b=>vertical?cross>=b.x-1&&cross<=b.x+b.width+1:cross>=b.y-1&&cross<=b.y+b.height+1).map(b=>vertical?[b.y-1,b.y+b.height+1]:[b.x-1,b.x+b.width+1]);
  if(ruling.charactersPerLine!==undefined||ruling.autoSpacing){
    const lines=layout.pages[pageIndex].rulingTracks??[...layout.pages[pageIndex].lines,...layout.pages[pageIndex].caretLines];
    const unique=new Map<string,{x1:number;y1:number;x2:number;y2:number}>();
    for(const line of lines){
      const cross=vertical?line.x:line.y+line.spacing;
      const cuts:[number,number][]=decorationCuts(cross);
      for(const o of layout.objects.filter(o=>o.actualPage===pageIndex&&o.hideRuling)){
        const b=objectBounds(o);
        if(vertical?b.left<=cross&&b.right>=cross:b.top<=cross&&b.bottom>=cross)cuts.push(vertical?[b.top,b.bottom]:[b.left,b.right]);
      }
      const start=vertical?line.y:line.x;
      for(const [a,b] of subtractIntervals(start,start+line.extent,cuts)){
        const segment=vertical?{x1:cross,y1:a,x2:cross,y2:b}:{x1:a,y1:cross,x2:b,y2:cross};
        unique.set(JSON.stringify(segment),segment);
      }
    }
    return [...unique.values()];
  }
  const tracks=Math.floor((vertical?layout.width-m.left-m.right:layout.height-m.top-m.bottom)/s+0.000001);
  const result: {x1:number;y1:number;x2:number;y2:number}[]=[];
  for(let row=0;row<tracks;row++) {
    const cross=vertical?layout.width-m.right-(row+1)*s:m.top+(row+1)*s;
    const cuts: [number,number][]=decorationCuts(cross);
    for(const o of layout.objects.filter(o=>o.actualPage===pageIndex && o.hideRuling)) {
      const b=objectBounds(o);
      if(vertical?b.left<=cross && b.right>=cross:b.top<=cross && b.bottom>=cross) cuts.push(vertical?[b.top,b.bottom]:[b.left,b.right]);
    }
    for(const [a,b] of subtractIntervals(vertical?m.top:m.left,vertical?layout.height-m.bottom:layout.width-m.right,cuts)) result.push(vertical?{x1:cross,y1:a,x2:cross,y2:b}:{x1:a,y1:cross,x2:b,y2:cross});
  }
  return result;
}
