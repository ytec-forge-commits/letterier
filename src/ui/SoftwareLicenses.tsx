import {useEffect,useState} from 'react';
import {Modal} from './Modal';
const documents=[['LICENSE','本体 Apache-2.0'],['THIRD_PARTY_NOTICES.txt','第三者ライブラリ・フォント全文'],['MPL-SOURCE-NOTICE.txt','MPL対応ソースの案内'],['NOTICE','著作権表示'],['BRAND_POLICY.md','ブランド資産の条件'],['LICENSE_EXCEPTIONS.md','ライセンスの範囲']] as const;
export function SoftwareLicenses(){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState<string>('LICENSE'),[text,setText]=useState('');
 useEffect(()=>{if(!open)return;let alive=true;setText('読み込み中…');void fetch('/legal/'+selected).then(r=>{if(!r.ok)throw new Error();return r.text();}).then(t=>{if(alive)setText(t);}).catch(()=>{if(alive)setText('ライセンスを読み込めませんでした。インストール先のlegalフォルダーを確認してください。');});return()=>{alive=false;};},[open,selected]);
 return <><button onClick={()=>setOpen(true)}>オープンソースライセンス → 本体・ライブラリ</button>{open&&<Modal title="本体・ライブラリのライセンス" wide onClose={()=>setOpen(false)}><label className="field">表示する文書<select value={selected} onChange={e=>setSelected(e.target.value)}>{documents.map(([file,label])=><option key={file} value={file}>{label}</option>)}</select></label><p className="help-text">MPL対象の対応ソースはインストール先のlegalフォルダーのZIPに同梱しています。</p><pre className="license-text">{text}</pre></Modal>}</>;
}
