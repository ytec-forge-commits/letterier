import {expect, test} from 'vitest';
import {newProject, replaceRange} from '../src/core/model';
import {compose} from '../src/core/compose';
import {createFromTemplate} from '../src/core/templates';
import {PageArtwork} from '../src/ui/Paper';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {packProject,unpackProject} from '../src/core/archive';
const measure=()=>5;

test('白紙の新規作成でもフォント追従を標準にし、旧設定を読み込む際には自動で追加しない',()=>{
  const p=newProject();
  expect(p.pages[0].ruling.autoSpacing).toBe(true);
  expect(p.pages[0].ruling.autoWidth).toBe(true);
  delete p.pages[0].ruling.autoSpacing;delete p.pages[0].ruling.autoWidth;
  delete p.continuation.ruling.autoSpacing;delete p.continuation.ruling.autoWidth;
  const legacy=unpackProject(packProject(p));
  expect(legacy.pages[0].ruling.autoSpacing).toBeUndefined();
  expect(legacy.continuation.ruling.autoWidth).toBeUndefined();
});

test('組込み便箋の新規作成はフォント追従の罫線を標準で有効にする',()=>{
  const p=createFromTemplate('sakura');
  expect(p.pages[0].ruling.autoSpacing).toBe(true);
  expect(p.pages[0].ruling.autoWidth).toBe(true);
  expect(p.continuation.ruling.autoSpacing).toBe(true);
});

test('自動罫線間隔は小さな標準文字でも本文を窮屈にせず、大きな文字に追従する',()=>{
  const p=replaceRange(newProject(),0,0,'あいう\n大きい\nえお');
  p.settings.orphanControl=false;
  p.pages[0].ruling.autoSpacing=true;
  p.baseStyle.sizePt=14;
  p.body.runs=[{text:'あいう\n',style:{}},{text:'大きい\n',style:{sizePt:30}},{text:'えお',style:{}}];
  const lines=compose(p,measure).pages[0].lines;
  expect(lines[0].spacing).toBeCloseTo(8);
  expect(lines[1].spacing).toBeCloseTo(17);
  expect(lines[2].y-lines[1].y).toBeCloseTo(17);
});

test('自動太さは大きな標準フォントに控えめに追従し、手動指定は保持する',()=>{
  const p=replaceRange(newProject(),0,0,'手紙');p.baseStyle.sizePt=56;
  p.pages[0].ruling.autoWidth=true;
  const markup=renderToStaticMarkup(createElement(PageArtwork,{project:p,layout:compose(p,measure),index:0}));
  expect(markup).toContain('stroke-width="0.3"');
  p.pages[0].ruling.autoWidth=false;p.pages[0].ruling.widthMm=.25;
  expect(renderToStaticMarkup(createElement(PageArtwork,{project:p,layout:compose(p,measure),index:0}))).toContain('stroke-width="0.25"');
});

test('自動調整と手動設定の切替は保存で維持する',()=>{
  const p=newProject();p.pages[0].ruling.autoWidth=false;p.pages[0].ruling.autoSpacing=true;
  const reopened=unpackProject(packProject(p));
  expect(reopened.pages[0].ruling.autoWidth).toBe(false);
  expect(reopened.pages[0].ruling.autoSpacing).toBe(true);
  expect(reopened.pages[0].ruling.widthMm).toBe(.15);
});

test('本文の回り込みと罫線非表示を自動罫線でも独立させる',()=>{
  const p=replaceRange(newProject(),0,0,'手紙');p.pages[0].ruling.autoSpacing=true;
  p.objects=[{id:'image',kind:'image',assetId:'synthetic',anchorMode:'page',anchorOffset:0,pageIndex:0,x:20,y:20,width:170,height:8,rotation:0,opacity:1,wrap:true,paddingMm:0,hideRuling:false,z:1}];
  const markup=renderToStaticMarkup(createElement(PageArtwork,{project:p,layout:compose(p,measure),index:0}));
  expect(markup).toContain('x1="20" y1="28" x2="190" y2="28"');
});

test('手動改ページ後の空き紙面にも自動罫線を描画する',()=>{
  const p=replaceRange(newProject(),0,0,'手紙\f続き');p.pages[0].ruling.autoSpacing=true;
  const markup=renderToStaticMarkup(createElement(PageArtwork,{project:p,layout:compose(p,measure),index:0}));
  expect(markup).toContain('y1="276"');
});
