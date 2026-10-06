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
export type LeaveChoice='save'|'discard'|'cancel';
export function useDocumentFiles(project:Project,onLoad:(p:Project)=>void,onError:(error:string)=>void,suspended=false,onLaunchRequest?:()=>void){
  const repository=useRef(new DocumentRepository(new PlatformStorage())).current;
  const session=useRef(new SessionPersistence(repository)).current;
  const current=useRef(project);current.current=project;
  const load=useRef(onLoad);load.current=onLoad;
  const report=useRef(onError);report.current=onError;
  const launchNotice=useRef(onLaunchRequest);launchNotice.current=onLaunchRequest;
  const tokens=useRef(new Map<string,string>()),lastSnapshot=useRef(new Map<string,number>());
  const pending=useRef<Promise<unknown>>(Promise.resolve());
  const launchPending=useRef(isTauri()),[launchVersion,setLaunchVersion]=useState(0),running=useRef(false);
  const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState('読み込み中'),[bootError,setBootError]=useState('');
  const savedProject=useRef<Project|null>(project);
  const leaveResolver=useRef<((choice:LeaveChoice)=>void)|null>(null);
  const [leavePrompt,setLeavePrompt]=useState<string|null>(null),[recovery,setRecovery]=useState<Project|null>(null);
  const [startupComplete,setStartupComplete]=useState(false);
  const [autosaveError,setAutosaveError]=useState('');
  const readyRef=useRef(ready);readyRef.current=ready;
  const dirty=()=>current.current!==savedProject.current;
  const flush=async(p=current.current)=>{
    const job=pending.current.then(async()=>{
      await session.save(p);
      if(Date.now()-(lastSnapshot.current.get(p.id)??0)>=5*60*1000){await repository.snapshot(p);lastSnapshot.current.set(p.id,Date.now());}
      if(current.current===p)setStatus(dirty()?'回復用データ保存済み・ファイルは未保存':'ファイル保存済み');
    });
    pending.current=job.catch(()=>{});
    try{await job;}catch(e){if(current.current===p)setStatus('保存に失敗');throw e;}
  };
  const flushRef=useRef(flush);flushRef.current=flush;
  const run=async(action:()=>Promise<unknown>)=>{
    if(running.current)return false;running.current=true;setBusy(true);report.current('');try{return (await action())!==false;}catch(e){report.current(message(e));return false;}finally{running.current=false;setBusy(false);}
  };
  const writeManual=async(forceNew=false)=>{
    const p=current.current;
    const saved=await saveDocument(packProject(p),p.title,forceNew?undefined:tokens.current.get(p.id));
    if(!saved)return false;
    if(saved.token)tokens.current.set(p.id,saved.token);
    savedProject.current=p;setStatus(current.current===p?'ファイル保存済み':'未保存の変更あり');
    try{await flushRef.current(p);}catch(e){report.current(`ファイルは保存しましたが、回復用データの保存に失敗しました。${message(e)}`);}
    return true;
  };
  const answerLeave=(choice:LeaveChoice)=>{const resolve=leaveResolver.current;leaveResolver.current=null;setLeavePrompt(null);resolve?.(choice);};
  const endEditing=async()=>{
    if(dirty()){
      const choice=await new Promise<LeaveChoice>(resolve=>{leaveResolver.current=resolve;setLeavePrompt(current.current.title);});
      if(choice==='cancel')return false;
      if(choice==='save'&&!await writeManual())return false;
    }
    // Local recovery is independent of the user's decision about the original file.
    try{await flushRef.current();}catch(e){report.current(`回復用データの保存に失敗しました。${message(e)}`);}
    return true;
  };
  const activate=async(p:Project,token?:string,saved=true)=>{
    await repository.snapshot(p);lastSnapshot.current.set(p.id,Date.now());
    if(token)tokens.current.set(p.id,token);else tokens.current.delete(p.id);
    savedProject.current=saved?p:null;current.current=p;load.current(p);setReady(true);setBootError('');
  };
  const activateFile=async(file:OpenedFile)=>{
    const bytes=new Uint8Array(file.bytes);let p:Project;
    if(file.name.toLowerCase().endsWith('.binsenbak'))p=await repository.importBackup(bytes);
    else{const info=unpackProjectInfo(bytes);p=info.project;if(info.sourceVersion===1)await repository.preserveSource(bytes);}
    await activate(p,file.name.toLowerCase().endsWith('.binsen')?file.token:undefined);
  };
  useEffect(()=>{
    if(!isTauri())return;let disposed=false,stop:(()=>void)|undefined;
    void listen('open-requested',()=>{launchPending.current=true;launchNotice.current?.();setLaunchVersion(v=>v+1);}).then(unlisten=>{if(disposed)unlisten();else stop=unlisten;});
    return()=>{disposed=true;stop?.();};
  },[]);
  useEffect(()=>{
    if(!ready||busy||suspended||!launchPending.current)return;
    launchPending.current=false;
    void run(async()=>{try{for(let i=0;i<20;i++){if(dirty()&&!await endEditing())return false;const file=await invoke<OpenedFile|null>('take_launch_document');if(!file)break;await activateFile(file);}}finally{setStartupComplete(true);}});
  },[ready,busy,suspended,launchVersion]);
  useEffect(()=>{let alive=true;(async()=>{
    try{const p=await session.recover();if(!alive)return;setRecovery(p);setReady(true);if(!isTauri())setStartupComplete(true);}
    catch(e){if(alive){setBootError(message(e));setStatus('前回の手紙を回復できません');}}
  })();return ()=>{alive=false;};},[repository,session]);
  useEffect(()=>{
    if(!ready)return;
    setAutosaveError('');
    if(!dirty()){setStatus(tokens.current.has(project.id)?'ファイル保存済み':'新しい手紙');return;}
    setStatus('未保存の変更あり');
    let active=true,retries=0;
    const delays=[5000,15000,30000];
    const attempt=async()=>{
      if(!active||current.current!==project)return;
      try{await flushRef.current(project);if(active&&current.current===project)setAutosaveError('');}
      catch(e){
        if(!active||current.current!==project)return;
        setAutosaveError(message(e));
        if(retries<delays.length)timer=setTimeout(()=>void attempt(),delays[retries++]);
      }
    };
    let timer=setTimeout(()=>void attempt(),1800);
    return ()=>{active=false;clearTimeout(timer);};
  },[project,ready]);
  useEffect(()=>{
    if(!ready)return;
    const before=(event:BeforeUnloadEvent)=>{if(dirty()){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',before);return ()=>window.removeEventListener('beforeunload',before);
  },[ready,status]);
  useEffect(()=>{
    if(!isTauri())return;
    let disposed=false,stop:(()=>void)|undefined;
    void getCurrentWindow().onCloseRequested(async event=>{
      event.preventDefault();
      await run(async()=>{if(readyRef.current&&!await endEditing())return false;await invoke('close_app');});
    }).then(unlisten=>{if(disposed)unlisten();else stop=unlisten;});
    return ()=>{disposed=true;stop?.();};
  // Keep the native guard registered while saving/rendering; current state is read via refs.
  },[repository]);
  return {ready,busy,status,bootError,repository,session,run,flush,leavePrompt,answerLeave,recovery,startupComplete,autosaveError,dismissAutosaveError:()=>setAutosaveError(''),
    create:()=>run(async()=>{if(ready&&!await endEditing())return false;await activate(newProject());}),
    createFrom:(p:Project)=>run(async()=>{if(ready&&!await endEditing())return false;await activate(p);}),
    open:()=>run(async()=>{if(ready&&!await endEditing())return false;const file=await pickDocument();if(!file)return false;await activateFile(file);}),
    openRecent:(id:string)=>run(async()=>{if(ready&&!await endEditing())return false;const p=await session.load(id);await activate(p,undefined,false);}),
    recover:()=>run(async()=>{if(!recovery)return false;if(ready&&!await endEditing())return false;await activate(recovery,undefined,false);setRecovery(null);}),
    saveNow:()=>run(()=>writeManual()),
    saveAs:()=>run(()=>writeManual(true)),
    backup:()=>run(async()=>{await flushRef.current();const p=current.current;await repository.snapshot(p);await saveDocument(await repository.exportBackup(p),p.title,undefined,true);}),
    restore:(id:string)=>run(async()=>{const p=await repository.restore(current.current,id);load.current(p);await flushRef.current(p);}),
  };
}
