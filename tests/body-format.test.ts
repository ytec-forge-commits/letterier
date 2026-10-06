import {expect,test} from 'vitest';
import {newProject,replaceRange} from '../src/core/model';
import {compose} from '../src/core/compose';
import {applyBodyFormat} from '../src/core/text-format';
function fixture(){const p=replaceRange(newProject(),0,0,'前半\f後半');p.body.runs[0].style={bold:true,color:'#ff0000'};p.objects=[0,1].map(pageIndex=>({id:'box-'+pageIndex,kind:'text' as const,text:'文字箱',style:{...p.baseStyle},anchorMode:'page' as const,anchorOffset:0,pageIndex,x:30,y:30,width:40,height:20,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:30}));return p;}
test('本文全体のサイズを揃えても色と太字を維持し、文字箱は既定で変更しない',()=>{
 const p=fixture(),next=applyBodyFormat(p,{sizePt:22},{scope:'all'});
 expect(next.baseStyle.sizePt).toBe(22);expect(next.body.runs[0].style).toEqual({bold:true,color:'#ff0000',sizePt:22});expect(next.objects[0].style?.sizePt).toBe(14);expect(p.baseStyle.sizePt).toBe(14);
});
test('ページ単位でフォントとサイズを揃え、指定時だけ同じページの文字箱も変更する',()=>{
 const p=fixture(),layout=compose(p,()=>5),next=applyBodyFormat(p,{fontFamily:'Klee One',sizePt:24},{scope:'page',pageIndex:1,layout,includeTextBoxes:true});
 expect(next.body.runs[0].style.sizePt).toBeUndefined();expect(next.body.runs.at(-1)?.style.sizePt).toBe(24);expect(next.objects[0].style?.sizePt).toBe(14);expect(next.objects[1].style?.fontFamily).toBe('Klee One');expect(next.objects[1].style?.sizePt).toBe(24);
});
test('無効なサイズと存在しないページの一括変更は拒否する',()=>{
 const p=fixture();expect(()=>applyBodyFormat(p,{sizePt:0},{scope:'all'})).toThrow();expect(()=>applyBodyFormat(p,{sizePt:18},{scope:'page',pageIndex:20,layout:compose(p,()=>5)})).toThrow();
});
