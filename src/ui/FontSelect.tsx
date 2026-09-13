import {useEffect,useMemo,useRef,useState} from 'react';
import {isTauri,invoke} from '@tauri-apps/api/core';
import type {Project} from '../core/model';
import {bundledFonts,bundledFamily} from '../core/bundled-fonts';
import {addRecentFont} from '../core/recent-fonts';
import {PlatformStorage} from '../persistence/platform';
import {decodeJson,encodeJson} from '../persistence/repository';
import {Modal} from './Modal';
const familiar=['游明朝','Yu Mincho','ＭＳ 明朝','MS Mincho','BIZ UDP明朝','BIZ UDPMincho','游ゴシック','Yu Gothic','Meiryo','メイリオ','ＭＳ ゴシック','MS Gothic'];
let available:Promise<string[]>|undefined;
function enumerate(){return available??=(isTauri()?invoke<string[]>('installed_fonts'):Promise.resolve(familiar)).then(names=>[...new Set(names)].sort((a,b)=>a.localeCompare(b,'ja'))).catch(e=>{available=undefined;throw e;});}
export function useFonts(){
 const [fonts,setFonts]=useState<string[]>([]),[error,setError]=useState(''),[recent,setRecent]=useState<string[]>([]),[ready,setReady]=useState(false);
 const store=useMemo(()=>new PlatformStorage(),[]),latest=useRef(recent),pending=useRef<Promise<unknown>>(Promise.resolve());
 useEffect(()=>{let alive=true;void enumerate().then(v=>{if(alive)setFonts(v);}).catch(()=>{if(alive)setError('PCのフォント一覧を取得できません。保存されたフォント名は保持しています。');});void store.get('recent-fonts').then(b=>{if(!alive)return;const v=b?decodeJson(b):[];if(!Array.isArray(v)||v.some(s=>typeof s!=='string'||s.length>100)||v.length>5)throw Error();latest.current=v;setRecent(v);setReady(true);}).catch(()=>{if(alive){setError('フォントの使用履歴を読み取れません。');setReady(true);}});return()=>{alive=false;};},[store]);
 const record=(name:string)=>{const next=addRecentFont(latest.current,name);latest.current=next;setRecent(next);pending.current=pending.current.then(()=>store.put('recent-fonts',encodeJson(next))).catch(()=>setError('フォントの使用履歴を保存できませんでした。'));};
 return {fonts,error,native:isTauri(),recent,record,ready};
}
export function missingFonts(project:Project,fonts:string[]){if(!fonts.length)return [];const names=[project.baseStyle.fontFamily,...project.body.runs.map(r=>r.style.fontFamily),...project.objects.map(o=>o.style?.fontFamily)];return [...new Set(names.filter((n):n is string=>!!n&&!fonts.includes(n)&&!bundledFonts.some(f=>f.name===n)))];}
export function FontSelect({id,value,onChange,fonts,recent=[]}:{id:string;value:string;onChange:(s:string)=>void;fonts:string[];recent?:string[]}){
 const [open,setOpen]=useState(false),[search,setSearch]=useState(''),[selected,setSelected]=useState(value);
 const all=[...bundledFonts.map(f=>f.name),...fonts],matches=(s:string)=>s.toLocaleLowerCase().includes(search.toLocaleLowerCase());
 const group=(title:string,names:string[])=>{const found=names.filter(matches);return found.length?<section className="font-group"><h3>{title}</h3>{found.map(f=><button key={f} aria-pressed={selected===f} onClick={()=>setSelected(f)}>{f}</button>)}</section>:null;};
 return <><button id={id} className="font-trigger" aria-haspopup="dialog" onClick={()=>{setSelected(value);setSearch('');setOpen(true);}}>{value}<span>選ぶ…</span></button>{open&&<Modal title="フォントを選択" wide onClose={()=>setOpen(false)}><div className="font-picker"><div className="font-list-area"><label className="field">フォントを検索<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="名前の一部を入力（例：明朝）" autoFocus/></label><div className="font-list">{group('最近使ったフォント',recent)}<h3 className="font-recommended">レタリエおすすめ</h3>{group('日本語',bundledFonts.filter(f=>f.language==='日本語').map(f=>f.name))}{group('English',bundledFonts.filter(f=>f.language==='English').map(f=>f.name))}{group('PCのフォント',fonts.filter(f=>!bundledFonts.some(b=>b.name===f)))}{!all.some(matches)&&!recent.some(matches)&&<p>該当するフォントがありません。</p>}</div></div><div className="font-sample-area"><strong>{selected}</strong><p className="font-sample" style={{fontFamily:`"${bundledFamily(selected)}", "Yu Mincho", serif`}}>いつも、ありがとう。<br/>季節の便りを、あなたへ。<br/><br/>Dear my friend,<br/>Thank you for everything.<br/>0123456789</p><p className="help-text">日本語を持たない英語フォントは、日本語部分を代替フォントで表示します。</p></div></div><div className="dialog-actions"><button onClick={()=>setOpen(false)}>キャンセル</button><button className="primary" onClick={()=>{onChange(selected);setOpen(false);}}>このフォントを使う</button></div></Modal>}</>;
}
