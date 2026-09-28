import { useEffect, useState } from 'react';
import type { Project } from '../core/model';
import type { Revision } from '../core/history';
import type { DocumentRepository } from '../persistence/repository';
import { ReadonlyPages } from './ReadonlyPages';
import { Modal } from './Modal';
export function DocumentPreview({project}:{project:Project}){
  const [zoom,setZoom]=useState(.43);
  return <><label className="preview-zoom">プレビューの大きさ <select aria-label="プレビューの大きさ" value={zoom} onChange={e=>setZoom(Number(e.target.value))}><option value={.43}>43%</option><option value={.65}>65%</option><option value={1}>100%</option></select></label><ReadonlyPages project={project} zoom={zoom}/></>;
}
export function HistoryDialog({project,repository,onClose,onRestore}:{project:Project;repository:DocumentRepository;onClose:()=>void;onRestore:(id:string)=>Promise<unknown>}){
  const [entries,setEntries]=useState<Revision[]>([]),[selected,setSelected]=useState<Revision|null>(null),[preview,setPreview]=useState<Project|null>(null),[error,setError]=useState(''),[label,setLabel]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{let alive=true;void repository.history(project.id).then(list=>{if(alive)setEntries(list);}).catch(e=>setError(String(e)));return ()=>{alive=false;};},[project.id,repository]);
  useEffect(()=>{let alive=true;setPreview(null);if(selected)void repository.revision(project.id,selected).then(p=>{if(alive)setPreview(p);}).catch(e=>setError(String(e)));return ()=>{alive=false;};},[selected,project.id,repository]);
  const protect=async()=>{setBusy(true);try{setEntries(await repository.snapshot(project,label.trim()));setLabel('');}catch(e){setError(String(e));}finally{setBusy(false);}};
  return <Modal title="保存履歴" onClose={busy?undefined:onClose} wide><p>通常の履歴は直近50世代。名前を付けた保護版は別に残ります。復元前の状態も履歴に保存します。</p><div className="history-protect"><input aria-label="保護版の名前" placeholder="例：送る前の完成版" maxLength={100} value={label} onChange={e=>setLabel(e.target.value)}/><button disabled={!label.trim()||busy} onClick={()=>void protect()}>現在を保護版にする</button></div><div className="history-layout"><div className="history-list">{entries.length===0&&<p>まだ保存履歴がありません。</p>}{[...entries].reverse().map(e=><button key={e.id} aria-pressed={selected?.id===e.id} onClick={()=>setSelected(e)}><strong>{e.protected?'★ ':''}{e.label||new Date(e.time).toLocaleString('ja-JP')}</strong><small>{e.protected?new Date(e.time).toLocaleString('ja-JP'):''}</small><span>{e.preview.slice(0,80)||'本文のない手紙'}</span></button>)}</div><div className="history-preview">{preview?<DocumentPreview project={preview}/>:<p>履歴を選ぶと、便箋の見た目を確認できます。</p>}</div></div>{error&&<p role="alert">{error}</p>}<div className="dialog-actions"><button onClick={onClose} disabled={busy}>閉じる</button><button className="primary" disabled={!preview||busy} onClick={async()=>{setBusy(true);const ok=await onRestore(selected!.id);setBusy(false);if(ok)onClose();}}>この状態へ復元する</button></div></Modal>;
}
