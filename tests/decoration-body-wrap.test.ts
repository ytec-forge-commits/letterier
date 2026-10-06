import {expect,test} from 'vitest';
import {compose,emMm,type Measure} from '../src/core/compose';
import {createFromTemplate} from '../src/core/templates';
import {bodyText,replaceRange,type Project} from '../src/core/model';

// Catch the real regression: ruling avoids corner illustrations but body text
// still spans those same rectangles. Literal 46mm corner fixtures are derived
// independently of the compositor and motif layout helper.
const measure:Measure=(_text,style)=>emMm(style);
const cases=([['A4',210,297],['B5',182,257],['POSTCARD',100,148]] as const)
 .flatMap(([paper,w,h])=>['portrait','landscape'].flatMap(orientation=>
  ['horizontal','vertical'].map(mode=>({paper,orientation,mode,w:orientation==='portrait'?w:h,h:orientation==='portrait'?h:w}))));

test.each((['washi','classic','dots'] as const).flatMap(series=>(['horizontal','vertical'] as const).map(mode=>({series,mode}))))('$series : 追加図案では本文を絵の矩形から避け、図案1の本文領域は保持する: $mode',({series,mode})=>{
 const blank=createFromTemplate(series,mode),project=replaceRange(blank,0,0,'あいうえお'.repeat(50));project.pages[0].design=`${series}-v2`;project.continuation=structuredClone(project.pages[0]);
 const layout=compose(project,measure),vertical=mode==='vertical';
 const boxes=vertical?[{left:0,top:0,right:46,bottom:46},{left:164,top:251,right:210,bottom:297}]:[{left:164,top:0,right:210,bottom:46},{left:0,top:251,right:46,bottom:297}];
 for(const page of layout.pages)for(const line of page.lines){
  const advance=line.tokens.reduce((sum,t)=>sum+t.advance,0);if(!advance)continue;
  const b={left:line.x,top:line.y,right:line.x+(vertical?line.spacing:advance),bottom:line.y+(vertical?advance:line.spacing)};
  for(const box of boxes)expect(b.left<box.right&&b.right>box.left&&b.top<box.bottom&&b.bottom>box.top).toBe(false);
 }
 expect(layout.pages.flatMap(p=>p.lines.flatMap(l=>l.tokens)).map(t=>t.text).join('')).toBe(bodyText(project));
 expect(compose(blank,measure).pages[0].caretLines[0].extent).toBe(vertical?257:170);
});

test.each(cases)('$paper $orientation $mode: 本文と大小混在の文字を飾りに重ねず全て保持する',({paper,orientation,mode,w,h})=>{
 let project=createFromTemplate('momiji',mode as Project['settings']['writingMode']);
 Object.assign(project.settings,{paper,orientation,orphanControl:false});
 project.pages[0].design='momiji-v5';project.continuation=structuredClone(project.pages[0]);
 project=replaceRange(project,0,0,'あいうえお'.repeat(40));
 project.body.runs=[{text:'あいうえお'.repeat(10),style:{}},{text:'大きい文字',style:{sizePt:24}},{text:'別書体'.repeat(10),style:{fontFamily:'合成書体'}},{text:'あいうえお'.repeat(25),style:{}}];
 const expected=bodyText(project),layout=compose(project,measure);
 const vertical=mode==='vertical';
 const boxes=vertical?[{left:0,top:0,right:46,bottom:46},{left:w-46,top:h-46,right:w,bottom:h}]:[{left:w-46,top:0,right:w,bottom:46},{left:0,top:h-46,right:46,bottom:h}];
 for(const page of layout.pages)for(const line of page.lines){
  const advance=line.tokens.reduce((sum,t)=>sum+t.advance,0);
  if(!advance)continue;
  const textBox={left:line.x,top:line.y,right:line.x+(vertical?line.spacing:advance),bottom:line.y+(vertical?advance:line.spacing)};
  for(const box of boxes)expect(textBox.left<box.right&&textBox.right>box.left&&textBox.top<box.bottom&&textBox.bottom>box.top).toBe(false);
 }
 expect(layout.pages.flatMap(page=>page.lines.flatMap(line=>line.tokens)).map(t=>t.text).join('')).toBe(expected);
 expect(project.pages[0].ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
});
