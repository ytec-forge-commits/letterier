import { useEffect, useMemo, useRef, useState } from 'react';
import { bodyText, sliceRuns, pruneAssets, newProject, replaceRange, formatRange, styleAt, uid, type Project, type TextStyle, type FloatingObject } from '../core/model';
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
import {useFonts,missingFonts} from './FontSelect';
import {OutputDialog} from './OutputDialog';
import {EditorRibbon} from './EditorRibbon';
import {BodyFormatDialog} from './BodyFormatDialog';
import {transferText} from '../core/text-transfer';
import {hasMixedFontSize} from '../core/text-format';
import {PageArtwork} from './Paper';
import {useDomLocalization} from '../i18n';
import './app.css';
import './ribbon.css';

export function App() {
  const [project,setProject]=useState(newProject);
  const currentProject=useRef(project);currentProject.current=project;
  const [thumbnails,setThumbnails]=useState(true);
  const initialDocument=useRef(project.id),startupShown=useRef(false);
  const [pickerPurpose,setPickerPurpose]=useState<'new'|'change'>('new');
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
  const [dialog,setDialog]=useState<'files'|'history'|'recent'|'page'|'visual'|'templates'|'preferences'|'output'|'bulk'|null>(null),[recent,setRecent]=useState<RecentDocument[]>([]);
  const files=useDocumentFiles(project,p=>{compose(p,measureText);past.current=[];future.current=[];setTyping(null);setSelectedObject(null);setProject(p);setPage(0);setSelection({start:0,end:0});setCaret(v=>v+1);setDialog(null);},setError,imageBusy||dialog!==null,()=>{
    // Only dismiss the initial blank-document chooser; never interrupt an editing dialog.
    if(startupShown.current&&project.id===initialDocument.current&&!bodyText(project)&&!project.objects.length&&dialog==='templates'&&pickerPurpose==='new')setDialog(null);
  });
  useEffect(()=>{if(files.ready&&files.startupComplete&&!files.busy&&!startupShown.current){startupShown.current=true;if(project.id===initialDocument.current&&!bodyText(project)){setPickerPurpose('new');setDialog('templates');}}},[files.ready,files.startupComplete,files.busy,project]);
  const renderProject=useMemo(()=>objectPreview?{...project,objects:project.objects.map(o=>o.id===objectPreview.id?{...o,...objectPreview.patch}:o)}:project,[project,objectPreview]);
  const layout=useMemo(()=>compose(renderProject,measureText),[renderProject]);
  const activeObject=layout.objects.find(o=>o.id===selectedObject);
  const currentStyle={...project.baseStyle,...styleAt(project,selection.start===selection.end?Math.max(0,selection.start-1):selection.start),...(typing?.at===selection.start?typing.style:{})};
  const mixedSize=useMemo(()=>hasMixedFontSize(project,selection.start,selection.end),[project,selection.start,selection.end]);
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
  const transfer=(start:number,end:number,target:number,copy:boolean)=>{
    try{const result=transferText(project,start,end,target,copy);if(result.project===project)return;if(change(result.project)){setTyping(null);setSelection({start:result.start,end:result.end});}}
    catch(e){setError(e instanceof Error?e.message:String(e));}
  };
  const setStandardSize=(sizePt:number)=>{change({...project,baseStyle:{...project.baseStyle,sizePt}});};
  const setStandardFont=(fontFamily:string)=>{if(change({...project,baseStyle:{...project.baseStyle,fontFamily}}))fonts.record(fontFamily);};
  const clipboard=async(action:'cut'|'copy'|'paste')=>{
    const range=readSelection()??selection;
    try{
      if(action==='paste'){const text=await navigator.clipboard.readText();if(currentProject.current===project)insert(range.start,range.end,text);}
      else if(range.start!==range.end){if(document.execCommand(action))return;await navigator.clipboard.writeText(bodyText(project).slice(range.start,range.end));if(action==='cut'&&currentProject.current===project)insert(range.start,range.end,'');}
    }catch{setError('クリップボードを利用できません。本文を選んでCtrl+C・Ctrl+X・Ctrl+Vを使用してください。');}
  };
  useEffect(()=>{const shortcut=(e:KeyboardEvent)=>{if(e.ctrlKey&&e.key.toLowerCase()==='p'){e.preventDefault();if(files.ready&&!files.busy)setDialog('output');}};document.addEventListener('keydown',shortcut);return()=>document.removeEventListener('keydown',shortcut);},[files.ready,files.busy]);
  return <><div key={`shell-${preferences.value.language}`} className="app-shell editor-shell" inert={files.busy||imageBusy||!files.ready} onKeyDown={e=>{if(e.ctrlKey&&!e.nativeEvent.isComposing){if(e.key.toLowerCase()==='s'){e.preventDefault();void(e.shiftKey?files.saveAs():files.saveNow());}if(e.key.toLowerCase()==='o'){e.preventDefault();void files.open();}}}}>
    <EditorRibbon project={project} style={currentStyle} mixedSize={mixedSize} mixedSpacing={selection.start!==selection.end&&new Set(sliceRuns(project.body.runs,selection.start,selection.end).map(r=>r.style.letterSpacingPt??project.baseStyle.letterSpacingPt??0)).size>1} fonts={fonts.fonts} recent={fonts.recent} status={files.status} canUndo={!!past.current.length} canRedo={!!future.current.length} hasSelection={selection.start!==selection.end} context={activeObject?(activeObject.kind==='image'?'図の形式':'文字箱の形式'):null} zoom={zoom} thumbnails={thumbnails} onFormat={format} onStandardFont={setStandardFont} onStandardSize={setStandardSize} onSettings={patch=>change(patch.writingMode?changeWritingMode(project,patch.writingMode,measureText):{...project,settings:{...project.settings,...patch}},false)} onZoom={setZoom} onThumbnails={setThumbnails} onUndo={undo} onClipboard={action=>void clipboard(action)} onAction={action=>{
      if(action==='save')void files.saveNow();else if(action==='saveAs')void files.saveAs();else if(action==='open')void files.open();
      else if(action==='recent')void files.run(async()=>{setRecent(await files.session.recent());setDialog('recent');});
      else if(action==='new'||action==='stationery'){setPickerPurpose(action==='new'?'new':'change');setDialog('templates');}else if(action==='image')imageInput.current?.click();else if(action==='text')void addObject('text');else if(action==='break')insert(selection.start,selection.end,'\f');
      else if(action==='history')void files.run(async()=>{await files.flush();await files.repository.snapshot(project);setDialog('history');});else setDialog(action);
    }}/>
    <input ref={imageInput} type="file" accept={imageAccept} hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void addObject('image',file);}}/>
    {files.recovery&&<aside className="recovery-notice"><span>前回の回復用データを保持しています。</span><button onClick={()=>{setDialog(null);void files.recover();}}>前回の回復用データを開く</button></aside>}
    <div className={`workbench ${thumbnails?'with-thumbnails':''} ${activeObject?'with-properties':''}`}>
      {thumbnails&&<nav className="page-thumbnails" aria-label="ページ一覧">{layout.pages.map((_,i)=>{const scale=96/(layout.width*96/25.4);return <button key={i} aria-label={`${i+1}ページへ移動`} aria-current={page===i?'page':undefined} onClick={()=>{setPage(i);scrollToPage(i);}}><span className="thumbnail-paper" aria-hidden="true" style={{width:96,height:layout.height*96/25.4*scale}}><span className="paper" style={{display:'block',width:`${layout.width}mm`,height:`${layout.height}mm`,transform:`scale(${scale})`}}><PageArtwork project={project} layout={layout} index={i}/><svg className="thumbnail-body" width="100%" height="100%" viewBox={`0 0 ${layout.width} ${layout.height}`}><g stroke="#57655b" strokeWidth=".8">{layout.pages[i].lines.filter(l=>l.tokens.length).map((line,n)=><line key={n} x1={line.x} y1={line.y+line.spacing*.5} x2={project.settings.writingMode==='vertical'?line.x:line.x+Math.min(line.extent,line.tokens.length*2)} y2={project.settings.writingMode==='vertical'?line.y+Math.min(line.extent,line.tokens.length*2):line.y+line.spacing*.5}/>)}</g></svg></span></span><span>{i+1}</span></button>;})}</nav>}
      <div className="canvas-area">
        <EditorCanvas uiLanguage={preferences.value.language} currentStyle={currentStyle} project={renderProject} layout={layout} zoom={zoom} selection={selection} caretRequest={caret} onSelection={s=>{if(s.start!==selection.start||s.end!==selection.end)setTyping(null);setSelection(s);}} onInsert={insert} onTransfer={transfer} onHistory={undo} onFormat={format} onPage={p=>{setPage(p);setSelectedObject(null);}} selectedObject={selectedObject} onSelectObject={id=>{setSelectedObject(id);setPage(layout.objects.find(o=>o.id===id)?.actualPage??0);}} onObjectPreview={(id,patch)=>setObjectPreview(patch?{id,patch}:null)} onObjectChange={changeObject} onObjectDelete={deleteObject}/>
      </div>
      {activeObject&&<aside className="right-panel"><ObjectProperties key={activeObject.id} object={activeObject} project={project} pageCount={layout.pages.length} fonts={fonts.fonts} recentFonts={fonts.recent} onChange={patch=>typeof patch.pageIndex==='number'?moveObjectToPage(activeObject.id,patch.pageIndex):changeObject(activeObject.id,patch)} onDelete={()=>deleteObject(activeObject.id)} onDuplicate={()=>{if(project.objects.length>=200){setError('自由配置の要素は200個までです。');return;}const id=uid();change({...project,objects:[...project.objects,{...project.objects.find(o=>o.id===activeObject.id)!,id,x:activeObject.x+5,y:activeObject.y+5}]},false);setSelectedObject(id);}} onMode={changeAnchor} onClose={()=>setSelectedObject(null)}/></aside>}
    </div>
    {(error||files.autosaveError||fonts.error||missing.length>0||layout.warnings.length>0)&&<div className="warning" role="alert">{error||files.autosaveError||fonts.error||(missing.length?`このPCにないフォント：${missing.join('、')}。代替フォントで表示・出力します。元のフォント名は保持しています。`:layout.warnings.join(' '))}{(error||files.autosaveError)&&<button onClick={()=>error?setError(''):files.dismissAutosaveError()}>閉じる</button>}</div>}
    <footer className="statusbar"><span>{bodyText(project).replace(/[\n\f]/g,'').length}文字</span><div className="page-tabs">{layout.pages.map((_,i)=><button key={i} aria-current={page===i?'page':undefined} onClick={()=>{setPage(i);document.querySelectorAll('.sheet-frame')[i]?.scrollIntoView({block:'start',behavior:'smooth'});}}>{i+1}</button>)}<button aria-label="末尾にページを追加" onClick={()=>change(applyPageOperation(project,layout,{type:'add',index:layout.pages.length-1},measureText),false)}>＋</button></div><div className="status-zoom"><span className="status-zoom-note" title="100%表示は画面により実寸と異なります">{layout.pages.length}ページ</span><button aria-label="表示を縮小" onClick={()=>setZoom(v=>Math.max(.5,Math.round((v-.05)*100)/100))} disabled={zoom<=.5}>−</button><input type="range" aria-label="表示倍率スライダー" min={50} max={125} step={5} value={Math.round(zoom*100)} onChange={e=>setZoom(Number(e.target.value)/100)}/><button aria-label="表示を拡大" onClick={()=>setZoom(v=>Math.min(1.25,Math.round((v+.05)*100)/100))} disabled={zoom>=1.25}>＋</button><button className="zoom-reset" aria-label="表示倍率を100%に戻す" onClick={()=>setZoom(1)}>{Math.round(zoom*100)}%</button></div></footer>
  </div>
  {frames.dialog}
  {imageBusy&&!frames.dialog&&<div className="busy-overlay" role="status">素材を読み込んでいます…</div>}
  {dialog==='files'&&<Modal title="ファイル" onClose={()=>setDialog(null)}><label className="field">手紙の名前<input aria-label="手紙の名前" value={project.title} maxLength={200} onChange={e=>setProject({...project,title:e.target.value})} onBlur={()=>{if(!project.title.trim())setProject({...project,title:'新しい手紙'});}}/><span className="help-text">保存ファイルと「最近使った手紙」に表示する名前です。</span></label><div className="file-actions"><button onClick={()=>{setDialog(null);void files.open();}}>ファイルを開く…<small>.binsen または履歴付きバックアップ</small></button><button onClick={()=>void files.run(async()=>{setRecent(await files.session.recent());setDialog('recent');})}>最近使った手紙</button><button onClick={()=>{setDialog(null);void files.saveNow();}}>今すぐ保存<small>Ctrl + S</small></button><button onClick={()=>{setDialog(null);void files.saveAs();}}>名前を付けて保存…<small>Ctrl + Shift + S ／ 現在の状態だけを保存</small></button><button onClick={()=>{setDialog(null);void files.backup();}}>履歴付きバックアップを書き出す…<small>過去の履歴と保護版を一緒に持ち運ぶ</small></button></div><p className="help-text">名前を付けて保存する前も、このPCに回復用データを自動保存します。最近使った手紙からの再開は回復用データを開きます。元ファイルへ保存を続けるには「ファイルを開く」でそのファイルを選んでください。</p></Modal>}
  {dialog==='recent'&&<Modal title="最近使った手紙" onClose={()=>setDialog(null)}><div className="recent-list">{recent.length===0&&<p>まだ手紙がありません。</p>}{recent.map(d=><button key={d.id} onClick={()=>{setDialog(null);void files.openRecent(d.id);}}><strong>{d.title||'名前のない手紙'}</strong><small>{new Date(d.time).toLocaleString(preferences.value.language==='ja'?'ja-JP':'en-US')}</small></button>)}</div></Modal>}
  {dialog==='history'&&<HistoryDialog project={project} repository={files.repository} onClose={()=>setDialog(null)} onRestore={files.restore}/>}
  {dialog==='page'&&<PageOperationDialog project={project} layout={layout} index={Math.min(page,layout.pages.length-1)} onClose={()=>setDialog(null)} onApply={operation=>{try{change(applyPageOperation(project,layout,operation,measureText),false);setDialog(null);setPage(0);setSelectedObject(null);setSelection({start:0,end:0});}catch(e){setError(String(e));}}}/>}
  {dialog==='visual'&&<PageVisualDialog project={project} layout={layout} index={Math.min(page,layout.pages.length-1)} onClose={()=>setDialog(null)} onApply={p=>change(p,false)}/>}
  {dialog==='templates'&&<TemplateDialog project={project} language={preferences.value.language} purpose={pickerPurpose} index={Math.min(page,layout.pages.length-1)} pageCount={layout.pages.length} onClose={()=>setDialog(null)} onNew={files.createFrom} onApply={p=>change(p,false)} onOpen={()=>{setDialog(null);void files.open();}} onRecent={()=>void files.run(async()=>{setRecent(await files.session.recent());setDialog('recent');})} onRecover={files.recovery?()=>{setDialog(null);void files.recover();}:undefined}/>}
  {dialog==='output'&&<OutputDialog project={project} missing={missing} onClose={()=>setDialog(null)}/>}
  {dialog==='bulk'&&<BodyFormatDialog project={project} layout={layout} index={Math.min(page,layout.pages.length-1)} fonts={fonts.fonts} recent={fonts.recent} onClose={()=>setDialog(null)} onApply={p=>{const ok=change(p,false);if(ok)fonts.record(p.baseStyle.fontFamily);return ok;}}/>}
  {dialog==='preferences'&&<PreferencesDialog key={`preferences-${preferences.value.language}`} preferences={preferences} onClose={()=>setDialog(null)}/>}
  {!files.ready&&<Modal title={files.bootError?'前回の手紙を確認してください':'手紙を準備しています'}>{files.bootError?<><p role="alert">{files.bootError}</p><p>元のデータは保持しています。保存済みのファイルを開くか、新しい手紙で始められます。</p><div className="dialog-actions"><button onClick={()=>void files.open()}>ファイルを開く…</button><button onClick={()=>void files.create()}>新しい手紙で始める</button></div></>:<p>PC内の回復用データを確認しています。</p>}</Modal>}
  {files.leavePrompt!==null&&<Modal title="変更を保存しますか？" onClose={()=>files.answerLeave('cancel')}><p>「{files.leavePrompt}」には、ファイルへ保存していない変更があります。</p><p className="help-text">回復用データの自動保存は、元のファイルへの保存とは別です。</p><div className="dialog-actions"><button onClick={()=>files.answerLeave('cancel')}>キャンセル</button><button onClick={()=>files.answerLeave('discard')}>保存しない</button><button className="primary" onClick={()=>files.answerLeave('save')}>保存する</button></div></Modal>}
  {files.busy&&files.leavePrompt===null&&<div className="busy-overlay" role="status">保存データを処理しています…</div>}
  </>;
}
