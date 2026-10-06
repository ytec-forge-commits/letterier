import {expect,test} from 'vitest';
import {applyUserTemplateDesign} from '../src/core/templates';
import {newProject,replaceRange,bodyText,type Asset,type FloatingObject} from '../src/core/model';
import {packProject,unpackProject} from '../src/core/archive';
const asset=(color:string):Asset=>({id:'same-id',name:color,mime:'image/svg+xml',data:'data:image/svg+xml;base64,'+btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="${color}"/></svg>`)});
const image=(id:string):FloatingObject=>({id,kind:'image',assetId:'same-id',anchorMode:'page',anchorOffset:0,pageIndex:0,x:5,y:5,width:10,height:10,rotation:0,opacity:.3,wrap:false,paddingMm:0,hideRuling:true,z:10});
function fixture(){
 const p=replaceRange(newProject(),0,0,'元の本文\f次の本文'),t=replaceRange(newProject(),0,0,'混入しない定型文');
 p.assets={'same-id':asset('#000000')};p.objects=[image('photo')];p.baseStyle.sizePt=18;p.body.runs[0].style.bold=true;
 t.pages[0].background={...t.pages[0].background,color:'#ffeedd',assetId:'same-id'};t.pages[0].ruling.spacingMm=11;t.pages[0].ruling.autoSpacing=false;t.assets={'same-id':asset('#ff0000')};t.objects=[image('decoration')];
 return {p,t};
}
test('自作便箋の適用は本文・書式・写真を保持し、背景と飾り画像を衝突なく取り込む',()=>{
 const {p,t}=fixture(),next=applyUserTemplateDesign(p,t,()=>5);
 expect(bodyText(next)).toBe('元の本文\f次の本文');expect(next.baseStyle.sizePt).toBe(18);expect(next.body.runs[0].style.bold).toBe(true);
 expect(next.pages.map(v=>v.background.color)).toEqual(['#ffeedd','#ffeedd']);expect(next.pages[0].ruling.spacingMm).toBe(11);
 expect(next.objects.find(o=>o.id==='photo')).toEqual(p.objects[0]);
 const background=next.assets[next.pages[0].background.assetId!];expect(background.name).toBe('#ff0000');expect(next.assets['same-id'].name).toBe('#000000');
 expect(next.objects).toHaveLength(3);expect(unpackProject(packProject(next)).objects).toHaveLength(3);
 expect(p.pages[0].background.color).toBe('#fffefa');
});
test('便箋を再適用しても飾り画像は増殖せず、保存後の再適用でも写真を残す',()=>{
 const {p,t}=fixture(),once=unpackProject(packProject(applyUserTemplateDesign(p,t,()=>5))),twice=applyUserTemplateDesign(once,t,()=>5);
 expect(twice.objects).toHaveLength(3);expect(twice.objects.filter(o=>o.id==='photo')).toHaveLength(1);
});
test('指定ページだけへ自作便箋を適用し、ほかのページと続きの設定は維持する',()=>{
 const {p,t}=fixture(),next=applyUserTemplateDesign(p,t,()=>5,{start:1,end:1});
 expect(next.pages[0].background.color).toBe('#fffefa');expect(next.pages[1]?.background.color).toBe('#ffeedd');
 expect(next.continuation).toEqual(p.continuation);expect(next.objects).toHaveLength(2);expect(next.objects[1].pageIndex).toBe(1);
});
test('存在しない対象ページには適用せず元の手紙を保つ',()=>{
 const {p,t}=fixture();expect(()=>applyUserTemplateDesign(p,t,()=>5,{start:2,end:3})).toThrow();expect(p.objects).toHaveLength(1);
});
test('追従配置へ変更された飾りも実際の配置ページで置き換える',()=>{
 const {p,t}=fixture();p.objects.push({...image('flow-decoration'),stationery:true,anchorMode:'flow',anchorOffset:6,pageIndex:0,x:0,y:0});
 const next=applyUserTemplateDesign(p,t,()=>5,{start:1,end:1});
 expect(next.objects.some(o=>o.id==='flow-decoration')).toBe(false);expect(next.objects).toHaveLength(2);
});
