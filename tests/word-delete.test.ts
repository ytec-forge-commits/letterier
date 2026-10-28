import {expect,test} from 'vitest';
import {wordDeletionRange} from '../src/core/caret';

test.each([
 ['abc def',7,-1,{start:4,end:7}],
 ['abc def  ',9,-1,{start:4,end:9}],
 ['abc def',0,1,{start:0,end:4}],
 ['今日は晴れ',5,-1,{start:3,end:5}],
 ['文😀',3,-1,{start:1,end:3}],
 ['',0,-1,{start:0,end:0}],
] as const)('単語削除はUnicodeと空白の境界を保つ %#',(text,offset,direction,expected)=>{
 expect(wordDeletionRange(text,offset,direction)).toEqual(expected);
});
