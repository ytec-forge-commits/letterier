import {expect, test} from 'vitest';
import {newProject, replaceRange, bodyText, type TextStyle} from '../src/core/model';
import {compose, rulingSegments, type Measure} from '../src/core/compose';
import {packProject, unpackProject, validateProject} from '../src/core/archive';

// Synthetic, full-width font metrics: every grapheme occupies one em.
const measure: Measure = (_text: string, style: TextStyle) => style.sizePt * 25.4 / 72;
function document(text: string, vertical=false) {
  const p=replaceRange(newProject(),0,0,text);
  p.settings.writingMode=vertical?'vertical':'horizontal';
  p.settings.orphanControl=false;
  Object.assign(p.pages[0].ruling,{charactersPerLine:3});
  p.continuation=structuredClone(p.pages[0]);
  return p;
}

test.each([false,true])('標準書式の全角3文字を目安に横/縦の本文領域を設定する: vertical=%s',vertical=>{
  const layout=compose(document('あいうえおかきくけ',vertical),measure);
  expect(layout.pages[0].lines.map(line=>line.tokens.map(t=>t.text).join(''))).toEqual(['あいう','えおか','きくけ']);
  expect(layout.pages[0].lines[0].extent).toBeCloseTo(14.81666667);
});

test.each([false,true])('途中の大きな文字は縮小せず実寸で折り返し行間を確保する: vertical=%s',vertical=>{
  const p=document('',vertical);
  p.body.runs=[{text:'あいう',style:{}},{text:'大',style:{sizePt:24}},{text:'えおかきく',style:{fontFamily:'別の合成フォント'}}];
  const layout=compose(p,measure),lines=layout.pages.flatMap(page=>page.lines);
  expect(lines.map(line=>line.tokens.map(t=>t.text).join(''))).toEqual(['あいう','大え','おかき','く']);
  const big=lines[1];
  expect(big.tokens[0].style.sizePt).toBe(24);
  expect(big.spacing).toBeGreaterThanOrEqual(9.2);
  expect(vertical ? lines[0].x-big.x : lines[2].y-big.y).toBeGreaterThanOrEqual(9.2);
  expect(lines.flatMap(line=>line.tokens).map(token=>token.text).join('')).toBe(bodyText(p));
  const rules=rulingSegments(layout,0,vertical);
  expect(rules.some(rule=>Math.abs((vertical?rule.x1:rule.y1)-(vertical?big.x:big.y+big.spacing))<.001)).toBe(true);
});

test('用紙に収まらない目安文字数は紙面幅で制限し案内する',()=>{
  const p=document('あいう');Object.assign(p.pages[0].ruling,{charactersPerLine:200});
  const layout=compose(p,measure);
  expect(layout.pages[0].lines[0].extent).toBeCloseTo(170);
  expect(layout.warnings.some(w=>w.includes('文字数'))).toBe(true);
});

test('文字数設定は保存・再読込で保持し、従来の文書には追加しない',()=>{
  const p=document('あいうえお');
  const reopened=unpackProject(packProject(p));
  expect(reopened.pages[0].ruling).toHaveProperty('charactersPerLine',3);
  expect(reopened.continuation.ruling).toHaveProperty('charactersPerLine',3);
  expect(validateProject(newProject()).pages[0].ruling).not.toHaveProperty('charactersPerLine');
});

test.each([0,-1,2.5,201,NaN])('壊れた文字数設定を保存しない: %s',value=>{
  const p=document('あいう');Object.assign(p.pages[0].ruling,{charactersPerLine:value});
  expect(()=>validateProject(p)).toThrow();
});
