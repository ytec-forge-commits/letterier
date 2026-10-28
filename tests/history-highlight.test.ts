import {expect,test} from 'vitest';
import {newProject,replaceRange,formatRange} from '../src/core/model';
import {historyHighlight} from '../src/core/history-highlight';
test('履歴で戻った文字の範囲を、前後の同じ文章を除いて示す',()=>{
 const before=replaceRange(newProject(),0,0,'前後'),after=replaceRange(before,1,1,'日本語');
 expect(historyHighlight(before,after)).toEqual({start:1,end:4,kind:'text'});
 expect(historyHighlight(after,before)).toEqual({start:1,end:1,kind:'deletion'});
});
test('再変換した絵文字や結合文字の一部だけを強調しない',()=>{
 const before=replaceRange(newProject(),0,0,'A😀B'),after=replaceRange(before,1,3,'😁');
 expect(historyHighlight(before,after)).toEqual({start:1,end:3,kind:'text'});
 const old=replaceRange(newProject(),0,0,'Aか\u3099B'),next=replaceRange(old,2,3,'');
 expect(historyHighlight(old,next)).toEqual({start:1,end:2,kind:'text'});
});
test('本文が同じでもフォント・サイズ等の書式変更範囲を強調する',()=>{
 const before=replaceRange(newProject(),0,0,'前本文後'),after=formatRange(before,1,3,{bold:true,sizePt:20});
 expect(historyHighlight(before,after)).toEqual({start:1,end:3,kind:'format'});
 expect(historyHighlight(after,before)).toEqual({start:1,end:3,kind:'format'});
 expect(historyHighlight(before,{...before,title:'名前だけ'})).toBeNull();
});
test('標準フォント変更で影響しない明示書式は強調しない',()=>{
 const before=formatRange(replaceRange(newProject(),0,0,'固定本文'),0,2,{fontFamily:'Yomogi'}),after={...before,baseStyle:{...before.baseStyle,fontFamily:'Klee One'}};
 expect(historyHighlight(before,after)).toEqual({start:2,end:4,kind:'format'});
});
