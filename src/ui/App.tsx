import { useEffect, useMemo, useRef, useState } from 'react';
import { bodyText, pruneAssets, newProject, replaceRange, formatRange, styleAt, uid, type Project, type TextStyle, type FloatingObject } from '../core/model';
import {applyBodyFont} from '../core/text-format';
import {trimUndo} from '../core/edit-history';
import {assertImageBudget} from '../core/image-budget';
import { compose, flowAnchor } from '../core/compose';
import { EditorCanvas, readSelection, type TextSelection } from './EditorCanvas';
import { measureText } from './typography';
import { useDocumentFiles } from './useDocumentFiles';
import { HistoryDialog } from './HistoryDialog';
import { Modal } from './Modal';
import type { RecentDocument } from '../persistence/session';
import { PageOperationDialog } from './PageOperationDialog';
import { applyPageOperation } from '../core/pages';
import { ObjectProperties } from './ObjectProperties';
import { readImage,imageAccept } from './assets';
import {useFramePicker} from './FrameDialog';
import { changeWritingMode,moveFixedObjectToPage } from '../core/objects';
import {shouldCoalesceEdit,type EditGroup} from '../core/history-coalesce';
import { PageVisualDialog } from './PageVisualDialog';
import {TemplateDialog} from './TemplateDialog';
import {usePreferences,PreferencesDialog} from './Preferences';
import {FontSelect,useFonts,missingFonts} from './FontSelect';
import {OutputDialog} from './OutputDialog';
import {useDomLocalization} from '../i18n';
import './app.css';

export function App() {
  const [project,setProject]=useState(newProject);
  const [selection,setSelection]=useState<TextSelection>({start:0,end:0});
  const [typing,setTyping]=useState<{at:number;style:Partial<TextStyle>}|null>(null);
  const [caret,setCaret]=useState(0),[zoom,setZoom]=useState(.8),[page,setPage]=useState(0);
  const [error,setError]=useState('');
  const preferences=usePreferences(setError);
  useDomLocalization(preferences.value.language);
  const fonts=useFonts();
  const missing=fonts.native?missingFonts(project,fonts.fonts):[];
  const past=useRef<Project[]>([]),future=useRef<Project[]>([]),editGroup=useRef<EditGroup|null>(null);
  const [selectedObject,setSelectedObject]=useState<string|null>(null),[objectPreview,setObjectPreview]=useState<{id:string;patch:Partial<FloatingObject>}|null>(null);
  const imageInput=useRef<HTMLInputElement>(null);
  const frames=useFramePicker();
  const [imageBusy,setImageBusy]=useState(false);
  const [dialog,setDialog]=useState<'files'|'history'|'recent'|'page'|'visual'|'templates'|'preferences'|'output'|null>(null),[recent,setRecent]=useState<RecentDocument[]>([]);
  const files=useDocumentFiles(project,p=>{compose(p,measureText);past.current=[];future.current=[];setTyping(null);setSelectedObject(null);setProject(p);setPage(0);setSelection({start:0,end:0});setCaret(v=>v+1);},setError,imageBusy||dialog!==null);
  const renderProject=useMemo(()=>objectPreview?{...project,objects:project.objects.map(o=>o.id===objectPreview.id?{...o,...objectPreview.patch}:o)}:project,[project,objectPreview]);
  const layout=useMemo(()=>compose(renderProject,measureText),[renderProject]);
  const activeObject=layout.objects.find(o=>o.id===selectedObject);
  const currentStyle={...project.baseStyle,...styleAt(project,selection.start===selection.end?Math.max(0,selection.start-1):selection.start),...(typing?.at===selection.start?typing.style:{})};
  const change=(next:Project,restore=true,group?:{kind:EditGroup['kind'];cursor:number;nextCursor:number})=>{next=pruneAssets(next);try{const total=Object.values(next.assets).reduce((sum,a)=>sum+a.data.length+(a.original?.data.length??0),0);if(total>64*1024*1024*4/3)throw Error('素材の合計が64MBを超えます。不要な画像を削除するか、別の手紙に分けてください。');assertImageBudget(next.assets);compose(next,measureText);}catch(e){setError(String(e));return false;}const time=Date.now(),merge=group&&shouldCoalesceEdit(editGroup.current,group.kind,group.cursor,time);if(!merge)past.current.push(project);editGroup.current=group?{kind:group.kind,nextCursor:group.nextCursor,time}:null;trimUndo(past.current,next);future.current=[];setProject(next);if(restore)setCaret(v=>v+1);return true;};
  const scrollToPage=(index:number)=>requestAnimationFrame(()=>document.querySelectorAll('.paper-scroll .sheet-frame')[index]?.scrollIntoView({block:'start',behavior:'smooth'}));
  const changeObject=(id:string,patch:Partial<FloatingObject>)=>{const ok=change({...project,objects:project.objects.map(o=>o.id===id?{...o,...patch}:o)},false);if(ok&&patch.style?.fontFamily&&patch.style.fontFamily!==project.objects.find(o=>o.id===id)?.style?.fontFamily)fonts.record(patch.style.fontFamily);if(ok&&typeof patch.pageIndex==='number'){setPage(patch.pageIndex);scrollToPage(patch.pageIndex);}return ok;};
  const moveObjectToPage=(id:string,pageIndex:number)=>{if(change(moveFixedObjectToPage(project,id,pageIndex),false)){setPage(pageIndex);scrollToPage(pageIndex);}};
  const deleteObject=(id:string)=>{change({...project,objects:project.objects.filter(o=>o.id!==id)},false);setSelectedObject(null);};
  const addObject=async(kind:'image'|'text',file?:File)=>{
    if(imageBusy)return;setImageBusy(true);
    try{
      if(project.objects.length>=200)throw new Error('自由配置の要素は200個までです。');
      const image=file?await readImage(file,frames.choose):null;if(file&&!image)return;const id=uid(),line=flowAnchor(project,{id,anchorOffset:selection.start},measureText);
      const width=Math.min(kind==='image'?60:70,layout.width-30),height=image?Math.min(150,width*image.height/image.width):28;
      const object:FloatingObject={id,kind,...(image?{assetId:image.asset.id}:{text:'ここに署名や宛名を入力',style:{...project.baseStyle},writingMode:project.settings.writingMode}),anchorMode:'flow',anchorOffset:selection.start,pageIndex:line.pageIndex,x:Math.max(15,(layout.width-width)/2)-line.x,y:Math.max(20,line.y)-line.y,width,height,rotation:0,opacity:1,wrap:true,paddingMm:3,hideRuling:kind==='image',z:kind==='image'?10:30};
      if(change({...project,objects:[...project.objects,object],assets:image?{...project.assets,[image.asset.id]:image.asset}:project.assets},false)){setSelectedObject(object.id);setPage(line.pageIndex);}
    }catch(e){setError(String(e));}finally{setImageBusy(false);}
  };
  const changeAnchor=(mode:FloatingObject['anchorMode'])=>{
    if(!activeObject)return;
    const line=flowAnchor(project,activeObject,measureText);
    changeObject(activeObject.id,{anchorMode:mode,pageIndex:activeObject.actualPage,x:activeObject.actualX-(mode==='flow'?line.x:0),y:activeObject.actualY-(mode==='flow'?line.y:0)});
  };
  const undo=(redo=false)=>{
    const source=redo?future.current:past.current,target=redo?past.current:future.current;
    const p=source.pop();if(!p)return;target.push(project);editGroup.current=null;setTyping(null);setProject(p);setSelection(s=>({start:Math.min(s.start,bodyText(p).length),end:Math.min(s.end,bodyText(p).length)}));setCaret(v=>v+1);
  };
  const insert=(start:number,end:number,text:string)=>{try{const normalized=text.replace(/\r\n?/g,'\n').replace(/\t/g,'　'),style=typing?.at===start?typing.style:undefined,at=start+normalized.length;const group=normalized.length===1&&!/[\n\f]/.test(normalized)&&start===end?{kind:'typing' as const,cursor:start,nextCursor:at}:normalized===''&&end-start===1?{kind:'deleting' as const,cursor:start,nextCursor:start}:undefined;if(!change(replaceRange(project,start,end,normalized,style),true,group))return;setSelection({start:at,end:at});if(style){setTyping({at,style});if(normalized&&style.fontFamily)fonts.record(style.fontFamily);}}catch(e){setError(String(e));}};
  const format=(style:Partial<TextStyle>)=>{
    const range=readSelection()??selection;
    if(range.start!==range.end){if(change(formatRange(project,range.start,range.end,style))&&style.fontFamily)fonts.record(style.fontFamily);setTyping(null);}
    else if(!bodyText(project)){if(change({...project,baseStyle:{...project.baseStyle,...style}})&&style.fontFamily)fonts.record(style.fontFamily);}
    else {setTyping({at:range.start,style:{...currentStyle,...style}});setCaret(v=>v+1);}
  };
  const setStandardFont=(fontFamily:string)=>{if(change({...project,baseStyle:{...project.baseStyle,fontFamily}}))fonts.record(fontFamily);};
  const applyFont=(scope:'page'|'all')=>{const fontFamily=project.baseStyle.fontFamily;const next=scope==='all'?applyBodyFont(project,fontFamily,{scope:'all'}):applyBodyFont(project,fontFamily,{scope:'page',pageIndex:page,layout});if(change(next)&&fontFamily)fonts.record(fontFamily);};
  useEffect(()=>{const shortcut=(e:KeyboardEvent)=>{if(e.ctrlKey&&e.key.toLowerCase()==='p'){e.preventDefault();if(files.ready&&!files.busy)setDialog('output');}};document.addEventListener('keydown',shortcut);return()=>document.removeEventListener('keydown',shortcut);},[files.ready,files.busy]);
  return <><div key={`shell-${preferences.value.language}`} className="app-shell" inert={files.busy||imageBusy||!files.ready} onKeyDown={e=>{if(e.ctrlKey&&!e.nativeEvent.isComposing){if(e.key.toLowerCase()==='s'){e.preventDefault();void(e.shiftKey?files.saveAs():files.saveNow());}if(e.key.toLowerCase()==='o'){e.preventDefault();void files.open();}}}}>
    <header className="app-header"><div className="brand"><img className="brand-logo-image" src="/brand/letterier-header-logo.png" alt="" aria-hidden="true"/><div><strong>レタリエ</strong><small>想いを、一枚の手紙に。</small></div></div><nav className="header-tools" aria-label="編集操作"><button onClick={()=>setDialog('files')}>ファイル</button><button onClick={()=>setDialog('templates')}>便箋を選ぶ</button><button onClick={()=>void files.run(async()=>{await files.flush();await files.repository.snapshot(project);setDialog('history');})}>保存履歴</button><span className="divider"/><button disabled={!past.current.length} onMouseDown={e=>e.preventDefault()} onClick={()=>undo()}>↶ 元に戻す</button><button disabled={!future.current.length} onMouseDown={e=>e.preventDefault()} onClick={()=>undo(true)}>↷ やり直す</button><span className="divider"/><button onClick={()=>imageInput.current?.click()}>写真・画像</button><button onClick={()=>void addObject('text')}>文字箱</button><button className="settings-button" onClick={()=>setDialog('preferences')}>設定・使い方</button></nav><input ref={imageInput} type="file" accept={imageAccept} hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void addObject('image',file);}}/><span className="save-status" role="status" aria-live="polite">{files.status}</span><button className="primary output-button" onClick={()=>void files.run(async()=>{await files.flush();setDialog('output');})}>PDF・印刷</button></header>
    <div className="workbench">
      <aside className="left-panel"><div className="panel-title">便箋の設定</div><div className="field"><label htmlFor="paper">用紙</label><select id="paper" value={project.settings.paper} onChange={e=>change({...project,settings:{...project.settings,paper:e.target.value as Project['settings']['paper']}},false)}><option value="A4">A4（210 × 297 mm）</option><option value="B5">B5（182 × 257 mm）</option><option value="POSTCARD">はがき（100 × 148 mm）</option></select></div>
        <div className="field"><label htmlFor="orientation">用紙の向き</label><select id="orientation" value={project.settings.orientation} onChange={e=>change({...project,settings:{...project.settings,orientation:e.target.value as 'portrait'|'landscape'}},false)}><option value="portrait">縦向き</option><option value="landscape">横向き</option></select></div>
        <div className="field"><label htmlFor="writing">書字方向</label><select id="writing" value={project.settings.writingMode} onChange={e=>change(changeWritingMode(project,e.target.value as 'horizontal'|'vertical',measureText),false)}><option value="horizontal">横書き</option><option value="vertical">縦書き</option></select></div>
        <div className="panel-title">ページ {Math.min(page+1,layout.pages.length)}</div><p className="help-text">書き進めると、自動で続きのページが生まれます。</p><button className="wide" onMouseDown={e=>e.preventDefault()} onClick={()=>insert(selection.start,selection.end,'\f')}>ここから次のページ</button>
        <button className="wide" onClick={()=>{setPage(Math.min(page,layout.pages.length-1));setDialog('page');}}>複製・移動・削除…</button>
        <button className="wide" onClick={()=>setDialog('visual')}>背景・罫線・余白…</button>
        {project.objects.length>0&&<><div className="panel-title">配置した要素</div><div className="layer-list">{[...layout.objects].sort((a,b)=>b.z-a.z).map(o=><button key={o.id} aria-pressed={selectedObject===o.id} onClick={()=>{setSelectedObject(o.id);setPage(o.actualPage);document.querySelectorAll('.paper-scroll .sheet-frame')[o.actualPage]?.scrollIntoView({block:'start'});}}><small>{o.actualPage+1}ページ ／ {o.anchorMode==='flow'?'追従':'固定'}</small>{o.kind==='image'?project.assets[o.assetId!]?.name:o.text?.slice(0,25)||'文字箱'}</button>)}</div></>}
      </aside>
      <div className="canvas-area"><div className="canvas-bar"><span>{project.settings.paper==='POSTCARD'?'はがき':project.settings.paper} · {project.settings.writingMode==='vertical'?'縦書き':'横書き'}</span><label>表示 <select aria-label="表示倍率" value={zoom} onChange={e=>setZoom(Number(e.target.value))}><option value="0.5">50%</option><option value="0.65">65%</option><option value="0.8">80%</option><option value="1">100%</option><option value="1.25">125%</option></select></label></div>
        <EditorCanvas uiLanguage={preferences.value.language} currentStyle={currentStyle} project={renderProject} layout={layout} zoom={zoom} selection={selection} caretRequest={caret} onSelection={s=>{if(s.start!==selection.start||s.end!==selection.end)setTyping(null);setSelection(s);}} onInsert={insert} onHistory={undo} onFormat={format} onPage={p=>{setPage(p);setSelectedObject(null);}} selectedObject={selectedObject} onSelectObject={id=>{setSelectedObject(id);setPage(layout.objects.find(o=>o.id===id)?.actualPage??0);}} onObjectPreview={(id,patch)=>setObjectPreview(patch?{id,patch}:null)} onObjectChange={changeObject} onObjectDelete={deleteObject}/>
      </div>
      <aside className="right-panel">{activeObject?<ObjectProperties key={activeObject.id} object={activeObject} project={project} pageCount={layout.pages.length} fonts={fonts.fonts} recentFonts={fonts.recent} onChange={patch=>typeof patch.pageIndex==='number'?moveObjectToPage(activeObject.id,patch.pageIndex):changeObject(activeObject.id,patch)} onDelete={()=>deleteObject(activeObject.id)} onDuplicate={()=>{if(project.objects.length>=200){setError('自由配置の要素は200個までです。');return;}const id=uid();change({...project,objects:[...project.objects,{...project.objects.find(o=>o.id===activeObject.id)!,id,x:activeObject.x+5,y:activeObject.y+5}]},false);setSelectedObject(id);}} onMode={changeAnchor} onClose={()=>setSelectedObject(null)}/>:<><div className="panel-title">標準フォント</div><p className="help-text">本文の基本フォントです。書き始める前にも選べ、個別に変更していない文字へ反映されます。</p><div className="field"><label htmlFor="base-font">本文の標準フォント</label><FontSelect id="base-font" value={project.baseStyle.fontFamily} onChange={setStandardFont} fonts={fonts.fonts} recent={fonts.recent}/></div><div className="font-scope-actions"><p>標準フォントに揃える範囲</p><button className="wide" onClick={()=>applyFont('page')}>このページの本文を揃える</button><button className="wide" onClick={()=>applyFont('all')}>すべての本文を揃える</button></div><div className="panel-title">選択した文字</div><p className="help-text">文字を選んだときは、その部分だけ変更できます。選択していないときは次に入力する文字へ反映します。</p><div className="field"><label htmlFor="font">選択部分のフォント</label><FontSelect id="font" value={currentStyle.fontFamily} onChange={fontFamily=>format({fontFamily})} fonts={fonts.fonts} recent={fonts.recent}/></div>
        <div className="field"><label htmlFor="size">文字サイズ（pt）</label><input id="size" type="number" min="6" max="72" value={currentStyle.sizePt} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=72)format({sizePt:n});}}/></div>
        <div className="format-buttons"><button aria-label="太字" aria-pressed={currentStyle.bold} onMouseDown={e=>e.preventDefault()} onClick={()=>format({bold:!currentStyle.bold})}><b>太字</b></button><button aria-label="斜体" aria-pressed={currentStyle.italic} onMouseDown={e=>e.preventDefault()} onClick={()=>format({italic:!currentStyle.italic})}><i>斜体</i></button><button aria-label="下線" aria-pressed={currentStyle.underline} onMouseDown={e=>e.preventDefault()} onClick={()=>format({underline:!currentStyle.underline})}><u>下線</u></button></div>
        <div className="field"><label htmlFor="color">文字の色</label><input id="color" type="color" value={currentStyle.color} onChange={e=>format({color:e.target.value})}/></div>
        <div className="field"><label htmlFor="tcy">縦中横</label><select id="tcy" value={currentStyle.verticalInlineMode} onChange={e=>format({verticalInlineMode:e.target.value as TextStyle['verticalInlineMode']})}><option value="auto">2桁数字を自動で横並び</option><option value="tate-chu-yoko">選んだ文字を横並びに</option><option value="normal">通常の縦配置</option></select></div>
        <label className="check-label"><input type="checkbox" checked={project.settings.orphanControl} onChange={e=>change({...project,settings:{...project.settings,orphanControl:e.target.checked}},false)}/>段落の1行だけを別ページに残さない</label>
        </>}
      </aside>
    </div>
    {(error||fonts.error||missing.length>0||layout.warnings.length>0)&&<div className="warning" role="alert">{error||fonts.error||(missing.length?`このPCにないフォント：${missing.join('、')}。代替フォントで表示・出力します。元のフォント名は保持しています。`:layout.warnings.join(' '))}{error&&<button onClick={()=>setError('')}>閉じる</button>}</div>}
    <footer className="statusbar"><span>{bodyText(project).replace(/[\n\f]/g,'').length}文字</span><div className="page-tabs">{layout.pages.map((_,i)=><button key={i} aria-current={page===i?'page':undefined} onClick={()=>{setPage(i);document.querySelectorAll('.sheet-frame')[i]?.scrollIntoView({block:'start',behavior:'smooth'});}}>{i+1}</button>)}<button aria-label="末尾にページを追加" onClick={()=>change(applyPageOperation(project,layout,{type:'add',index:layout.pages.length-1},measureText),false)}>＋</button></div><span>{layout.pages.length}ページ · 100%表示は画面により実寸と異なります</span></footer>
  </div>
  {frames.dialog}
  {imageBusy&&!frames.dialog&&<div className="busy-overlay" role="status">素材を読み込んでいます…</div>}
  {dialog==='files'&&<Modal title="ファイル" onClose={()=>setDialog(null)}><label className="field">手紙の名前<input aria-label="手紙の名前" value={project.title} maxLength={200} onChange={e=>setProject({...project,title:e.target.value})} onBlur={()=>{if(!project.title.trim())setProject({...project,title:'新しい手紙'});}}/><span className="help-text">保存ファイルと「最近使った手紙」に表示する名前です。</span></label><div className="file-actions"><button onClick={()=>{setDialog(null);void files.open();}}>ファイルを開く…<small>.binsen または履歴付きバックアップ</small></button><button onClick={()=>void files.run(async()=>{setRecent(await files.session.recent());setDialog('recent');})}>最近使った手紙</button><button onClick={()=>{setDialog(null);void files.saveNow();}}>今すぐ保存<small>Ctrl + S</small></button><button onClick={()=>{setDialog(null);void files.saveAs();}}>名前を付けて保存…<small>Ctrl + Shift + S ／ 現在の状態だけを保存</small></button><button onClick={()=>{setDialog(null);void files.backup();}}>履歴付きバックアップを書き出す…<small>過去の履歴と保護版を一緒に持ち運ぶ</small></button></div><p className="help-text">名前を付けて保存する前も、このPCに回復用データを自動保存します。最近使った手紙からの再開は回復用データを開きます。元ファイルへ保存を続けるには「ファイルを開く」でそのファイルを選んでください。</p></Modal>}
  {dialog==='recent'&&<Modal title="最近使った手紙" onClose={()=>setDialog(null)}><div className="recent-list">{recent.length===0&&<p>まだ手紙がありません。</p>}{recent.map(d=><button key={d.id} onClick={()=>{setDialog(null);void files.openRecent(d.id);}}><strong>{d.title||'名前のない手紙'}</strong><small>{new Date(d.time).toLocaleString(preferences.value.language==='ja'?'ja-JP':'en-US')}</small></button>)}</div></Modal>}
  {dialog==='history'&&<HistoryDialog project={project} repository={files.repository} onClose={()=>setDialog(null)} onRestore={files.restore}/>}
  {dialog==='page'&&<PageOperationDialog project={project} layout={layout} index={Math.min(page,layout.pages.length-1)} onClose={()=>setDialog(null)} onApply={operation=>{try{change(applyPageOperation(project,layout,operation,measureText),false);setDialog(null);setPage(0);setSelectedObject(null);setSelection({start:0,end:0});}catch(e){setError(String(e));}}}/>}
  {dialog==='visual'&&<PageVisualDialog project={project} layout={layout} index={Math.min(page,layout.pages.length-1)} onClose={()=>setDialog(null)} onApply={p=>change(p,false)}/>}
  {dialog==='templates'&&<TemplateDialog project={project} language={preferences.value.language} onClose={()=>setDialog(null)} onNew={files.createFrom} onApply={p=>change(p,false)}/>}
  {dialog==='output'&&<OutputDialog project={project} missing={missing} onClose={()=>setDialog(null)}/>}
  {dialog==='preferences'&&<PreferencesDialog key={`preferences-${preferences.value.language}`} preferences={preferences} onClose={()=>setDialog(null)}/>}
  {!files.ready&&<Modal title={files.bootError?'前回の手紙を確認してください':'手紙を準備しています'}>{files.bootError?<><p role="alert">{files.bootError}</p><p>元のデータは保持しています。保存済みのファイルを開くか、新しい手紙で始められます。</p><div className="dialog-actions"><button onClick={()=>void files.open()}>ファイルを開く…</button><button onClick={()=>void files.create()}>新しい手紙で始める</button></div></>:<p>PC内の回復用データを確認しています。</p>}</Modal>}
  {files.busy&&<div className="busy-overlay" role="status">保存データを処理しています…</div>}
  </>;
}
