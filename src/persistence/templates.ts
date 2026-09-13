import {uid,type Project} from '../core/model';
import {makeUserTemplate} from '../core/templates';
import type {Measure} from '../core/compose';
import {packProject,unpackProject} from '../core/archive';
import {decodeJson,encodeJson,type KeyValueStore} from './repository';
export interface UserTemplate {id:string;name:string;withText:boolean;time:number}
export class TemplateRepository {
 private pending:Promise<unknown>=Promise.resolve();
 constructor(private store:KeyValueStore){}
 private serial<T>(f:()=>Promise<T>){const next=this.pending.then(f,f);this.pending=next.catch(()=>{});return next;}
 async list():Promise<UserTemplate[]>{
  const bytes=await this.store.get('user-templates-index');if(!bytes)return [];
  const list=decodeJson(bytes);if(!Array.isArray(list)||list.length>200)throw Error('登録したテンプレートの一覧を読み取れません。');
  return list.map(v=>{if(!v||typeof v.id!=='string'||!/^[-a-zA-Z0-9]{1,100}$/.test(v.id)||typeof v.name!=='string'||v.name.length>80||typeof v.withText!=='boolean'||!Number.isFinite(v.time))throw Error('テンプレートの一覧が破損しています。');return {id:v.id,name:v.name,withText:v.withText,time:v.time};});
 }
 add(name:string,p:Project,withText:boolean,measure:Measure){return this.serial(async()=>{
  if(!name.trim()||name.length>80)throw Error('テンプレート名を80文字以内で入力してください。');
  const list=await this.list();if(list.length>=200)throw Error('テンプレートは200件まで登録できます。');
  const entry={id:uid(),name:name.trim(),withText,time:Date.now()};
  await this.store.put(`user-template-${entry.id}`,packProject(makeUserTemplate(p,withText,measure)));
  await this.store.put('user-templates-index',encodeJson([entry,...list]));return entry;
 });}
 async open(id:string):Promise<Project>{
  if(!(await this.list()).some(t=>t.id===id))throw Error('このテンプレートは登録されていません。');
  const bytes=await this.store.get(`user-template-${id}`);if(!bytes)throw Error('テンプレートのデータを読み取れません。');
  const p=unpackProject(bytes);p.id=uid();return p;
 }
 remove(id:string){return this.serial(async()=>{const list=await this.list();await this.store.put('user-templates-index',encodeJson(list.filter(t=>t.id!==id)));await this.store.remove(`user-template-${id}`);});}
}
