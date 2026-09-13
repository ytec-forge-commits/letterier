import { invoke, isTauri } from '@tauri-apps/api/core';
import type { KeyValueStore } from './repository';
let database:Promise<IDBDatabase>|undefined;
function db():Promise<IDBDatabase>{
  database??=new Promise((resolve,reject)=>{
    const request=indexedDB.open('binsen-kobo-local-v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files');
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('このブラウザの保存領域を利用できません。'));
  });return database;
}
export class PlatformStorage implements KeyValueStore {
  async get(key:string):Promise<Uint8Array|null>{
    if(isTauri()){const value=await invoke<number[]|null>('local_read',{key});return value?new Uint8Array(value):null;}
    const database=await db();
    return new Promise((resolve,reject)=>{const request=database.transaction('files').objectStore('files').get(key);request.onsuccess=()=>resolve(request.result?new Uint8Array(request.result):null);request.onerror=()=>reject(request.error);});
  }
  async put(key:string,bytes:Uint8Array):Promise<void>{
    if(isTauri()){await invoke('local_write',{key,bytes:Array.from(bytes)});return;}
    const database=await db();
    return new Promise((resolve,reject)=>{const tx=database.transaction('files','readwrite');tx.objectStore('files').put(bytes,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??new Error('保存領域に書き込めません。'));tx.onabort=()=>reject(tx.error??new Error('保存が中断されました。'));});
  }
  async remove(key:string):Promise<void>{
    if(isTauri()){await invoke('local_remove',{key});return;}
    const database=await db();
    return new Promise((resolve,reject)=>{const tx=database.transaction('files','readwrite');tx.objectStore('files').delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
  }
}
export interface OpenedFile {token:string;name:string;bytes:number[]}
export interface SavedFile {token:string;name:string}
export async function pickDocument():Promise<OpenedFile|null>{
  if(isTauri())return invoke('open_document');
  return new Promise(resolve=>{
    const input=document.createElement('input');input.type='file';input.accept='.binsen,.binsenbak';
    input.onchange=async()=>{const file=input.files?.[0];resolve(file?{token:'',name:file.name,bytes:Array.from(new Uint8Array(await file.arrayBuffer()))}:null);};
    input.oncancel=()=>resolve(null);input.click();
  });
}
export async function saveDocument(bytes:Uint8Array,title:string,token?:string,backup=false):Promise<SavedFile|null>{
  if(isTauri())return invoke('save_document',{bytes:Array.from(bytes),name:title,token:token??null,backup});
  const extension=backup?'binsenbak':'binsen';
  const blob=new Blob([new Uint8Array(bytes).buffer],{type:'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`${title.replace(/[\\/:*?"<>|]/g,'_')}.${extension}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  return {token:'',name:a.download};
}
