import {expect,test} from 'vitest';
import {bodyText,newProject,replaceRange,type Project} from '../src/core/model';
import {DocumentRepository,encodeJson,type KeyValueStore} from '../src/persistence/repository';
import {SessionPersistence} from '../src/persistence/session';
import {unpackProject,packProject} from '../src/core/archive';

// Atomic storage boundary fault injection only. Session/archive/history logic is real.
class FaultStore implements KeyValueStore {
 data=new Map<string,Uint8Array>();fail='';
 async get(key:string){return this.data.get(key)?.slice()??null;}
 async put(key:string,bytes:Uint8Array){if(key===this.fail)throw Error('synthetic disk full');this.data.set(key,bytes.slice());}
 async remove(key:string){this.data.delete(key);}
}
const reload=(store:FaultStore)=>new SessionPersistence(new DocumentRepository(store));
const text=(value:string,p=newProject())=>replaceRange(p,0,bodyText(p).length,value);

test.each(['draft','recent','pointer'] as const)('回復保存の%s書込失敗でも以前の文書を回復でき、失敗後の再保存もできる',async stage=>{
 const store=new FaultStore(),session=reload(store),old=text('前の文書');await session.save(old);
 const next=text('別の新しい文書');store.fail=stage==='draft'?`draft-${next.id}`:stage==='recent'?'recent-documents':'session-current';
 await expect(session.save(next)).rejects.toThrow('synthetic disk full');
 expect(bodyText((await reload(store).recover())!)).toBe('前の文書');
 expect(bodyText(await reload(store).load(old.id))).toBe('前の文書');
 if(stage!=='draft')expect(bodyText(unpackProject(store.data.get(`draft-${next.id}`)!))).toBe('別の新しい文書');
 store.fail='';await session.save(next);
 expect(bodyText((await reload(store).recover())!)).toBe('別の新しい文書');
 expect((await reload(store).recent()).map(entry=>entry.id)).toEqual([next.id,old.id]);
});

test.each(['draft','recent','pointer'] as const)('同じ文書の%s書込失敗時は最後に成功した本文を保持する',async stage=>{
 const store=new FaultStore(),session=reload(store),old=text('第一稿');await session.save(old);const next=text('第二稿',old);
 store.fail=stage==='draft'?`draft-${old.id}`:stage==='recent'?'recent-documents':'session-current';
 await expect(session.save(next)).rejects.toThrow();
 expect(bodyText((await reload(store).recover())!)).toBe(stage==='draft'?'第一稿':'第二稿');
 store.fail='';await session.save(text('第三稿',old));expect(bodyText((await reload(store).recover())!)).toBe('第三稿');
 expect(await reload(store).recent()).toHaveLength(1);
});

test.each(['pointer','draft','mismatch','recent'] as const)('破損した%sを起動時の読込だけで書換えたり削除したりしない',async kind=>{
 const store=new FaultStore(),session=reload(store),p=text('合成の保護対象');await session.save(p);
 if(kind==='pointer')store.data.set('session-current',encodeJson({id:'../invalid'}));
 if(kind==='draft')store.data.set(`draft-${p.id}`,new Uint8Array([1,2,3]));
 if(kind==='mismatch')store.data.set(`draft-${p.id}`,packProject(text('別IDの文書')));
 if(kind==='recent')store.data.set('recent-documents',encodeJson([{id:p.id,title:null,time:0}]));
 const before=[...store.data].map(([key,bytes])=>[key,Array.from(bytes)]);
 await expect(kind==='recent'?reload(store).recent():reload(store).recover()).rejects.toThrow();
 expect([...store.data].map(([key,bytes])=>[key,Array.from(bytes)])).toEqual(before);
});

test('遅い旧本文の保存中に追記が来ても、再起動後には追記した版が残る',async()=>{
 const store=new FaultStore(),session=reload(store),first=text('先'),second=text('先後',first);
 let release!:()=>void,started!:()=>void;const gate=new Promise<void>(done=>{release=done;}),began=new Promise<void>(done=>{started=done;});
 const put=store.put.bind(store);let blocked=true;
 store.put=async(key,bytes)=>{if(blocked&&key===`draft-${first.id}`){blocked=false;started();await gate;}await put(key,bytes);};
 const initial=session.save(first);await began;const following=session.save(second);release();await Promise.all([initial,following]);
 expect(bodyText((await reload(store).recover())!)).toBe('先後');
});

test.each(['bytes','index'] as const)('履歴復元前の%s保存が失敗すると、復元を成功扱いせず現在の回復本文を維持する',async stage=>{
 const store=new FaultStore(),repo=new DocumentRepository(store),session=new SessionPersistence(repo),old=text('旧版'),current=text('現在の変更',old);
 const history=await repo.snapshot(old,'保護した旧版');await session.save(current);const currentBytes=packProject(current);
 const currentHash=await crypto.subtle.digest('SHA-256',new Uint8Array(currentBytes).buffer);const hash=Array.from(new Uint8Array(currentHash),value=>value.toString(16).padStart(2,'0')).join('');
 store.fail=stage==='bytes'?`revision-${old.id}-${hash}`:`history-${old.id}`;
 await expect(repo.restore(current,history[0].id)).rejects.toThrow('synthetic disk full');
 expect(bodyText((await reload(store).recover())!)).toBe('現在の変更');
 expect(bodyText(await repo.revision(old.id,(await repo.history(old.id))[0]))).toBe('旧版');
 store.fail='';expect(bodyText(await repo.restore(current,history[0].id))).toBe('旧版');
});

test('履歴から復元した後に通常履歴が50世代を超えても復元前の変更を取り戻せる',async()=>{
 const store=new FaultStore(),repo=new DocumentRepository(store),old=text('戻り先の旧版'),current=text('復元する直前の大切な変更',old);
 const history=await repo.snapshot(old,'戻り先');const restored=await repo.restore(current,history[0].id);
 for(let i=0;i<55;i++)await repo.snapshot(text(`復元後の編集${i}`,restored),'',i+1);
 const reopened=new DocumentRepository(store),entries=await reopened.history(old.id);
 const before=entries.find(entry=>entry.preview==='復元する直前の大切な変更');
 expect(before?.protected).toBe(true);
 expect(bodyText(await reopened.revision(old.id,before!))).toBe('復元する直前の大切な変更');
 const backup=await reopened.exportBackup(restored),other=new DocumentRepository(new FaultStore());const imported:Project=await other.importBackup(backup);
 const transported=(await other.history(imported.id)).find(entry=>entry.preview==='復元する直前の大切な変更');
 expect(transported?.protected).toBe(true);expect(bodyText(await other.revision(imported.id,transported!))).toBe('復元する直前の大切な変更');
});

test('復元前の状態が既存の保護版なら利用者が付けた名前を保持する',async()=>{
 const repo=new DocumentRepository(new FaultStore()),old=text('戻り先'),current=text('名前付きの完成版',old);
 const history=await repo.snapshot(old,'古い版');await repo.snapshot(current,'利用者の完成版');
 await repo.restore(current,history[0].id);
 const before=(await repo.history(old.id)).find(entry=>entry.preview==='名前付きの完成版');
 expect(before?.label).toBe('利用者の完成版');expect(before?.protected).toBe(true);
});

test.each(['first','middle','last','index'] as const)('バックアップ読込の%s書込が失敗しても既存履歴を保ち、再実行できる',async stage=>{
 const source=new DocumentRepository(new FaultStore()),old=text('最初の保護版');
 await source.snapshot(old,'一');await source.snapshot(text('途中の保護版',old),'二');await source.snapshot(text('最後の保護版',old),'三');
 const incoming=await source.history(old.id),backup=await source.exportBackup(text('バックアップ現在本文',old));
 const store=new FaultStore(),target=new DocumentRepository(store),existing=text('読込前からある保護版',old);await target.snapshot(existing,'残す');
 const before=await target.history(old.id);store.fail=stage==='index'?`history-${old.id}`:`revision-${old.id}-${incoming[stage==='first'?0:stage==='middle'?1:2].hash}`;
 await expect(target.importBackup(backup)).rejects.toThrow('synthetic disk full');
 expect(await target.history(old.id)).toEqual(before);expect(bodyText(await target.revision(old.id,before[0]))).toBe('読込前からある保護版');
 store.fail='';const opened=await target.importBackup(backup);expect(bodyText(opened)).toBe('バックアップ現在本文');
 const history=await target.history(old.id);expect(history).toHaveLength(4);
 expect(await Promise.all(history.map(async entry=>bodyText(await target.revision(old.id,entry))))).toEqual(['読込前からある保護版','最初の保護版','途中の保護版','最後の保護版']);
});
