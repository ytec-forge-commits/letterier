import {expect,test} from 'vitest';
import {newProject,replaceRange} from '../src/core/model';
import {compose} from '../src/core/compose';
import {moveBlockCaret,pickCaretCandidate} from '../src/core/caret';
test('次の行への移動はページを越えて同じ本文座標へ進む',()=>{
 const p=replaceRange(newProject(),0,0,('あ'.repeat(40)+'\n').repeat(60)),layout=compose(p,()=>5);
 const last=layout.pages[0].lines.at(-1)!;
 const result=moveBlockCaret(layout,false,0,last.start,last.start+2,1);
 expect(result.pageIndex).toBe(1);expect(result.offset).toBe(layout.pages[1].lines[0].start+2);
 const reverse=moveBlockCaret(layout,false,1,layout.pages[1].lines[0].start,result.offset,-1);
 expect(reverse.pageIndex).toBe(0);expect(reverse.offset).toBe(last.start+2);
});
test('縦書きは列を進む向きが変わってもページ境界を越えられる',()=>{
 const p=replaceRange(newProject(),0,0,('あ'.repeat(60)+'\n').repeat(60));p.settings.writingMode='vertical';const layout=compose(p,()=>5),last=layout.pages[0].lines.at(-1)!;
 const result=moveBlockCaret(layout,true,0,last.start,last.start+3,1);expect(result.pageIndex).toBe(1);expect(result.offset).toBe(layout.pages[1].lines[0].start+3);
});
test('IME確定後は同じ位置の空き列より直前の文字末尾へキャレットを戻す',()=>{
  const candidates=[
    {start:10,end:12,empty:false},
    {start:12,end:12,empty:true},
    {start:12,end:12,empty:true},
  ];
  expect(pickCaretCandidate(candidates,12,true)).toBe(0);
  expect(pickCaretCandidate(candidates,12,false)).toBe(1);
});
