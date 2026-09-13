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
 return <Modal title="画面設定・使い方" onClose={onClose}><fieldset className="theme-picker" disabled={!preferences.ready}><legend>画面のテーマ</legend><div className="theme-grid">{appThemes.map(theme=><button type="button" key={theme.id} aria-pressed={value.theme===theme.id} onClick={()=>set({...value,theme:theme.id})}><span className="theme-preview" style={{backgroundColor:theme.soft}}>{theme.previewDesign&&<PaperDecoration design={theme.previewDesign} width={72} height={48} writingMode="horizontal"/>}</span><span>{theme.name}</span></button>)}</div></fieldset><label className="check-label"><input type="checkbox" disabled={!preferences.ready} checked={value.large} onChange={e=>set({...value,large:e.target.checked})}/>操作画面の文字を大きくする</label><p className="help-text">プレビューを押すと、画面の色と控えめなイラスト装飾がすぐ変わります。便箋のデザインや印刷する文字の大きさは変わりません。</p><hr/><SoftwareLicenses/><FontLicenses/><h3>レタリエの使い方</h3><ol className="guide-list"><li>「便箋を選ぶ」で好みの一枚を選びます。</li><li>便箋の上をクリックして入力します。文字を選ぶと、その部分だけ書式を変えられます。</li><li>「写真・画像」「文字箱」で配置する要素を加えます。選んでドラッグすると移動できます。</li><li>「ファイル」で名前を付けて保存します。保存前も、このPCに回復用データを自動保存します。</li><li>「PDF・印刷」で用紙とページを確認して出力します。</li></ol><p>Ctrl + S：保存 ／ Ctrl + Z：元に戻す<br/>Ctrl + Enter：改ページ ／ Ctrl + A：本文を全選択</p><p className="help-text">レタリエ 1.0.1 — 想いを、一枚の手紙に。<br/>© 2026 Y-TEC · Apache License 2.0<br/>インターネット接続は不要です。画像・手紙はPC内で扱います。</p></Modal>;
}
