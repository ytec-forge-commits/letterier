import {expect,test} from 'vitest';
import {parsePageRange,fitToPrintable} from '../src/core/output';
test('出力範囲はページ番号を検証し、順序を保って重複を除く',()=>{
 expect(parsePageRange('',5)).toEqual([0,1,2,3,4]);expect(parsePageRange('1-3, 5,2',5)).toEqual([0,1,2,4]);
 for(const range of ['0','6','3-1','1.5','a','1,','1--3'])expect(()=>parsePageRange(range,5)).toThrow();
});
test('印刷領域への収まりは一度だけ均一縮小し、紙面全体を中央へ配置する',()=>{
 const fit=fitToPrintable(210,297,{left:4,top:5,width:200,height:285});expect(fit.scale).toBeCloseTo(200/210);expect(fit.left).toBeCloseTo(4);expect(fit.top).toBeGreaterThan(5);
 expect(fitToPrintable(210,297,{left:0,top:0,width:210,height:297})).toEqual({scale:1,left:0,top:0});
 expect(()=>fitToPrintable(210,297,{left:0,top:0,width:0,height:297})).toThrow();
});
