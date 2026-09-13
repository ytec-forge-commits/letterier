import {expect,test} from 'vitest';
import {TemplateRepository} from '../src/persistence/templates';
import {newProject,bodyText,replaceRange} from '../src/core/model';
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
