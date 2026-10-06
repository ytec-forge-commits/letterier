import {expect, test} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {newProject, replaceRange} from '../src/core/model';
import {compose, tokenize} from '../src/core/compose';
import {packProject, unpackProject, validateProject} from '../src/core/archive';
import {LineContent} from '../src/ui/Paper';
import {textCss} from '../src/ui/typography';

test.each(['horizontal', 'vertical'] as const)('tracking changes token advances in %s writing', writingMode => {
  const p = replaceRange(newProject(), 0, 0, 'あいう');
  p.settings.writingMode = writingMode;
  p.baseStyle.sizePt = 14.4; // 5.08 mm
  Object.assign(p.body.runs[0].style, {letterSpacingPt: 3}); // 1.058333 mm
  const tokens = tokenize(p, () => 5.08);
  expect(tokens[0].advance).toBeCloseTo(6.138333333);
  expect(tokens.map(t => t.text).join('')).toBe('あいう');
});

test('tracked runs and the default tracking survive a document round trip', () => {
  const p = replaceRange(newProject(), 0, 0, '本文');
  Object.assign(p.baseStyle, {letterSpacingPt: 1.5});
  Object.assign(p.body.runs[0].style, {letterSpacingPt: 3});
  const read = unpackProject(packProject(p));
  expect(read.baseStyle).toHaveProperty('letterSpacingPt', 1.5);
  expect(read.body.runs[0].style).toHaveProperty('letterSpacingPt', 3);
});

test.each([-1, 12.1, NaN, Infinity, '3'])('invalid tracking is rejected without changing the input: %s', value => {
  const p = newProject();
  Object.assign(p.baseStyle, {letterSpacingPt: value});
  const before = structuredClone(p);
  expect(() => validateProject(p)).toThrow();
  expect(p).toEqual(before);
});

test('body rendering and floating text use the same tracking as layout', () => {
  const p = replaceRange(newProject(), 0, 0, 'あ12');
  Object.assign(p.baseStyle, {letterSpacingPt: 3});
  p.settings.writingMode = 'vertical';
  const line = compose(p, () => 5).pages[0].lines[0];
  const html = renderToStaticMarkup(<LineContent line={line} vertical/>);
  expect(html).toContain('margin-inline-end:3pt');
  expect(textCss(p.baseStyle)).toHaveProperty('letterSpacing', '3pt');
  // Combined digits form a single vertical token, not two added gaps.
  expect(line.tokens.map(t => t.text)).toEqual(['あ', '12']);
});

test('old styles use zero tracking and partial runs still inherit their default', () => {
  const p = replaceRange(newProject(), 0, 0, 'あいう');
  delete p.baseStyle.letterSpacingPt;
  const read = unpackProject(packProject(p));
  expect(read.baseStyle.letterSpacingPt).toBe(0);
  expect(read.body.runs[0].style).not.toHaveProperty('letterSpacingPt');
  read.baseStyle.letterSpacingPt = 3;
  expect(tokenize(read, () => 5)[0].advance).toBeCloseTo(6.058333333);
});

test('mixed fonts and sizes with tracking wrap without losing text or tracking', () => {
  const p = replaceRange(newProject(), 0, 0, 'あ大いう');
  Object.assign(p.baseStyle, {sizePt:14.4, letterSpacingPt:3});
  p.pages[0].ruling.charactersPerLine = 3;
  p.body.runs = [{text:'あ',style:{}},{text:'大',style:{sizePt:30,fontFamily:'合成大書体'}},{text:'いう',style:{}}];
  const layout = compose(p, (_text, style) => style.sizePt*25.4/72);
  expect(layout.pages[0].lines.map(line=>line.tokens.map(t=>t.text).join(''))).toEqual(['あ大','いう']);
  expect(layout.pages[0].lines[0].extent).toBeCloseTo(18.415);
  expect(layout.pages[0].lines[0].spacing).toBeGreaterThanOrEqual(17);
});

test('paragraph and page separators do not acquire tracking advances', () => {
  const p = replaceRange(newProject(), 0, 0, 'あ\n\fい');
  p.baseStyle.letterSpacingPt=3;
  expect(tokenize(p, () => 5).filter(t=>/[\n\f]/.test(t.text)).map(t=>t.advance)).toEqual([0,0]);
});
