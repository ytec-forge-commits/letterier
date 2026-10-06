import {expect,test} from 'vitest';
import {bodyText,replaceRange,pageVisual,newProject} from '../src/core/model';
import {applyBuiltinTemplateDesign} from '../src/core/templates';

test('指定範囲の開始図案から巡回し、範囲外と本文書式を保持する',()=>{
 const p=replaceRange(newProject(),0,0,'一枚目\f二枚目\f三枚目\f四枚目');p.body.runs[0].style={bold:true};
 const next=applyBuiltinTemplateDesign(p,'sakura',()=>5,{start:1,end:2},{design:5,cycle:true});
 expect(pageVisual(next,0).design).toBe('washi');expect(pageVisual(next,1).design).toBe('sakura-v5');expect(pageVisual(next,2).design).toBe('sakura-v1');expect(pageVisual(next,3).design).toBe('washi');
 expect(next.continuation).toEqual(p.continuation);expect(bodyText(next)).toBe(bodyText(p));expect(next.body.runs[0].style.bold).toBe(true);expect(p.pages.length).toBe(1);
});
test('単一ページへ図案を指定し、続きを変更しない',()=>{
 const p=replaceRange(newProject(),0,0,'一\f二');const next=applyBuiltinTemplateDesign(p,'sakura',()=>5,{start:1,end:1},{design:3,cycle:false});
 expect(pageVisual(next,0).design).toBe('washi');expect(pageVisual(next,1).design).toBe('sakura-v3');expect(pageVisual(next,2).design).toBe('washi');
});
test('存在しないページ範囲は元文書を変更せず拒否する',()=>{
 const p=newProject();expect(()=>applyBuiltinTemplateDesign(p,'sakura',()=>5,{start:0,end:1},{design:2,cycle:false})).toThrow();expect(p.pages[0].design).toBe('washi');
});
