import { beforeEach, expect, test, vi } from 'vitest';
// React scheduling and native dialogs are external boundaries; persistence and archives run unchanged.
const h=vi.hoisted(()=>({refs:[] as {current:unknown}[],at:0,state:0,effects:[] as (()=>unknown)[],effectDeps:[] as unknown[][],updates:[] as unknown[],disk:new Uint8Array() as Uint8Array,loaded:null as any,errors:[] as string[],autosaveError:'',grants:new Map<string,Uint8Array>(),next:0,native:false,queued:false,saveCancel:false,saveError:false,busy:false,closed:0,close:null as null|((event:{preventDefault:()=>void})=>Promise<void>)}));
vi.mock('react',()=>({
 useRef:(initial:unknown)=>h.refs[h.at++]??=( {current:initial}),
 useState:(initial:unknown)=>{const index=h.state++;return [index===1?true:index===2?h.busy:index===8?h.autosaveError:initial,(value:unknown)=>{if(index===2)h.busy=Boolean(value);if(index===8)h.autosaveError=String(value);h.updates.push(value);}];},
 useEffect:(effect:()=>unknown,deps:unknown[])=>{h.effects.push(effect);h.effectDeps.push(deps);},
}));
async function readFile(){const token=String(++h.next);h.grants.set(token,h.disk.slice());return {token,name:'synthetic.binsen',bytes:Array.from(h.disk)};}
vi.mock('@tauri-apps/api/core',()=>({isTauri:()=>h.native,invoke:async(command:string)=>{if(command==='close_app'){h.closed++;return null;}if(!h.queued)return null;h.queued=false;return readFile();}}));
vi.mock('@tauri-apps/api/window',()=>({getCurrentWindow:()=>({onCloseRequested:async(listener:NonNullable<typeof h.close>)=>{await Promise.resolve();h.close=listener;return ()=>{if(h.close===listener)h.close=null;};}})}));
vi.mock('../src/persistence/platform',()=>({
 PlatformStorage:class {data=new Map<string,Uint8Array>();failKey='';failures=0;attempts=new Map<string,number>();async get(k:string){return this.data.get(k)??null;}async put(k:string,b:Uint8Array){this.attempts.set(k,(this.attempts.get(k)??0)+1);if(k===this.failKey&&this.failures-->0)throw Error('synthetic transient disk failure');this.data.set(k,b);}async remove(k:string){this.data.delete(k);}},
 pickDocument:()=>readFile(),
 saveDocument:async(bytes:Uint8Array,_title:string,token:string)=>{
  if(h.saveCancel)return null;
  if(h.saveError)throw Error('synthetic write failure');
  if(token&& !Buffer.from(h.grants.get(token)!).equals(Buffer.from(h.disk)))throw new Error('external file changed');
  h.disk=bytes.slice();h.grants.set(token,h.disk.slice());return {token,name:'synthetic.binsen'};
 },
}));
import {useDocumentFiles} from '../src/ui/useDocumentFiles';
import {newProject,replaceRange,bodyText,type Project} from '../src/core/model';
import {packProject,unpackProject} from '../src/core/archive';
let launchListener:(()=>void)|undefined;
vi.mock('@tauri-apps/api/event',()=>({listen:async(_event:string,listener:()=>void)=>{launchListener=listener;return ()=>{launchListener=undefined;};}}));
function render(p:Project,suspended=false,onLaunchRequest?:()=>void){h.at=0;h.state=0;h.effects=[];h.effectDeps=[];return useDocumentFiles(p,value=>{h.loaded=value;},error=>{if(error)h.errors.push(error);},suspended,onLaunchRequest);}
beforeEach(()=>{h.refs=[];h.at=0;h.state=0;h.effects=[];h.effectDeps=[];h.updates=[];h.errors=[];h.autosaveError='';h.grants.clear();h.next=0;h.native=false;h.queued=false;h.saveCancel=false;h.saveError=false;h.loaded=null;h.disk=new Uint8Array();h.busy=false;h.closed=0;h.close=null;});

test('回復データの保存は開いているファイルへ自動上書きしない',async()=>{
 const first=replaceRange(newProject(),0,0,'保存済み');h.disk=packProject(first);
 let files=render(first);await files.open();
 const edited=replaceRange(h.loaded,4,4,'未保存');files=render(edited);await files.flush();
 expect(bodyText(unpackProject(h.disk))).toBe('保存済み');
 expect(bodyText((await files.session.recover())!)).toBe('保存済み未保存');
});

test('名前のない手紙も保存操作ではファイルを書き出す',async()=>{
 const p=replaceRange(newProject(),0,0,'初めて保存する手紙');const files=render(p);await files.saveNow();
 expect(h.disk.length).toBeGreaterThan(0);
 expect(bodyText(unpackProject(h.disk))).toBe('初めて保存する手紙');
});

test('通常起動は回復データがあっても前回文書を自動表示しない',async()=>{
 const p=newProject(),files=render(p);await files.session.save(replaceRange(newProject(),0,0,'前回の合成文書'));
 h.effects[2]();await vi.waitFor(()=>expect(h.updates).toContain(true));
 expect(h.loaded).toBeNull();
});

test.each(['cancel','discard'] as const)('未保存の文書を開き直すとき %s を選べる',async choice=>{
 const first=replaceRange(newProject(),0,0,'保存済み');h.disk=packProject(first);
 let files=render(first);await files.open();
 const edited=replaceRange(h.loaded,4,4,'未保存');files=render(edited);
 const opening=files.open();if('answerLeave' in files)(files.answerLeave as (choice:string)=>void)(choice);await opening;
 expect(bodyText(unpackProject(h.disk))).toBe('保存済み');
 if(choice==='cancel')expect(h.next).toBe(1);
 else expect(bodyText(h.loaded)).toBe('保存済み');
});
test.each(['dialog','activation'] as const)('reopening the current file through %s preserves pending edits and subsequent saves',async path=>{
 const first=replaceRange(newProject(),0,0,'保存済み');h.disk=packProject(first);h.native=path==='activation';
 let files=render(first);await files.open();
 const edited=replaceRange(first,4,4,'直前の追記');files=render(edited);
 if(path==='dialog'){const opening=files.open();files.answerLeave('save');await opening;}
 else {h.queued=true;h.effects[1]();files.answerLeave('save');await vi.waitFor(()=>expect(bodyText(h.loaded)).toBe('保存済み直前の追記'));}
 expect(bodyText(h.loaded)).toBe('保存済み直前の追記');
 expect(bodyText(unpackProject(h.disk))).toBe('保存済み直前の追記');
 const further=replaceRange(h.loaded,9,9,'次の編集');files=render(further);await files.saveNow();
 expect(h.errors).toEqual([]);
 expect(bodyText(unpackProject(h.disk))).toBe('保存済み直前の追記次の編集');
});

test.each(['cancel','failure'] as const)('保存ダイアログの%sでは新規作成せず、未保存の本文を維持する',async mode=>{
 const first=newProject();let files=render(first);
 const edited=replaceRange(first,0,0,'保存を完了できない合成文書');files=render(edited);
 h.saveCancel=mode==='cancel';h.saveError=mode==='failure';
 const creating=files.create();files.answerLeave('save');expect(await creating).toBe(false);
 expect(h.loaded).toBeNull();expect(h.disk.length).toBe(0);
 h.saveCancel=false;h.saveError=false;
 const retry=files.create();files.answerLeave('cancel');expect(await retry).toBe(false);
});

test('外部で変更されたファイルへ保存できなくても、別名保存で復旧できる',async()=>{
 const first=newProject();h.disk=packProject(first);let files=render(first);await files.open();
 files=render(replaceRange(h.loaded,0,0,'保護する本文'));
 h.disk=packProject(replaceRange(first,0,0,'外部変更'));
 expect(await files.saveNow()).toBe(false);expect(bodyText(unpackProject(h.disk))).toBe('外部変更');
 expect(await files.saveAs()).toBe(true);expect(bodyText(unpackProject(h.disk))).toBe('保護する本文');
});

test('起動後のファイル通知を画面へ伝え、ダイアログ解除後に文書を開く',async()=>{
 h.native=true;h.disk=packProject(replaceRange(newProject(),0,0,'外部から開く合成文書'));
 const p=newProject();let notice=0;
 render(p,true,()=>{notice++;});await h.effects[0]();
 h.queued=true;launchListener!();
 expect(notice).toBe(1);expect(h.loaded).toBeNull();
 render(p,false,()=>{notice++;});h.effects[1]();
 await vi.waitFor(()=>expect(bodyText(h.loaded)).toBe('外部から開く合成文書'));
});

test('保存中の再レンダー直後も終了要求を防ぎ、終了キャンセルで未保存変更を維持する',async()=>{
 h.native=true;const first=newProject();let files=render(first);
 // Model React's dependency-based effect cleanup and asynchronous native listen boundary.
 let previous:unknown[]|undefined,cleanup:(()=>void)|undefined;
 const commitCloseEffect=()=>{const dependencies=h.effectDeps[5];if(!previous||dependencies.some((value,index)=>value!==previous![index])){cleanup?.();cleanup=h.effects[5]() as (()=>void)|undefined;previous=dependencies;}};
 commitCloseEffect();await vi.waitFor(()=>expect(h.close).not.toBeNull());
 const edited=replaceRange(first,0,0,'終了で失いたくない変更');files=render(edited);commitCloseEffect();
 let release!:()=>void;const gate=new Promise<void>(done=>{release=done;}),saving=files.run(()=>gate);
 files=render(edited);commitCloseEffect();
 const close=async()=>{let prevented=false;const listener=h.close;if(listener)await listener({preventDefault:()=>{prevented=true;}});if(!prevented)h.closed++;};
 try{await close();expect(h.closed).toBe(0);}finally{release();await saving;}
 files=render(edited);commitCloseEffect();await vi.waitFor(()=>expect(h.close).not.toBeNull());
 const leaving=close();files.answerLeave('cancel');await leaving;
 expect(h.closed).toBe(0);expect(h.loaded).toBeNull();expect(h.disk.length).toBe(0);
 cleanup?.();
});

test('自動回復は編集から1.8秒後に更新し、元ファイルを上書きしない',async()=>{
 vi.useFakeTimers();
 try{
  const first=replaceRange(newProject(),0,0,'元ファイル');h.disk=packProject(first);let files=render(first);await files.open();
  files=render(replaceRange(h.loaded,5,5,'追記'));const cleanup=h.effects[3]() as ()=>void;
  await vi.advanceTimersByTimeAsync(1799);expect(bodyText((await files.session.recover())!)).toBe('元ファイル');
  await vi.advanceTimersByTimeAsync(1);
  expect(bodyText((await files.session.recover())!)).toBe('元ファイル追記');expect(bodyText(unpackProject(h.disk))).toBe('元ファイル');cleanup();
 }finally{vi.useRealTimers();}
});

test('履歴復元後の回復本文と手動ファイル保存が一致し、復元前の変更は保護版で残る',async()=>{
 const first=replaceRange(newProject(),0,0,'以前の本文');h.disk=packProject(first);let files=render(first);await files.open();
 const history=await files.repository.history(first.id);files=render(replaceRange(h.loaded,0,5,'復元前の変更'));
 expect(await files.restore(history[0].id)).toBe(true);expect(bodyText(h.loaded)).toBe('以前の本文');expect(bodyText((await files.session.recover())!)).toBe('以前の本文');
 const before=(await files.repository.history(first.id)).find(entry=>entry.preview==='復元前の変更');expect(before?.protected).toBe(true);
 files=render(h.loaded);expect(await files.saveNow()).toBe(true);expect(bodyText(unpackProject(h.disk))).toBe('以前の本文');expect(h.errors).toEqual([]);
});

test('追記前の自動保存タイマーを取消し、手動保存後の回復本文を古い版で上書きしない',async()=>{
 vi.useFakeTimers();
 try{
  const first=newProject();let files=render(first);const previous=replaceRange(first,0,0,'先の入力');files=render(previous);
  const cleanup=h.effects[3]() as ()=>void;await vi.advanceTimersByTimeAsync(900);
  cleanup();files=render(replaceRange(previous,0,4,'最後の入力'));const finalCleanup=h.effects[3]() as ()=>void;
  await files.saveNow();await vi.advanceTimersByTimeAsync(900);
  expect(bodyText((await files.session.recover())!)).toBe('最後の入力');expect(bodyText(unpackProject(h.disk))).toBe('最後の入力');
  await vi.advanceTimersByTimeAsync(900);expect(bodyText((await files.session.recover())!)).toBe('最後の入力');finalCleanup();
 }finally{vi.useRealTimers();}
});

test('一時的な自動保存失敗後は入力を止めても再試行し、元ファイルは維持する',async()=>{
 vi.useFakeTimers();
 try{
  const first=replaceRange(newProject(),0,0,'元ファイル');h.disk=packProject(first);let files=render(first);await files.open();
  const edited=replaceRange(h.loaded,5,5,'追記');files=render(edited);const store=files.repository.store as any;store.failKey=`draft-${edited.id}`;store.failures=1;
  const cleanup=h.effects[3]() as ()=>void;await vi.advanceTimersByTimeAsync(1800);
  expect(bodyText((await files.session.recover())!)).toBe('元ファイル');expect(h.autosaveError).toBe('synthetic transient disk failure');
  await vi.advanceTimersByTimeAsync(4999);expect(bodyText((await files.session.recover())!)).toBe('元ファイル');await vi.advanceTimersByTimeAsync(1);
  expect(bodyText((await files.session.recover())!)).toBe('元ファイル追記');expect(bodyText(unpackProject(h.disk))).toBe('元ファイル');cleanup();
 }finally{vi.useRealTimers();}
});

test('保存領域が失敗し続けても自動再試行は有限で、直前の回復データを保持する',async()=>{
 vi.useFakeTimers();
 try{
  const first=replaceRange(newProject(),0,0,'残す回復本文');let files=render(first);await files.flush();
  const edited=replaceRange(first,6,6,'追記');files=render(edited);const store=files.repository.store as any,key=`draft-${edited.id}`;store.failKey=key;store.failures=100;const baseline=store.attempts.get(key);
  const cleanup=h.effects[3]() as ()=>void;await vi.advanceTimersByTimeAsync(1800+5000+15000+30000);
  expect(store.attempts.get(key)-baseline).toBe(4);expect(bodyText((await files.session.recover())!)).toBe('残す回復本文');
  await vi.advanceTimersByTimeAsync(300000);expect(store.attempts.get(key)-baseline).toBe(4);expect(h.updates).toContain('保存に失敗');cleanup();
 }finally{vi.useRealTimers();}
});

test('文書切替で古い自動再試行を取消し、新しい回復データを上書きしない',async()=>{
 vi.useFakeTimers();
 try{
  const first=newProject();let files=render(first);const edited=replaceRange(first,0,0,'切替前の本文');files=render(edited);const store=files.repository.store as any,key=`draft-${edited.id}`;store.failKey=key;store.failures=1;
  const cleanup=h.effects[3]() as ()=>void;await vi.advanceTimersByTimeAsync(1800);cleanup();
  const second=replaceRange(newProject(),0,0,'切替後の本文');files=render(second);await files.flush();await vi.advanceTimersByTimeAsync(60000);
  expect(store.attempts.get(key)).toBe(1);expect(bodyText((await files.session.recover())!)).toBe('切替後の本文');expect(await files.session.recent()).toHaveLength(1);
 }finally{vi.useRealTimers();}
});

test.each(['same-id','other-id'] as const)('実行中の古い自動保存が後から失敗しても%sの新しい画面へ失敗を表示しない',async mode=>{
 vi.useFakeTimers();
 try{
  const first=newProject(),old=replaceRange(first,0,0,'遅れる入力');let files=render(first);files=render(old);const store=files.repository.store;
  let rejectOld!:(error:Error)=>void,started=false;const blocked=new Promise<void>((_resolve,reject)=>{rejectOld=reject;}),put=store.put.bind(store);
  store.put=async(key,bytes)=>{if(key===`draft-${old.id}`&&!started){started=true;await blocked;}await put(key,bytes);};
  const cleanup=h.effects[3]() as ()=>void;await vi.advanceTimersByTimeAsync(1800);expect(started).toBe(true);cleanup();
  const next=replaceRange(mode==='same-id'?first:newProject(),0,0,'新しい画面の本文');files=render(next);const updatesAtSwitch=h.updates.length;
  rejectOld(Error('synthetic delayed failure'));await vi.advanceTimersByTimeAsync(0);
  expect(h.updates.slice(updatesAtSwitch)).not.toContain('保存に失敗');expect(h.errors).toEqual([]);
  await files.flush();expect(bodyText((await files.session.recover())!)).toBe('新しい画面の本文');
 }finally{vi.useRealTimers();}
});

test('自動再試行の成功は自動保存警告だけを解除し、別の手動操作のエラーを消さない',async()=>{
 vi.useFakeTimers();
 try{
  const first=newProject(),edited=replaceRange(first,0,0,'回復した入力');let files=render(first);files=render(edited);const store=files.repository.store as any;store.failKey=`draft-${edited.id}`;store.failures=1;
  const cleanup=h.effects[3]() as ()=>void;await vi.advanceTimersByTimeAsync(1800);files=render(edited);expect((files as any).autosaveError).toBe('synthetic transient disk failure');
  h.saveError=true;expect(await files.saveNow()).toBe(false);expect(h.errors.at(-1)).toBe('synthetic write failure');await vi.advanceTimersByTimeAsync(5000);await vi.waitFor(()=>expect(h.autosaveError).toBe(''));files=render(edited);
  expect((files as any).autosaveError).toBe('');expect(h.errors.at(-1)).toBe('synthetic write failure');expect(bodyText((await files.session.recover())!)).toBe('回復した入力');cleanup();
 }finally{vi.useRealTimers();}
});
