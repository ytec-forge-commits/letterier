import {expect,test} from 'vitest';
import {shouldCoalesceEdit,type EditGroup} from '../src/core/history-coalesce';

test('連続する一文字入力だけを同じ元に戻す操作へまとめる',()=>{
  const group:EditGroup={kind:'typing',nextCursor:3,time:1000};
  expect(shouldCoalesceEdit(group,'typing',3,1500)).toBe(true);
  expect(shouldCoalesceEdit(group,'typing',3,2501)).toBe(false);
  expect(shouldCoalesceEdit(group,'deleting',3,1100)).toBe(false);
});
