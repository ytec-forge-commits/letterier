import {useState} from 'react';
import {bundledFonts} from '../core/bundled-fonts';
import licenses from './font-licenses.json';
import {Modal} from './Modal';
export function FontLicenses(){const [open,setOpen]=useState(false),[selected,setSelected]=useState('Klee One');return <><button onClick={()=>setOpen(true)}>オープンソースライセンス → 同梱フォント</button>{open&&<Modal title="同梱フォントのライセンス" wide onClose={()=>setOpen(false)}><p>以下のフォントは各著作権者のSIL Open Font License 1.1に基づき配布しています。レタリエ本体のApache License 2.0には含めません。フォント原本は改変していません。</p><label className="field">フォント<select value={selected} onChange={e=>setSelected(e.target.value)}>{bundledFonts.map(f=><option key={f.name}>{f.name}</option>)}</select></label><pre className="license-text">{licenses[selected as keyof typeof licenses]}</pre></Modal>}</>;}
