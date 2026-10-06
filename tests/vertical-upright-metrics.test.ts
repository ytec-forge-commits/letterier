import {expect,test} from 'vitest';
import {newProject,replaceRange} from '../src/core/model';
import {compose,tokenize} from '../src/core/compose';

test('縦書きのupright英数字を横幅で詰め込まず3文字目安で折り返す',()=>{
 const p=replaceRange(newProject(),0,0,'ABC123DEF');p.settings.writingMode='vertical';p.settings.orphanControl=false;
 p.baseStyle.sizePt=18;p.baseStyle.verticalInlineMode='normal';p.pages[0].ruling.charactersPerLine=3;
 const lines=compose(p,()=>1).pages[0].lines;
 expect(lines.map(l=>l.tokens.map(t=>t.text).join(''))).toEqual(['ABC','123','DEF']);
 expect(lines[0].extent).toBeCloseTo(19.05);
 expect(lines.flatMap(l=>l.tokens).map(t=>t.advance)).toEqual(Array(9).fill(6.35));
});

test('縦書きの半角空白と句点もuprightの高さを確保し、回転括弧は実幅を使う',()=>{
 const p=replaceRange(newProject(),0,0,'A .(B)[C]{D}<E>');p.settings.writingMode='vertical';p.baseStyle.sizePt=18;
 const tokens=tokenize(p,()=>1);
 expect(tokens.map(t=>t.advance)).toEqual([6.35,6.35,6.35,1,6.35,1,1,6.35,1,1,6.35,1,1,6.35,1]);
});

test('2桁の縦中横は2文字分でなく1emを占有し横書きの実幅は維持する',()=>{
 const p=replaceRange(newProject(),0,0,'A12B');p.baseStyle.sizePt=18;p.settings.writingMode='vertical';
 expect(tokenize(p,()=>1).map(t=>({text:t.text,advance:t.advance,tcy:t.tcy}))).toEqual([
  {text:'A',advance:6.35,tcy:false},{text:'12',advance:6.35,tcy:true},{text:'B',advance:6.35,tcy:false},
 ]);
 p.settings.writingMode='horizontal';expect(tokenize(p,()=>1).map(t=>t.advance)).toEqual([1,1,1,1]);
});
