import {useEffect,useMemo,useState} from 'react';
import {templates,createFromTemplate,applyTemplateDesign} from '../core/templates';
import {replaceRange,type Project} from '../core/model';
import {TemplateRepository,type UserTemplate} from '../persistence/templates';
import {PlatformStorage} from '../persistence/platform';
import {ReadonlyPages} from './ReadonlyPages';
import {PaperDecoration} from './PaperDecoration';
import {measureText} from './typography';
import {Modal} from './Modal';
import type {UiLanguage} from '../i18n';
export function TemplateDialog({project,language,onClose,onNew,onApply}:{project:Project;language:UiLanguage;onClose:()=>void;onNew:(p:Project)=>Promise<boolean>;onApply:(p:Project)=>boolean}){
 const repository=useMemo(()=>new TemplateRepository(new PlatformStorage()),[]);
 const [family,setFamily]=useState('すべて'),[season,setSeason]=useState('すべて'),[chosen,setChosen]=useState('washi'),[mode,setMode]=useState(project.settings.writingMode);
 const [user,setUser]=useState<UserTemplate[]>([]),[custom,setCustom]=useState<Project|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [register,setRegister]=useState(false),[name,setName]=useState(''),[withText,setWithText]=useState(false),[remove,setRemove]=useState(false);
 const run=async(f:()=>Promise<void>)=>{setBusy(true);setError('');try{await f();}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}};
 useEffect(()=>{void run(async()=>setUser(await repository.list()));},[repository]);
 const builtin=templates.find(t=>t.id===chosen),saved=user.find(t=>t.id===chosen);
 const sample=language==='ja'?'季節の移ろいを感じる頃となりました。\nいかがお過ごしでしょうか。\n\n心を込めて、お便りいたします。\f続きのページは、控えめな飾りで。\n言葉をゆっくり綴る余白を大切に。':'I hope this letter finds you well.\nThe changing season brought you to mind.\n\nWith warmest wishes, I wanted to write.\fThe second page keeps the decoration quiet,\nleaving generous space for your words.';
 const preview=useMemo(()=>custom??replaceRange(createFromTemplate(builtin?.id??'washi',mode),0,0,sample),[custom,builtin,mode,sample]);
 return <Modal title="便箋を選ぶ" wide onClose={onClose}><div className="template-filters"><label>種類 <select value={family} onChange={e=>setFamily(e.target.value)}>{['すべて','和風','洋風','自分のテンプレート'].map(s=><option key={s}>{s}</option>)}</select></label>{family!=='自分のテンプレート'&&<label>季節 <select value={season} onChange={e=>setSeason(e.target.value)}>{['すべて','通年','春','夏','秋','冬'].map(s=><option key={s}>{s}</option>)}</select></label>}<button onClick={()=>{setRegister(!register);setRemove(false);}}>今の便箋を登録…</button></div>
 {register&&<form className="template-register" onSubmit={e=>{e.preventDefault();void run(async()=>{await repository.add(name,project,withText,measureText);setUser(await repository.list());setRegister(false);setFamily('自分のテンプレート');setName('');});}}><label>名前 <input value={name} onChange={e=>setName(e.target.value)} maxLength={80} required/></label><label className="check-label"><input type="checkbox" checked={withText} onChange={e=>setWithText(e.target.checked)}/>本文・文字箱も含めて登録</label><small>チェックしない場合、本文と文字箱を除き、画像・背景・罫線を登録します。</small><button disabled={busy}>登録する</button></form>}
 <div className="template-layout"><div className="template-grid">{family==='自分のテンプレート'?<>{!user.length&&<p>まだ登録されていません。</p>}{user.map(t=><button key={t.id} aria-pressed={chosen===t.id} disabled={busy} onClick={()=>void run(async()=>{setCustom(await repository.open(t.id));setChosen(t.id);setRemove(false);})}><span className="template-user-icon">✉</span><strong>{t.name}</strong><small>{t.withText?'本文を含む':'デザインのみ'}</small></button>)}</>:templates.filter(t=>(family==='すべて'||t.family===family)&&(season==='すべて'||t.season===season)).map(t=>{
   return <button key={t.id} aria-pressed={chosen===t.id} onClick={()=>{setChosen(t.id);setCustom(null);setRemove(false);}}><div className="template-thumbnail" style={{background:t.paper}}><PaperDecoration design={`${t.id}-first`} width={210} height={297} writingMode={mode}/><svg width="100%" height="100%" viewBox="0 0 210 297"><g stroke={t.color} strokeWidth=".35">{Array.from({length:12},(_,i)=><path key={i} d={mode==='horizontal'?`M20 ${36+i*16}H190`:`M${180-i*13} 20V277`}/>)}</g></svg></div><strong>{t.name}</strong><small>{t.family} · {t.season}</small></button>;
 })}</div><div className="template-detail"><strong>{builtin?.name??saved?.name}</strong><p>{builtin?.description??'登録した便箋から、新しい手紙を作れます。'}</p>{builtin&&<label className="preview-zoom">プレビューの書字方向 <select value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option value="horizontal">横書き</option><option value="vertical">縦書き</option></select></label>}<div className="template-preview"><ReadonlyPages project={preview} zoom={.32}/></div><small>最初のページと、続きのページ</small></div></div>
 {error&&<p role="alert" className="warning">{error}</p>}
 {remove&&saved&&<p className="warning">「{saved.name}」の登録を削除します。<button disabled={busy} onClick={()=>void run(async()=>{await repository.remove(saved.id);setUser(await repository.list());setChosen('washi');setCustom(null);setRemove(false);})}>登録を削除する</button><button onClick={()=>setRemove(false)}>戻る</button></p>}
 <div className="dialog-actions">{saved&&<button className="danger" onClick={()=>setRemove(true)}>登録を削除…</button>}{builtin&&<button disabled={busy} onClick={()=>{if(onApply(applyTemplateDesign(project,builtin.id)))onClose();}}>今の手紙にデザインを適用</button>}<button className="primary" disabled={busy||(!builtin&&!custom)} onClick={()=>void run(async()=>{const p=builtin?createFromTemplate(builtin.id,mode):await repository.open(chosen);if(await onNew(p))onClose();})}>この便箋で新しい手紙</button></div><p className="help-text">デザインを適用すると、全ページの背景・罫線・余白が選んだ便箋に変わります。「元に戻す」で戻せます。新しい手紙を作る前に、今の手紙を自動保存します。</p>
 </Modal>;
}
