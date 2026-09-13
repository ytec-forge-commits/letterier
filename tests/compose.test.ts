import { expect, test } from 'vitest';
import { newProject, replaceRange, type FloatingObject } from '../src/core/model';
import { compose, tokenize, subtractIntervals, rulingSegments, type Measure } from '../src/core/compose';
const measure: Measure = () => 5;
function tiny(text: string, vertical=false) {
  const p=replaceRange(newProject(),0,0,text);
  p.settings.writingMode=vertical?'vertical':'horizontal'; p.settings.orphanControl=false;
  p.pages[0].ruling={...p.pages[0].ruling,spacingMm:10,margins:vertical?{top:10,bottom:272,left:170,right:20}:{top:10,bottom:267,left:20,right:175}};
  p.continuation=structuredClone(p.pages[0]);
  return p;
}
const object: FloatingObject = { id:'image',kind:'image',assetId:'a',anchorMode:'page',anchorOffset:0,pageIndex:0,x:25,y:10,width:5,height:10,rotation:0,opacity:1,wrap:true,paddingMm:0,hideRuling:true,z:1 };

test('重なる除外矩形を合成し左右の空き区間を保持する',()=>{
  expect(subtractIntervals(0,100,[[20,40],[30,50],[80,120]])).toEqual([[0,20],[50,80]]);
});
test('独立した2桁だけを縦中横にし西暦を分割しない',()=>{
  const p=tiny('12月 2026年 3日',true);
  expect(tokenize(p,measure).filter(t=>t.tcy).map(t=>t.text)).toEqual(['12']);
});
test('縦中横の個別解除と明示適用を保持する',()=>{
  const p=tiny('',true); p.body.runs=[{text:'12',style:{verticalInlineMode:'normal'}},{text:'AB',style:{verticalInlineMode:'tate-chu-yoko'}}];
  expect(tokenize(p,measure).filter(t=>t.tcy).map(t=>t.text)).toEqual(['AB']);
});
test('横書き3文字×2行で続きページへ流し本文位置を保持する',()=>{
  const layout=compose(tiny('あいうえおかきくけ'),measure);
  expect(layout.pages.map(p=>p.lines.map(l=>l.tokens.map(t=>t.text).join('')))).toEqual([['あいう','えおか'],['きくけ']]);
  expect(layout.pages.map(p=>[p.start,p.end])).toEqual([[0,6],[6,9]]);
});
test('縦書きは右列から左列へ流す',()=>{
  const layout=compose(tiny('あいうえおかきくけ',true),()=>5);
  expect(layout.pages[0].lines.map(l=>l.x)).toEqual([180,170]);
  expect(layout.pages.length).toBe(2);
});
test('画像の左と右の両側に横本文を回り込ませる',()=>{
  const p=tiny('あいうえお'); p.objects=[object];
  const l=compose(p,measure);
  expect(l.pages[0].lines.slice(0,2).map(x=>[x.x,x.extent,x.tokens.map(t=>t.text).join('')])).toEqual([[20,5,'あ'],[30,5,'い']]);
});
test('縦本文は画像の上下を避ける',()=>{
  const p=tiny('あいうえお',true); p.objects=[{...object,x:180,y:15,width:10,height:5}];
  const l=compose(p,()=>5);
  expect(l.pages[0].lines.slice(0,2).map(x=>[x.y,x.extent,x.tokens.map(t=>t.text).join('')])).toEqual([[10,5,'あ'],[20,5,'い']]);
});
test('罫線だけの非表示は本文回避と独立し削除後に戻る',()=>{
  const p=tiny('あいう'); p.objects=[{...object,wrap:false,height:12}];
  const l=compose(p,measure); const pieces=rulingSegments(l,0,false);
  expect(pieces.filter(x=>x.y1===20).map(x=>[x.x1,x.x2])).toEqual([[20,25],[30,35]]);
  p.objects=[];
  expect(rulingSegments(compose(p,measure),0,false).filter(x=>x.y1===20).map(x=>[x.x1,x.x2])).toEqual([[20,35]]);
});
test('大文字は勝手に縮小せず罫線間隔の警告を出す',()=>{
  const p=tiny('大'); p.body.runs[0].style.sizePt=72;
  const l=compose(p,measure);
  expect(l.warnings.some(w=>w.includes('文字サイズ'))).toBe(true);
  expect(l.pages[0].lines[0].tokens[0].style.sizePt).toBe(72);
  expect(l.pages[0].visual.ruling.spacingMm).toBe(10);
});
test('手動改ページを優先し区切りの本文位置を保持する',()=>{
  const l=compose(tiny('あ\fい'),measure);
  expect(l.pages.map(p=>[p.start,p.end])).toEqual([[0,2],[2,3]]);
});
test('孤立行設定ONは4+1を3+2へ調整しOFFは詰める',()=>{
  const p=tiny('あいうえおかきくけこさしすせそ');
  p.pages[0].ruling.margins.bottom=247; p.continuation=structuredClone(p.pages[0]);
  expect(compose(p,measure).pages.map(p=>p.lines.length)).toEqual([4,1]);
  p.settings.orphanControl=true;
  expect(compose(p,measure).pages.map(p=>p.lines.length)).toEqual([3,2]);
});
test('末尾Enterの次行にもキャレット用の空行を配置する',()=>{
  const l=compose(tiny('あ\n'),measure);
  expect(l.pages[0].lines.map(x=>[x.start,x.end])).toEqual([[0,2],[2,2]]);
});
test('ページ末尾Enterは次ページの空行へ進む',()=>{
  const l=compose(tiny('あいうえおか\n'),measure);
  expect(l.pages.map(p=>p.lines.map(x=>[x.start,x.end]))).toEqual([[[0,3],[3,7]],[[7,7]]]);
});
test('本文末尾より下の各罫線に、クリックして表示できる空のキャレット行を用意する',()=>{
  const l=compose(tiny('あ'),measure);
  expect(l.pages[0].caretLines.filter(line=>line.start===1&&line.end===1)).toHaveLength(1);
});
