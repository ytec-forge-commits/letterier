import { expect, test } from 'vitest';
import { newProject, bodyText, replaceRange, formatRange, paperSize, type FloatingObject } from '../src/core/model';
import {applyBodyFont} from '../src/core/text-format';
import {compose} from '../src/core/compose';

test('文書設定がA4実寸と縦横で入れ替わる', () => {
  const p = newProject();
  expect(paperSize(p)).toEqual({width:210,height:297});
  p.settings.paper='B5'; expect(paperSize(p)).toEqual({width:182,height:257});
  p.settings.paper='POSTCARD'; p.settings.orientation='landscape'; expect(paperSize(p)).toEqual({width:148,height:100});
});
test('選択範囲の置換で前後の文章・書式を保持する', () => {
  const p = newProject(); p.body.runs = [{text:'あいう',style:{bold:true}},{text:'えお',style:{color:'#ff0000'}}];
  const next = replaceRange(p,1,4,'かき');
  expect(bodyText(next)).toBe('あかきお');
  expect(bodyText(p)).toBe('あいうえお');
  expect(next.body.runs[0].style.bold).toBe(true);
  expect(next.body.runs.at(-1)!.style.color).toBe('#ff0000');
});
test('部分書式は選択文字だけに適用し不足フォント指定も維持する', () => {
  const p = newProject(); p.baseStyle.fontFamily='存在しない元フォント'; p.body.runs=[{text:'あいうえ',style:{}}];
  const next = formatRange(p,1,3,{bold:true,color:'#ff0000'});
  expect(next.body.runs.map(r=>[r.text,!!r.style.bold])).toEqual([['あ',false],['いう',true],['え',false]]);
  expect(next.baseStyle.fontFamily).toBe('存在しない元フォント');
  expect(bodyText(next)).toBe('あいうえ');
});
test('本文追従アンカーは前方の編集へ追従しページ固定は動かない', () => {
  const p = newProject(); p.body.runs=[{text:'あいうえお',style:{}}];
  const base:FloatingObject={id:'a',kind:'text',text:'署名',anchorMode:'flow',anchorOffset:3,pageIndex:1,x:10,y:10,width:30,height:10,rotation:0,opacity:1,wrap:false,paddingMm:2,hideRuling:false,z:1};
  p.objects=[base,{...base,id:'b',anchorMode:'page'}];
  const next=replaceRange(p,0,1,'かきく');
  expect(next.objects.map(o=>[o.anchorOffset,o.pageIndex])).toEqual([[5,1],[3,1]]);
});
test('改行・手動改ページも本文位置を持ち削除して戻せる', () => {
  const p=replaceRange(newProject(),0,0,'あ\nい\fう');
  expect(bodyText(replaceRange(p,3,4,''))).toBe('あ\nいう');
});
test('指定ページの本文だけへフォントを一括適用する',()=>{
  const p=replaceRange(newProject(),0,0,'第一頁\f第二頁');
  const layout=compose(p,()=>5);
  const next=applyBodyFont(p,'Klee One',{scope:'page',pageIndex:1,layout});
  expect(next.body.runs.map(run=>[run.text,run.style.fontFamily??''])).toEqual([
    ['第一頁\f',''],['第二頁','Klee One'],
  ]);
  expect(next.baseStyle.fontFamily).toBe(p.baseStyle.fontFamily);
});
test('全ページの本文と標準フォントを同じフォントへ揃える',()=>{
  const p=replaceRange(newProject(),0,0,'本文');p.body.runs=[{text:'本',style:{fontFamily:'Yomogi'}},{text:'文',style:{}}];
  const next=applyBodyFont(p,'Klee One',{scope:'all'});
  expect(next.baseStyle.fontFamily).toBe('Klee One');
  expect(next.body.runs).toEqual([{text:'本文',style:{fontFamily:'Klee One'}}]);
});
