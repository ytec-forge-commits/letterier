import { expect,test } from 'vitest';
import { bodyText,newProject,replaceRange,type FloatingObject } from '../src/core/model';
import { compose } from '../src/core/compose';
import { applyPageOperation,describePage,applyPageVisual } from '../src/core/pages';
const measure=()=>5;
function fixture(){
  const p=replaceRange(newProject(),0,0,'第一頁\f第二頁\f第三頁');
  p.body.runs=[{text:'第一頁\f',style:{}},{text:'第二頁\f',style:{bold:true}},{text:'第三頁',style:{}}];
  const o:FloatingObject={id:'flow',kind:'text',text:'署名',style:p.baseStyle,anchorMode:'flow',anchorOffset:5,pageIndex:1,x:0,y:0,width:10,height:10,rotation:0,opacity:1,wrap:false,paddingMm:2,hideRuling:false,z:1};
  p.objects=[o,{...o,id:'fixed',anchorMode:'page',x:120,y:240}];return p;
}
test('ページの本文範囲と追従・固定要素を確認用に列挙する',()=>{
  const p=fixture(),summary=describePage(p,compose(p,measure),1);
  expect(summary.text).toBe('第二頁');expect(summary.start).toBe(4);expect(summary.end).toBe(8);
  expect(summary.objects.map(o=>o.id)).toEqual(['flow','fixed']);
});
test('複製は書式と追従位置を保ち新しいオブジェクトIDを与える',()=>{
  const p=fixture(),before=JSON.stringify(p),n=applyPageOperation(p,compose(p,measure),{type:'duplicate',index:1},measure);
  expect(bodyText(n)).toBe('第一頁\f第二頁\f第二頁\f第三頁');
  expect(n.body.runs.filter(r=>r.style.bold).map(r=>r.text).join('')).toContain('第二頁');
  expect(n.objects).toHaveLength(4);expect(new Set(n.objects.map(o=>o.id)).size).toBe(4);
  expect(n.objects.filter(o=>o.anchorMode==='flow').map(o=>o.anchorOffset)).toEqual([5,9]);
  expect(JSON.stringify(p)).toBe(before);
});
test('移動した本文に追従物と固定物が一緒に移動する',()=>{
  const p=fixture(),n=applyPageOperation(p,compose(p,measure),{type:'move',index:1,target:0},measure);
  expect(bodyText(n)).toBe('第二頁\f第一頁\f第三頁');
  expect(n.objects.find(o=>o.id==='flow')?.anchorOffset).toBe(1);
  expect(n.objects.find(o=>o.id==='fixed')?.pageIndex).toBe(0);
});
test('ページ削除は対象の範囲と要素だけを取り除く',()=>{
  const p=fixture(),n=applyPageOperation(p,compose(p,measure),{type:'delete',index:1},measure);
  expect(bodyText(n)).toBe('第一頁\f第三頁');expect(n.objects).toHaveLength(0);
  expect(bodyText(p)).toBe('第一頁\f第二頁\f第三頁');
});
test('最後の1ページを削除しても編集可能な空のページを残す',()=>{
  const p=replaceRange(newProject(),0,0,'本文'),n=applyPageOperation(p,compose(p,measure),{type:'delete',index:0},measure);
  expect(bodyText(n)).toBe('');expect(compose(n,measure).pages).toHaveLength(1);
});
test('3ページ目だけの罫線変更を続きページへ波及させない',()=>{
  const p=fixture(),visual=structuredClone(p.continuation);visual.ruling.color='#ff0000';
  const next=applyPageVisual(p,2,visual,'page');
  expect(next.pages[2].ruling.color).toBe('#ff0000');
  expect(next.pages[1].ruling.color).toBe(p.continuation.ruling.color);
  expect(next.continuation).toEqual(p.continuation);
});
