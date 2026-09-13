import {useEffect,useRef,useState} from 'react';
import {appThemes} from '../core/templates';
import {PaperDecoration} from './PaperDecoration';
import {PlatformStorage} from '../persistence/platform';
import {decodeJson,encodeJson} from '../persistence/repository';
import {Modal} from './Modal';
import {FontLicenses} from './FontLicenses';
import {SoftwareLicenses} from './SoftwareLicenses';
interface Preferences {theme:string;large:boolean}
export function usePreferences(onError:(text:string)=>void){
 const [value,setValue]=useState<Preferences>({theme:'plain',large:false}),[ready,setReady]=useState(false);
 const store=useRef(new PlatformStorage()).current,pending=useRef<Promise<unknown>>(Promise.resolve());
 useEffect(()=>{let alive=true;void store.get('user-preferences').then(bytes=>{if(!alive)return;if(bytes){const p=decodeJson(bytes) as Partial<Preferences>;if(appThemes.some(t=>t.id===p.theme)&&typeof p.large==='boolean')setValue({theme:p.theme!,large:p.large});}setReady(true);}).catch(()=>{if(alive){onError('画面設定を読み取れませんでした。初期設定で表示します。');setReady(true);}});return()=>{alive=false;};},[store]);
 const set=(next:Preferences)=>{setValue(next);pending.current=pending.current.then(()=>store.put('user-preferences',encodeJson(next))).catch(()=>onError('画面設定の保存に失敗しました。'));};
 useEffect(()=>{const t=appThemes.find(t=>t.id===value.theme)??appThemes[0];document.documentElement.style.setProperty('--accent',t.accent);document.documentElement.style.setProperty('--theme-soft',t.soft);document.documentElement.dataset.large=String(value.large);},[value]);
 return {value,set,ready};
}
export function PreferencesDialog({preferences,onClose}:{preferences:ReturnType<typeof usePreferences>;onClose:()=>void}){
 const {value,set}=preferences;
 return <Modal title="設定・使い方" onClose={onClose}>
   <section className="getting-started" aria-label="はじめて使う方へ"><h3>まずは、この3つだけで大丈夫です</h3><ol><li><strong>便箋を選ぶ</strong> — 上の「便箋を選ぶ」を押します。</li><li><strong>手紙を書く</strong> — 紙の上を押して、そのまま文字を入力します。</li><li><strong>保存・印刷する</strong> — 「ファイル」から保存し、「PDF・印刷」から出力します。</li></ol><p>操作を間違えたときは、上の「元に戻す」で直せます。</p></section>
   <h3>見やすさの設定</h3><label className="check-label large-setting"><input type="checkbox" disabled={!preferences.ready} checked={value.large} onChange={e=>set({...value,large:e.target.checked})}/><span><strong>操作画面の文字とボタンを大きくする</strong><small>便箋に印刷する文字の大きさは変わりません。</small></span></label>
   <fieldset className="theme-picker" disabled={!preferences.ready}><legend>画面の色を選ぶ</legend><div className="theme-grid">{appThemes.map(theme=><button type="button" key={theme.id} aria-pressed={value.theme===theme.id} onClick={()=>set({...value,theme:theme.id})}><span className="theme-preview" style={{backgroundColor:theme.soft}}>{theme.previewDesign&&<PaperDecoration design={theme.previewDesign} width={72} height={48} writingMode="horizontal"/>}</span><span>{theme.name}</span></button>)}</div></fieldset><p className="help-text">プレビューを押すと、画面の色と控えめなイラスト装飾がすぐ変わります。便箋のデザインや印刷する文字の大きさは変わりません。</p><hr/><h3>困ったときは</h3><ul className="guide-list"><li>保存されたか不安なときは、画面右上の保存状態を確認します。「ファイル」から今すぐ保存もできます。</li><li>写真を動かすときは、右側の「配置ページ」で移動先を選ぶと、そのページまで画面が移動します。</li><li>印刷前に「PDF・印刷」のプレビューで、用紙の端やページを確認します。</li></ul><details><summary>キーボードでの便利な操作</summary><p>Ctrl + S：保存 ／ Ctrl + Z：元に戻す<br/>Ctrl + Enter：改ページ ／ Ctrl + A：本文を全選択</p></details><hr/><SoftwareLicenses/><FontLicenses/><p className="help-text">レタリエ 1.0.1 — 想いを、一枚の手紙に。<br/>© 2026 Y-TEC · Apache License 2.0<br/>インターネット接続は不要です。画像・手紙はPC内で扱います。</p></Modal>;
}
