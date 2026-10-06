import {describe,it,expect} from 'vitest';
import {newProject} from '../src/core/model';
import {hasMixedFontSize} from '../src/core/text-format';

describe('font-size display for selected body text',()=>{
 const fixture=()=>{const p=newProject();p.body.runs=[{text:'AB',style:{}},{text:'CD',style:{sizePt:24,fontFamily:'Yomogi',bold:true}},{text:'EF',style:{sizePt:14}}];return p;};
 it('reports inherited 14pt and explicit 24pt as mixed across the selection',()=>{
  expect(hasMixedFontSize(fixture(),0,6)).toBe(true);
 });
 it('ignores sizes outside the selected half-open range',()=>{
  const p=fixture();expect(hasMixedFontSize(p,0,2)).toBe(false);expect(hasMixedFontSize(p,2,4)).toBe(false);expect(hasMixedFontSize(p,4,6)).toBe(false);
 });
 it('treats inherited and explicit equal sizes as uniform despite other styles',()=>{
  const p=fixture();p.body.runs[1].style.sizePt=14;expect(hasMixedFontSize(p,0,6)).toBe(false);
 });
 it('does not clear the size display for a caret or an empty body',()=>{
  expect(hasMixedFontSize(fixture(),2,2)).toBe(false);expect(hasMixedFontSize(newProject(),0,0)).toBe(false);
 });
 it('detects mixed sizes when both endpoints lie inside runs',()=>{
  const p=fixture();expect(hasMixedFontSize(p,1,3)).toBe(true);expect(hasMixedFontSize(p,3,5)).toBe(true);expect(hasMixedFontSize(p,2,3)).toBe(false);
 });
});
