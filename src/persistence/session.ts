import type { Project } from '../core/model';
import { packProject, unpackProjectInfo } from '../core/archive';
import { DocumentRepository, decodeJson, encodeJson } from './repository';
export interface RecentDocument {id:string;title:string;time:number}
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
export class SessionPersistence {
  private pending:Promise<unknown>=Promise.resolve();
  constructor(public repository:DocumentRepository){}
  save(project:Project):Promise<void>{
    const bytes=packProject(project);
    const next=this.pending.then(async()=>{
      await this.repository.store.put(`draft-${project.id}`,bytes);
      const recent=await this.recent();
      await this.repository.store.put('recent-documents',encodeJson([{id:project.id,title:project.title,time:Date.now()},...recent.filter(d=>d.id!==project.id)].slice(0,30)));
      await this.repository.store.put('session-current',encodeJson({id:project.id}));
    });
    this.pending=next.catch(()=>{});return next;
  }
  async recover():Promise<Project|null>{
    const bytes=await this.repository.store.get('session-current');if(!bytes)return null;
    const value=decodeJson(bytes) as {id?:unknown};
    if(!validId(value?.id))throw new Error('前回の手紙の情報を読み取れません。保存データは保持しています。');
    return this.load(value.id);
  }
  async load(id:string):Promise<Project>{
    if(!validId(id))throw new Error('手紙の識別情報が正しくありません。');
    const bytes=await this.repository.store.get(`draft-${id}`);
    if(!bytes)throw new Error('この手紙の回復用データが見つかりません。保存済みのファイルを開いてください。');
    const {project,sourceVersion}=unpackProjectInfo(bytes);if(project.id!==id)throw new Error('手紙の識別情報が一致しません。');if(sourceVersion===1)await this.repository.preserveSource(bytes);return project;
  }
  async recent():Promise<RecentDocument[]>{
    const bytes=await this.repository.store.get('recent-documents');if(!bytes)return [];
    const list=decodeJson(bytes);
    if(!Array.isArray(list)||list.length>30||list.some(d=>!validId(d?.id)||typeof d.title!=='string'||d.title.length>200||!Number.isFinite(d.time)))throw new Error('最近使った手紙の一覧を読み取れません。保存データは保持しています。');
    return list.map(d=>({id:d.id,title:d.title,time:d.time}));
  }
}
