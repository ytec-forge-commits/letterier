import {expect,test} from 'vitest';
import {newProject,pageVisual,replaceRange,bodyText} from '../src/core/model';
import {createFromTemplate,applyTemplateDesign} from '../src/core/templates';
import {packProject,unpackProject} from '../src/core/archive';
import {compose} from '../src/core/compose';
import {applyPageOperation,applyPageVisual} from '../src/core/pages';

test('末尾に追加した保存済みページも巡回指定を実際の図案へ解決する',()=>{
 const p=createFromTemplate('sakura','horizontal',{design:3,cycle:true});
 const next=applyPageOperation(p,compose(p,()=>5),{type:'add',index:0},()=>5);
 expect(pageVisual(next,0).design).toBe('sakura-v3');expect(pageVisual(next,1).design).toBe('sakura-v4');
 expect(pageVisual(unpackProject(packProject(next)),1).design).toBe('sakura-v4');
});

test('後方のページだけ背景を変更しても、その間の巡回図案を失わない',()=>{
 const p=createFromTemplate('sakura','horizontal',{design:3,cycle:true});
 const visual=structuredClone(pageVisual(p,3));visual.background.color='#fff000';
 const next=applyPageVisual(p,3,visual,'page');
 expect([0,1,2,3].map(index=>pageVisual(next,index).design)).toEqual(['sakura-v3','sakura-v4','sakura-v5','sakura-v1']);
 expect(pageVisual(next,3).background.color).toBe('#fff000');
});
test('選んだ図案から5種類を巡回し、保存後も同じ順序で続く',()=>{
 const p=createFromTemplate('sakura','horizontal',{design:3,cycle:true}),reopened=unpackProject(packProject(p));
 expect(Array.from({length:7},(_,i)=>pageVisual(reopened,i).design)).toEqual(['sakura-v3','sakura-v4','sakura-v5','sakura-v1','sakura-v2','sakura-v3','sakura-v4']);
});
test('循環しない場合は選択した図案を続きページにも使う',()=>{const p=createFromTemplate('sakura','vertical',{design:5,cycle:false});expect(pageVisual(p,0).design).toBe('sakura-v5');expect(pageVisual(p,9).design).toBe('sakura-v5');});

test('パステルドットの制作済み図案5を新規作成に使える',()=>{expect(pageVisual(createFromTemplate('dots','horizontal',{design:5,cycle:false}),0).design).toBe('dots-v5');});
test('クラシックの5図案を順番に新規作成に使える',()=>{const p=createFromTemplate('classic','horizontal',{design:1,cycle:true});expect([0,1,2,3,4,5].map(i=>pageVisual(p,i).design)).toEqual(['classic-v1','classic-v2','classic-v3','classic-v4','classic-v5','classic-v1']);});
test('未知のシリーズは生成も適用も拒否し、既存本文を変更しない',()=>{const p=replaceRange(newProject(),0,0,'保存前の合成本文');expect(()=>createFromTemplate('unknown','horizontal',{design:1,cycle:true})).toThrow();expect(()=>applyTemplateDesign(p,'unknown',{design:1,cycle:true})).toThrow();expect(bodyText(p)).toBe('保存前の合成本文');});
test('ページ固有の指定を循環で上書きせず、他のページだけ順番を計算する',()=>{
 const p=createFromTemplate('sakura','horizontal',{design:1,cycle:true});p.pages.push({...structuredClone(p.continuation),id:'override',design:'moon-v2'});
 expect(pageVisual(p,1).design).toBe('moon-v2');expect(pageVisual(p,2).design).toBe('sakura-v3');
});
test('全ページへの図案適用は本文・書式を保持し、ページ数に合わせた図案を設定する',()=>{
 const p=replaceRange(newProject(),0,0,'本文を保持');p.pages.push({...structuredClone(p.pages[0]),id:'page-two'});p.body.runs[0].style={bold:true};
 const next=applyTemplateDesign(p,'sakura',{design:5,cycle:true});
 expect(bodyText(next)).toBe('本文を保持');expect(next.body.runs[0].style.bold).toBe(true);expect(next.pages.map(v=>v.design)).toEqual(['sakura-v5','sakura-v1']);expect(pageVisual(next,2).design).toBe('sakura-v2');expect(p.pages[0].design).toBe('washi');
});
test.each([0,6,1.5,NaN])('不正な図案番号 %s は拒否する',design=>{expect(()=>createFromTemplate('sakura','horizontal',{design,cycle:true})).toThrow();});
test('従来の便箋は従来の最初/続きページを維持する',()=>{const p=createFromTemplate('sakura');expect(pageVisual(p,0).design).toBe('sakura-first');expect(pageVisual(p,2).design).toBe('sakura-continuation');});
