import { bodyText, type Project } from '../core/model';
import { addRevision, type Revision } from '../core/history';
import { MAX_DOCUMENT_BYTES,packProject, safeUnzip, unpackProject } from '../core/archive';
import { strFromU8, strToU8, zipSync } from 'fflate';
export interface KeyValueStore { get(key:string):Promise<Uint8Array|null>;put(key:string,bytes:Uint8Array):Promise<void>;remove(key:string):Promise<void> }
export const encodeJson=(value:unknown)=>strToU8(JSON.stringify(value));
export const decodeJson=(bytes:Uint8Array):unknown=>JSON.parse(strFromU8(bytes));
export async function sha256(bytes:Uint8Array):Promise<string>{return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes).buffer)),b=>b.toString(16).padStart(2,'0')).join('');}
function revisions(value:unknown):Revision[]{
  if(!Array.isArray(value)||value.length>2000)throw new Error('保存履歴を読み取れません。履歴ファイルは保持しています。');
  const ids=new Set<string>(),hashes=new Set<string>();
  return value.map(v=>{
    if(!v||typeof v!=='object'||typeof v.id!=='string'||!/^[-a-zA-Z0-9]{1,100}$/.test(v.id)||typeof v.hash!=='string'||! /^[a-f0-9]{64}$/.test(v.hash)||typeof v.label!=='string'||v.label.length>100||typeof v.protected!=='boolean'||typeof v.time!=='number'||!Number.isFinite(v.time)||typeof v.preview!=='string'||v.preview.length>400)throw new Error('保存履歴の形式が正しくありません。');
    if(ids.has(v.id)||hashes.has(v.hash))throw new Error('同じ保存履歴が重複しています。元のデータは変更していません。');ids.add(v.id);hashes.add(v.hash);
    return {id:v.id,hash:v.hash,time:v.time,label:v.label,protected:v.protected,preview:v.preview};
  });
}
export class DocumentRepository {
  private pending:Promise<unknown>=Promise.resolve();
  constructor(public store:KeyValueStore){}
  private serial<T>(fn:()=>Promise<T>):Promise<T>{const next=this.pending.then(fn,fn);this.pending=next.catch(()=>{});return next;}
  snapshot(project:Project,label='',time=Date.now()):Promise<Revision[]> { return this.serial(()=>this.writeSnapshot(project,label,time)); }
  preserveSource(bytes:Uint8Array):Promise<void>{return this.serial(async()=>{
    const p=unpackProject(bytes),hash=await sha256(bytes),entries=await this.history(p.id);
    const entry:Revision={id:hash,hash,time:Date.now(),label:'旧形式からの読込前の原本',protected:true,preview:bodyText(p).slice(0,300)};
    if(!entries.some(e=>e.hash===hash))await this.store.put(`revision-${p.id}-${hash}`,bytes);
    await this.store.put(`history-${p.id}`,encodeJson(addRevision(entries,entry)));
  });}
  private async writeSnapshot(project:Project,label:string,time:number):Promise<Revision[]> {
    if(label.length>100)throw new Error('保護版の名前は100文字までです。');
    const bytes=packProject(project),hash=await sha256(bytes),entries=await this.history(project.id);
    const next:Revision={id:hash,hash,time,label,protected:!!label,preview:bodyText(project).slice(0,300)};
    const updated=addRevision(entries,next);
    if(!entries.some(e=>e.hash===hash))await this.store.put(`revision-${project.id}-${hash}`,bytes);
    await this.store.put(`history-${project.id}`,encodeJson(updated));
    for(const removed of entries.filter(e=>!updated.some(n=>n.hash===e.hash)))await this.store.remove(`revision-${project.id}-${removed.hash}`).catch(()=>{});
    return updated;
  }
  async history(id:string):Promise<Revision[]>{const bytes=await this.store.get(`history-${id}`);return bytes?revisions(decodeJson(bytes)):[];}
  async revision(projectId:string,entry:Revision):Promise<Project>{
    const bytes=await this.store.get(`revision-${projectId}-${entry.hash}`);
    if(!bytes||await sha256(bytes)!==entry.hash)throw new Error('この保存履歴を読み取れません。現在の文書は変更していません。');
    const project=unpackProject(bytes);if(project.id!==projectId)throw new Error('保存履歴の文書が一致しません。');return project;
  }
  restore(project:Project,revision:string):Promise<Project>{return this.serial(async()=>{
    const entry=(await this.history(project.id)).find(e=>e.id===revision);if(!entry)throw new Error('選択した保存履歴が見つかりません。');
    const restored=await this.revision(project.id,entry);
    await this.writeSnapshot(project,'',Date.now());
    return restored;
  });}
  exportBackup(project:Project):Promise<Uint8Array>{return this.serial(async()=>{
    const history=await this.history(project.id);
    const files:Record<string,Uint8Array>={'current.binsen':packProject(project),'history.json':encodeJson({format:'binsenbak',version:1,history})};
    let size=files['current.binsen'].length;
    const budget={remaining:512*1024*1024-size-files['history.json'].length};safeUnzip(files['current.binsen'],MAX_DOCUMENT_BYTES,budget);
    for(const entry of history){const bytes=await this.store.get(`revision-${project.id}-${entry.hash}`);if(!bytes||await sha256(bytes)!==entry.hash)throw new Error('読み取れない履歴があるため、バックアップを中止しました。');size+=bytes.length;if(size>256*1024*1024)throw new Error('履歴付きバックアップが256MBを超えています。現在の文書を別に保存してください。');budget.remaining-=bytes.length;safeUnzip(bytes,MAX_DOCUMENT_BYTES,budget);files[`revisions/${entry.hash}.binsen`]=bytes;}
    return zipSync(files,{level:0,mtime:new Date('2020-01-01T00:00:00Z')});
  });}
  importBackup(bytes:Uint8Array):Promise<Project>{return this.serial(async()=>{
    const budget={remaining:512*1024*1024},files=safeUnzip(bytes,256*1024*1024,budget);
    if(!files['current.binsen']||!files['history.json'])throw new Error('履歴付きバックアップの形式ではありません。');
    const current=unpackProject(files['current.binsen'],budget);
    const meta=decodeJson(files['history.json']) as {format?:string;version?:number;history?:unknown};
    if(meta?.format!=='binsenbak'||meta.version!==1)throw new Error('このバックアップ形式は読み込めません。');
    const incoming=revisions(meta.history);
    for(const entry of incoming){const value=files[`revisions/${entry.hash}.binsen`];if(!value||await sha256(value)!==entry.hash||unpackProject(value,budget).id!==current.id)throw new Error('バックアップの履歴が破損しています。');}
    let merged=await this.history(current.id);
    for(const entry of incoming){await this.store.put(`revision-${current.id}-${entry.hash}`,files[`revisions/${entry.hash}.binsen`]);merged=addRevision(merged,entry);}
    await this.store.put(`history-${current.id}`,encodeJson(merged));
    return current;
  });}
}
