import {expect,test} from 'vitest';
import {compose} from '../src/core/compose';
import {trailingLineBreaks,trailingInsertionPrefix} from '../src/core/caret';
import {newProject,replaceRange} from '../src/core/model';

for(const writingMode of ['vertical','horizontal'] as const){
 for(const [text,line,want] of [['',4,4],['前',4,4],['前\n',4,3],['前\n\n',4,2],['前\n後',0,0]] as const){
  test(`${writingMode}: inserting at line ${line+1} after ${JSON.stringify(text)} adds ${want} breaks`,()=>{
   const project=replaceRange(newProject(),0,0,text);project.settings.writingMode=writingMode;
   const layout=compose(project,()=>5);
   expect(trailingLineBreaks(layout,writingMode==='vertical',0,line,text.length)).toBe(want);
  });
 }
 test(`${writingMode}: a manual page break already places the insertion on the next page`,()=>{
  const project=replaceRange(newProject(),0,0,'前\f');project.settings.writingMode=writingMode;
  const layout=compose(project,()=>5);
  expect(trailingLineBreaks(layout,writingMode==='vertical',1,4,2)).toBe(4);
  expect(trailingInsertionPrefix(layout,writingMode==='vertical',1,4,2)).toBe('\n\n\n\n');
  expect(trailingLineBreaks(layout,writingMode==='vertical',0,0,2)).toBe(0);
 });
 test(`${writingMode}: blank visual pages need page separators as well as empty rows`,()=>{
  const project=replaceRange(newProject(),0,0,'前');project.settings.writingMode=writingMode;
  project.pages.push(structuredClone(project.pages[0]));
  const layout=compose(project,()=>5),first=layout.pages[0];
  expect(trailingInsertionPrefix(layout,writingMode==='vertical',1,4,1)).toBe('\f\n\n\n\n');
  expect(trailingInsertionPrefix(layout,writingMode==='vertical',1,0,1)).toBe('\f');
  expect(first.lines[0].tokens[0].text).toBe('前');
 });
 for(const terminator of ['', '\n'])test(`${writingMode}: final occupied row with terminator ${JSON.stringify(terminator)} preserves the next blank page`,()=>{
  const project=newProject();project.settings.writingMode=writingMode;
  const empty=compose(project,()=>5).pages[0],rows=empty.lines.length+empty.caretLines.length;
  project.pages.push(structuredClone(project.pages[0]));
  const text='\n'.repeat(rows-1)+'前'+terminator,filled=replaceRange(project,0,0,text),layout=compose(filled,()=>5);
  expect(trailingInsertionPrefix(layout,writingMode==='vertical',1,0,text.length)).toBe(terminator?'':'\f');
  expect(trailingInsertionPrefix(layout,writingMode==='vertical',1,4,text.length)).toBe(terminator?'\n\n\n\n':'\f\n\n\n\n');
 });
}
