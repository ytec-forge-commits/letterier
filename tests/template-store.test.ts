import {expect,test} from 'vitest';
import {TemplateRepository} from '../src/persistence/templates';
import {newProject,bodyText,replaceRange} from '../src/core/model';
import {applyTemplateDesign} from '../src/core/templates';
import type {KeyValueStore} from '../src/persistence/repository';
class Memory implements KeyValueStore {data=new Map<string,Uint8Array>();async get(k:string){return this.data.get(k)??null;}async put(k:string,b:Uint8Array){this.data.set(k,b);}async remove(k:string){this.data.delete(k);}}
test('利用者テンプレートを再起動後も開けて、元の文書とは別IDになる',async()=>{
 const store=new Memory(),repo=new TemplateRepository(store),p=replaceRange(newProject(),0,0,'季節の挨拶');
 await repo.add('定型の手紙',p,true,()=>5);
 const fresh=new TemplateRepository(store),list=await fresh.list();expect(list).toHaveLength(1);expect(list[0].withText).toBe(true);
 const a=await fresh.open(list[0].id),b=await fresh.open(list[0].id);expect(bodyText(a)).toBe('季節の挨拶');expect(a.id).not.toBe(p.id);expect(b.id).not.toBe(a.id);
 await fresh.remove(list[0].id);expect(await fresh.list()).toEqual([]);expect(store.data.size).toBe(1);
});
test('テンプレート一覧の保存が失敗した場合、登録完了とせず既存一覧を保つ',async()=>{
 const store=new Memory(),repo=new TemplateRepository(store);await repo.add('元の便箋',newProject(),false,()=>5);
 const put=store.put.bind(store);store.put=async(k,b)=>{if(k==='user-templates-index')throw Error('disk full');await put(k,b);};
 await expect(repo.add('失敗する便箋',newProject(),false,()=>5)).rejects.toThrow('disk full');expect(await repo.list()).toHaveLength(1);
});

test('同じ登録を再編集して保存しても、作成済みの手紙には変更を反映しない',async()=>{
 const store=new Memory(),repo=new TemplateRepository(store),p=newProject();
 const entry=await repo.add('元の便箋',p,false,()=>5),letter=await repo.open(entry.id);
 const edited=structuredClone(letter);edited.pages[0].background.color='#ffeedd';
 await repo.update(entry.id,'編集後の便箋',edited,false,()=>5);
 const restarted=new TemplateRepository(store),list=await restarted.list();
 expect(list).toHaveLength(1);expect(list[0].id).toBe(entry.id);expect(list[0].name).toBe('編集後の便箋');
 expect((await restarted.open(entry.id)).pages[0].background.color).toBe('#ffeedd');
 expect(letter.pages[0].background.color).toBe('#fffefa');
});

test('テンプレートの更新中に一覧の保存が失敗しても旧登録を開ける',async()=>{
 const store=new Memory(),repo=new TemplateRepository(store),entry=await repo.add('原本',newProject(),false,()=>5);
 const edited=newProject();edited.pages[0].background.color='#ffeedd';
 const put=store.put.bind(store);store.put=async(k,b)=>{if(k==='user-templates-index')throw Error('disk full');await put(k,b);};
 await expect(repo.update(entry.id,'失敗した更新',edited,false,()=>5)).rejects.toThrow('disk full');
 expect((await repo.list())[0].name).toBe('原本');expect((await repo.open(entry.id)).pages[0].background.color).toBe('#fffefa');
});
test('自作便箋から作った手紙の飾りは、別の便箋へ変更すると置換される',async()=>{
 const repo=new TemplateRepository(new Memory()),p=newProject();
 p.assets={art:{id:'art',name:'synthetic.svg',mime:'image/svg+xml',data:'data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>')}};
 p.objects=[{id:'decoration',kind:'image',assetId:'art',anchorMode:'page',anchorOffset:0,pageIndex:0,x:0,y:0,width:10,height:10,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:10}];
 const entry=await repo.add('飾り付き',p,false,()=>5),letter=await repo.open(entry.id);
 expect(letter.objects).toHaveLength(1);expect(applyTemplateDesign(letter,'washi').objects).toHaveLength(0);
});
test('更新成功後は旧payloadを回収し、登録削除後に不要な素材を残さない',async()=>{
 const store=new Memory(),repo=new TemplateRepository(store),entry=await repo.add('便箋',newProject(),false,()=>5);
 await repo.update(entry.id,'便箋2',newProject(),false,()=>5);await repo.update(entry.id,'便箋3',newProject(),false,()=>5);
 expect(store.data.size).toBe(2);await repo.remove(entry.id);expect(store.data.size).toBe(1);
});
