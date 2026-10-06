import {useEffect,useState} from 'react';
import {bundledFonts} from '../core/bundled-fonts';
import {Modal} from './Modal';
export function FontLicenses(){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState('Klee One');
 const [licenses,setLicenses]=useState<Record<string,string>|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  if(!open||licenses)return;
  let alive=true;setError('');
  void import('./font-licenses.json').then(module=>{if(alive)setLicenses(module.default);}).catch(()=>{if(alive)setError('フォントのライセンスを読み込めませんでした。アプリを再起動して再度開いてください。');});
  return()=>{alive=false;};
 },[open,licenses]);
 return <><button onClick={()=>setOpen(true)}>オープンソースライセンス → 同梱フォント</button>{open&&<Modal title="同梱フォントのライセンス" wide onClose={()=>setOpen(false)}><p>以下のフォントは各著作権者のSIL Open Font License 1.1に基づき配布しています。レタリエ本体のApache License 2.0には含めません。フォント原本は改変していません。</p><label className="field">フォント<select value={selected} onChange={e=>setSelected(e.target.value)}>{bundledFonts.map(f=><option key={f.name}>{f.name}</option>)}</select></label>{error?<p role="alert">{error}</p>:<pre className="license-text" aria-busy={!licenses}>{licenses?licenses[selected]:'読み込み中…'}</pre>}</Modal>}</>;
}
