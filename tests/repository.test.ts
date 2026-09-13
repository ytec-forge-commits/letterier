import { expect,test } from 'vitest';
import { newProject,replaceRange,bodyText } from '../src/core/model';
import { DocumentRepository,type KeyValueStore } from '../src/persistence/repository';
import {zipSync,strToU8} from 'fflate';
class MemoryStore implements KeyValueStore {
  data=new Map<string,Uint8Array>();failKey='';
  async get(key:string){return this.data.get(key)??null;}
  async put(key:string,value:Uint8Array){if(key===this.failKey)throw new Error('disk full');this.data.set(key,value);}
  async remove(key:string){this.data.delete(key);}
}
test('旧保存形式の原本を保護履歴へ保持してから文書を移行する',async()=>{
 const store=new MemoryStore(),repo=new DocumentRepository(store),p=newProject();const bytes=zipSync({'project.json':strToU8(JSON.stringify({...p,version:1}))});
 await repo.preserveSource(bytes);const h=await repo.history(p.id);expect(h).toHaveLength(1);expect(h[0].protected).toBe(true);expect(store.data.get(`revision-${p.id}-${h[0].hash}`)).toEqual(bytes);expect((await repo.revision(p.id,h[0])).version).toBe(2);
});
test('復元前の状態を残して戻す前の文書へもう一度戻せる',async()=>{
  const repo=new DocumentRepository(new MemoryStore());const old=replaceRange(newProject(),0,0,'以前');
  const entries=await repo.snapshot(old,'完成版',1);
  expect(entries.length).toBe(1);
  const current=replaceRange(old,0,2,'現在');const restored=await repo.restore(current,entries[0].id);
  expect(bodyText(restored)).toBe('以前');
  const history=await repo.history(old.id);expect(history.length).toBe(2);
  const before=history.find(r=>r.id!==entries[0].id)!;
  expect(bodyText(await repo.restore(restored,before.id))).toBe('現在');
});
test('履歴付きバックアップを別PC相当の空ストアへ復元できる',async()=>{
  const source=new DocumentRepository(new MemoryStore()),target=new DocumentRepository(new MemoryStore());
  const old=replaceRange(newProject(),0,0,'第一稿');await source.snapshot(old,'保護版',1);
  const current=replaceRange(old,0,3,'完成した手紙');
  const backup=await source.exportBackup(current);const opened=await target.importBackup(backup);
  expect(bodyText(opened)).toBe('完成した手紙');
  const h=await target.history(opened.id);expect(h.some(r=>r.protected&&r.label==='保護版')).toBe(true);
});
test('履歴索引の保存失敗時に既存の復元可能な版を削除しない',async()=>{
  const store=new MemoryStore(),repo=new DocumentRepository(store);const p=replaceRange(newProject(),0,0,'守る本文');
  const first=await repo.snapshot(p,'',1);expect(first.length).toBe(1);
  store.failKey=`history-${p.id}`;
  await expect(repo.snapshot(replaceRange(p,0,4,'変更'),'',2)).rejects.toThrow('disk full');
  store.failKey='';expect((await repo.history(p.id))[0].id).toBe(first[0].id);
});
