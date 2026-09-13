import { useEffect, useRef, useState } from 'react';
import { isTauri, invoke } from '@tauri-apps/api/core';
import {listen} from '@tauri-apps/api/event';
import type {OpenedFile} from '../persistence/platform';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { newProject, type Project } from '../core/model';
import { packProject, unpackProjectInfo } from '../core/archive';
import { DocumentRepository } from '../persistence/repository';
import { PlatformStorage, pickDocument, saveDocument } from '../persistence/platform';
import { SessionPersistence } from '../persistence/session';
const message=(e:unknown)=>e instanceof Error?e.message:String(e);
export function useDocumentFiles(project:Project,onLoad:(p:Project)=>void,onError:(error:string)=>void,suspended=false){
  const repository=useRef(new DocumentRepository(new PlatformStorage())).current;
  const session=useRef(new SessionPersistence(repository)).current;
  const current=useRef(project);current.current=project;
  const load=useRef(onLoad);load.current=onLoad;
  const report=useRef(onError);report.current=onError;
  const tokens=useRef(new Map<string,string>()),lastSnapshot=useRef(new Map<string,number>());
  const pending=useRef<Promise<unknown>>(Promise.resolve());
  const launchPending=useRef(isTauri()),[launchVersion,setLaunchVersion]=useState(0),running=useRef(false);
  const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState('読み込み中'),[bootError,setBootError]=useState('');
  const flush=async(p=current.current)=>{
    const token=tokens.current.get(p.id);
    const job=pending.current.then(async()=>{
      await session.save(p);
      if(token)await saveDocument(packProject(p),p.title,token);
      if(Date.now()-(lastSnapshot.current.get(p.id)??0)>=5*60*1000){await repository.snapshot(p);lastSnapshot.current.set(p.id,Date.now());}
      if(current.current===p)setStatus(token?'自動保存済み':'このPCに自動保存済み');
    });
    pending.current=job.catch(()=>{});
    try{await job;}catch(e){setStatus('保存に失敗');throw e;}
  };
  const flushRef=useRef(flush);flushRef.current=flush;
  const run=async(action:()=>Promise<unknown>)=>{
    if(running.current)return false;running.current=true;setBusy(true);report.current('');try{await action();return true;}catch(e){report.current(message(e));return false;}finally{running.current=false;setBusy(false);}
  };
  const endEditing=async()=>{await flushRef.current();await repository.snapshot(current.current);};
  const activate=async(p:Project,token?:string)=>{
    await repository.snapshot(p);lastSnapshot.current.set(p.id,Date.now());
    if(token)tokens.current.set(p.id,token);else tokens.current.delete(p.id);
    current.current=p;load.current(p);setReady(true);setBootError('');
  };
  const activateFile=async(file:OpenedFile)=>{
    const bytes=new Uint8Array(file.bytes);let p:Project;
    if(file.name.toLowerCase().endsWith('.binsenbak'))p=await repository.importBackup(bytes);
    else{const info=unpackProjectInfo(bytes);p=info.project;if(info.sourceVersion===1)await repository.preserveSource(bytes);}
    await activate(p,file.name.toLowerCase().endsWith('.binsen')?file.token:undefined);
  };
  useEffect(()=>{
    if(!isTauri())return;let disposed=false,stop:(()=>void)|undefined;
    void listen('open-requested',()=>{launchPending.current=true;setLaunchVersion(v=>v+1);}).then(unlisten=>{if(disposed)unlisten();else stop=unlisten;});
    return()=>{disposed=true;stop?.();};
  },[]);
  useEffect(()=>{
    if(!ready||busy||suspended||!launchPending.current)return;
    launchPending.current=false;
    void run(async()=>{for(let i=0;i<20;i++){await endEditing();const file=await invoke<OpenedFile|null>('take_launch_document');if(!file)break;await activateFile(file);}});
  },[ready,busy,suspended,launchVersion]);
  useEffect(()=>{let alive=true;(async()=>{
    try{const p=await session.recover();if(!alive)return;if(p){await repository.snapshot(p);if(!alive)return;lastSnapshot.current.set(p.id,Date.now());load.current(p);}setReady(true);}
    catch(e){if(alive){setBootError(message(e));setStatus('前回の手紙を回復できません');}}
  })();return ()=>{alive=false;};},[repository,session]);
  useEffect(()=>{
    if(!ready)return;setStatus('未保存の変更あり');
    const timer=setTimeout(()=>void flushRef.current(project).catch(e=>report.current(message(e))),1800);
    return ()=>clearTimeout(timer);
  },[project,ready]);
  useEffect(()=>{
    if(!ready)return;
    const before=(event:BeforeUnloadEvent)=>{if(status==='未保存の変更あり'||status==='保存に失敗'){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',before);return ()=>window.removeEventListener('beforeunload',before);
  },[ready,status]);
  useEffect(()=>{
    if(!isTauri())return;
    let disposed=false,stop:(()=>void)|undefined;
    void getCurrentWindow().onCloseRequested(async event=>{
      event.preventDefault();if(busy)return;
      setBusy(true);
      try{if(ready){await flushRef.current();await repository.snapshot(current.current);}await invoke('close_app');}
      catch(e){report.current(`終了前の保存に失敗しました。${message(e)} 別の場所へ名前を付けて保存してから閉じてください。`);setBusy(false);}
    }).then(unlisten=>{if(disposed)unlisten();else stop=unlisten;});
    return ()=>{disposed=true;stop?.();};
  },[ready,busy,repository]);
  return {ready,busy,status,bootError,repository,session,run,flush,
    create:()=>run(async()=>{if(ready)await endEditing();await activate(newProject());}),
    createFrom:(p:Project)=>run(async()=>{if(ready)await endEditing();await activate(p);}),
    open:()=>run(async()=>{if(ready)await endEditing();const file=await pickDocument();if(!file)return;await activateFile(file);}),
    openRecent:(id:string)=>run(async()=>{if(ready)await endEditing();const p=await session.load(id);await activate(p);}),
    saveNow:()=>run(()=>flushRef.current()),
    saveAs:()=>run(async()=>{const p=current.current;await session.save(p);const saved=await saveDocument(packProject(p),p.title);if(saved?.token)tokens.current.set(p.id,saved.token);if(saved){setStatus(saved.token?'保存済み':'ファイルを書き出しました');await repository.snapshot(p);}}),
    backup:()=>run(async()=>{await flushRef.current();const p=current.current;await repository.snapshot(p);await saveDocument(await repository.exportBackup(p),p.title,undefined,true);}),
    restore:(id:string)=>run(async()=>{const p=await repository.restore(current.current,id);load.current(p);await flushRef.current(p);}),
  };
}
