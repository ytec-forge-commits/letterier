import {expect,test} from 'vitest';
import {bodyText,newProject,styleAt,type FloatingObject} from '../src/core/model';
import {transferText} from '../src/core/text-transfer';
function fixture(){const p=newProject();p.body.runs=[{text:'AB',style:{bold:true,color:'#ff0000'}},{text:'CD',style:{fontFamily:'Klee One',sizePt:24,underline:true}},{text:'EF',style:{italic:true}}];return p;}
test.each([[6,'AEFBCD',3,6],[0,'BCDAEF',0,3]] as const)('選択範囲を %i へ動かし全書式を保持する', (target,text,start,end)=>{
 const p=fixture(),result=transferText(p,1,4,target);
 expect(bodyText(result.project)).toBe(text);expect([result.start,result.end]).toEqual([start,end]);
 expect(styleAt(result.project,start)).toEqual({bold:true,color:'#ff0000'});
 expect(styleAt(result.project,start+1)).toEqual({fontFamily:'Klee One',sizePt:24,underline:true});
 expect(bodyText(p)).toBe('ABCDEF');
});
test('コピーは元の文字と書式を残し、挿入した部分を選択する',()=>{
 const result=transferText(fixture(),1,4,5,true);
 expect(bodyText(result.project)).toBe('ABCDEBCDF');expect([result.start,result.end]).toEqual([5,8]);
 expect(styleAt(result.project,6)).toEqual({fontFamily:'Klee One',sizePt:24,underline:true});
});
test.each([1,2,4])('元の範囲内/境界への移動 %i は無変更',target=>{const p=fixture();expect(transferText(p,1,4,target).project).toBe(p);});
test('移動範囲に追従する画像は同じ文字へ追従し、ページ固定画像は動かさない',()=>{
 const p=fixture();const object:FloatingObject={id:'flow',kind:'text',text:'添え書き',anchorMode:'flow',anchorOffset:2,pageIndex:0,x:4,y:5,width:10,height:10,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:1};
 p.objects=[object,{...object,id:'fixed',anchorMode:'page'}];
 const next=transferText(p,1,4,6).project;
 expect(next.objects[0].anchorOffset).toBe(4);expect(next.objects[0].x).toBe(4);expect(next.objects[1].pageIndex).toBe(0);expect(next.objects[1].x).toBe(4);expect(p.objects[0].anchorOffset).toBe(2);
});
test('コピー時には画像を複製しない',()=>{const p=fixture();p.objects=[{id:'x',kind:'image',anchorMode:'flow',anchorOffset:2,pageIndex:0,x:0,y:0,width:10,height:10,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:1}];const next=transferText(p,1,4,6,true).project;expect(next.objects).toHaveLength(1);expect(next.objects[0].anchorOffset).toBe(2);});
test('絵文字や結合文字の途中と文書外の指定は拒否する',()=>{const p=fixture();p.body.runs=[{text:'A👩‍💻か\u3099B',style:{}}];for(const range of [[2,6,0],[0,1,3],[-1,1,0],[0,99,0]])expect(()=>transferText(p,...range as [number,number,number])).toThrow();});
test('改行と改ページを含む範囲も欠落させない',()=>{const p=fixture();p.body.runs=[{text:'前\n中\f後',style:{bold:true}}];expect(bodyText(transferText(p,1,4,5).project)).toBe('前後\n中\f');});
test('ページ固定の内部アンカーは削除の中間状態で切り詰めない',()=>{
 const p=fixture();p.objects=[{id:'fixed',kind:'image',anchorMode:'page',anchorOffset:6,pageIndex:0,x:20,y:30,width:10,height:10,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:1}];
 const next=transferText(p,1,4,6).project;
 expect(next.objects[0].anchorOffset).toBe(6);expect(next.objects[0].x).toBe(20);expect(next.objects[0].y).toBe(30);
});
