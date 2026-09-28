import { describe, expect, it } from 'vitest';
import { bodyText, newProject, replaceRange } from '../src/core/model';
import { DocumentRepository, type KeyValueStore } from '../src/persistence/repository';
import { SessionPersistence } from '../src/persistence/session';
class Memory implements KeyValueStore {
  values=new Map<string,Uint8Array>(); fail='';
  async get(key:string){return this.values.get(key)??null;}
  async put(key:string,bytes:Uint8Array){if(key===this.fail)throw new Error('容量不足');this.values.set(key,bytes);}
  async remove(key:string){this.values.delete(key);}
}
describe('回復用保存と文書の切り替え',()=>{
  it('名前未確定の手紙も次回起動で本文と書式を回復できる',async()=>{
    const store=new Memory(),session=new SessionPersistence(new DocumentRepository(store));
    const p=replaceRange(newProject(),0,0,'拝啓\n合成データ');p.body.runs[0].style.bold=true;
    await session.save(p);
    expect(await new SessionPersistence(new DocumentRepository(store)).recover()).toEqual(p);
    expect((await session.recent())[0].title).toBe(p.title);
  });
  it('本文の書き込み失敗では起動時の参照先を切り替えない',async()=>{
    const store=new Memory(),session=new SessionPersistence(new DocumentRepository(store));
    const a=replaceRange(newProject(),0,0,'保持する本文');await session.save(a);
    const b=newProject();store.fail=`draft-${b.id}`;
    await expect(session.save(b)).rejects.toThrow('容量不足');
    expect(bodyText((await session.recover())!)).toBe('保持する本文');
  });
  it('保存の競合では後の変更が最後に残る',async()=>{
    const store=new Memory(),session=new SessionPersistence(new DocumentRepository(store));
    const a=replaceRange(newProject(),0,0,'前'),b=replaceRange(a,1,1,'後');
    await Promise.all([session.save(a),session.save(b)]);
    expect(bodyText((await session.recover())!)).toBe('前後');
  });
  it('破損した回復データを空の手紙で黙って置換しない',async()=>{
    const store=new Memory(),session=new SessionPersistence(new DocumentRepository(store));
    const p=newProject();await session.save(p);store.values.set(`draft-${p.id}`,new Uint8Array([1,2,3]));
    await expect(session.recover()).rejects.toThrow();
    expect(Array.from(store.values.get(`draft-${p.id}`)!)).toEqual([1,2,3]);
  });
});
