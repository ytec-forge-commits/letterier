import {uid,type Project} from '../core/model';
import {makeUserTemplate} from '../core/templates';
import type {Measure} from '../core/compose';
import {packProject,unpackProject} from '../core/archive';
import {decodeJson,encodeJson,type KeyValueStore} from './repository';
export interface UserTemplate {id:string;name:string;withText:boolean;time:number;dataId?:string}
export class TemplateRepository {
 private pending:Promise<unknown>=Promise.resolve();
 constructor(private store:KeyValueStore){}
 private serial<T>(f:()=>Promise<T>){const next=this.pending.then(f,f);this.pending=next.catch(()=>{});return next;}
 async list():Promise<UserTemplate[]>{
  const bytes=await this.store.get('user-templates-index');if(!bytes)return [];
  const list=decodeJson(bytes);if(!Array.isArray(list)||list.length>200)throw Error('登録したテンプレートの一覧を読み取れません。');
  return list.map(v=>{if(!v||typeof v.id!=='string'||!/^[-a-zA-Z0-9]{1,100}$/.test(v.id)||typeof v.name!=='string'||v.name.length>80||typeof v.withText!=='boolean'||!Number.isFinite(v.time)||(v.dataId!==undefined&&(typeof v.dataId!=='string'||!/^[-a-zA-Z0-9]{1,100}$/.test(v.dataId))))throw Error('テンプレートの一覧が破損しています。');return {id:v.id,name:v.name,withText:v.withText,time:v.time,...(v.dataId?{dataId:v.dataId}:{})};});
 }
 add(name:string,p:Project,withText:boolean,measure:Measure){return this.serial(async()=>{
  if(!name.trim()||name.length>80)throw Error('テンプレート名を80文字以内で入力してください。');
  const list=await this.list();if(list.length>=200)throw Error('テンプレートは200件まで登録できます。');
  const entry={id:uid(),name:name.trim(),withText,time:Date.now()};
  await this.store.put(`user-template-${entry.id}`,packProject(makeUserTemplate(p,withText,measure)));
  await this.store.put('user-templates-index',encodeJson([entry,...list]));return entry;
 });}
 async open(id:string):Promise<Project>{
  const entry=(await this.list()).find(t=>t.id===id);if(!entry)throw Error('このテンプレートは登録されていません。');
  const bytes=await this.store.get(`user-template-${entry.dataId??id}`);if(!bytes)throw Error('テンプレートのデータを読み取れません。');
  const p=unpackProject(bytes);p.id=uid();p.objects=p.objects.map(o=>o.kind==='image'?{...o,stationery:true}:o);return p;
 }
 update(id:string,name:string,p:Project,withText:boolean,measure:Measure){return this.serial(async()=>{
  if(!name.trim()||name.length>80)throw Error('テンプレート名を80文字以内で入力してください。');
  const list=await this.list();if(!list.some(t=>t.id===id))throw Error('このテンプレートは登録されていません。');
  const dataId=uid(),entry={id,name:name.trim(),withText,time:Date.now(),dataId};
  // Commit the index only after the new immutable payload succeeds. Failed writes retain the old registration.
  await this.store.put(`user-template-${dataId}`,packProject(makeUserTemplate(p,withText,measure)));
  try{await this.store.put('user-templates-index',encodeJson(list.map(t=>t.id===id?entry:t)));}
  catch(e){try{await this.store.remove(`user-template-${dataId}`);}catch{}throw e;}
  const old=list.find(t=>t.id===id)!;
  // Only the superseded payload is reclaimed, and only after the new index has committed.
  try{await this.store.remove(`user-template-${old.dataId??old.id}`);}catch{}
  return entry;
 });}
 remove(id:string){return this.serial(async()=>{const list=await this.list(),entry=list.find(t=>t.id===id);await this.store.put('user-templates-index',encodeJson(list.filter(t=>t.id!==id)));if(entry)await this.store.remove(`user-template-${entry.dataId??id}`);});}
}
