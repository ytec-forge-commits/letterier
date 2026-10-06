import {expect,test} from 'vitest';
import {newProject,replaceRange,formatRange} from '../src/core/model';
import {DocumentRepository,type KeyValueStore} from '../src/persistence/repository';
import {SessionPersistence} from '../src/persistence/session';
import {TemplateRepository} from '../src/persistence/templates';
class Memory implements KeyValueStore {
 values=new Map<string,Uint8Array>();fail='';
 async get(k:string){return this.values.get(k)??null;}
 async put(k:string,b:Uint8Array){if(k===this.fail)throw Error('synthetic full disk');this.values.set(k,b.slice());}
 async remove(k:string){this.values.delete(k);}
}
function fixture(){const p=replaceRange(newProject(),0,0,'あいうえ');p.baseStyle.sizePt=20;return formatRange(p,0,1,{sizePt:24,letterSpacingPt:3});}
test('recovery retains default size and mixed tracking after the repository is recreated',async()=>{
 const store=new Memory(),p=fixture();await new SessionPersistence(new DocumentRepository(store)).save(p);
 const restored=await new SessionPersistence(new DocumentRepository(store)).recover();
 expect(restored?.baseStyle.sizePt).toBe(20);expect(restored?.body.runs).toEqual([{text:'あ',style:{sizePt:24,letterSpacingPt:3}},{text:'いうえ',style:{}}]);
});
test.each(['draft','recent-documents','session-current'])('failed %s recovery write preserves the previous mixed-style letter',async(stage)=>{
 const store=new Memory(),session=new SessionPersistence(new DocumentRepository(store)),p=fixture();await session.save(p);
 const next=fixture();next.body.runs[0].style.letterSpacingPt=12;store.fail=stage==='draft'?`draft-${next.id}`:stage;
 await expect(session.save(next)).rejects.toThrow('synthetic full disk');
 expect((await new SessionPersistence(new DocumentRepository(store)).recover())?.body.runs[0].style.letterSpacingPt).toBe(3);
 store.fail='';await session.save(next);expect((await session.recover())?.body.runs[0].style.letterSpacingPt).toBe(12);
});
test('history restore and backup import retain the tracked runs and protect the newer state',async()=>{
 const store=new Memory(),repo=new DocumentRepository(store),p=fixture();const [entry]=await repo.snapshot(p,'tracking 3');
 const next=formatRange(p,0,4,{letterSpacingPt:12});const restored=await repo.restore(next,entry.id);
 expect(restored.body.runs[0].style.letterSpacingPt).toBe(3);
 const history=await repo.history(p.id);expect(history).toHaveLength(2);expect((await repo.revision(p.id,history.find(h=>h.id!==entry.id)!)).body.runs[0].style.letterSpacingPt).toBe(12);
 const importedRepo=new DocumentRepository(new Memory()),imported=await importedRepo.importBackup(await repo.exportBackup(restored));
 expect(imported.body.runs).toEqual(restored.body.runs);expect(await importedRepo.history(p.id)).toHaveLength(2);
});
test('a saved original template carries tracking without sharing mutable runs with a new letter',async()=>{
 const store=new Memory(),repo=new TemplateRepository(store),p=fixture(),entry=await repo.add('合成便箋',p,true,()=>5);
 const letter=await new TemplateRepository(store).open(entry.id);expect(letter.baseStyle.sizePt).toBe(20);expect(letter.body.runs[0].style.letterSpacingPt).toBe(3);
 letter.body.runs[0].style.letterSpacingPt=12;expect((await repo.open(entry.id)).body.runs[0].style.letterSpacingPt).toBe(3);
});
