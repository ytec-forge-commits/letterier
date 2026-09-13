import {useEffect,useMemo,useState} from 'react';
import {createPortal} from 'react-dom';
import {invoke,isTauri} from '@tauri-apps/api/core';
import {cloneProject,type Project} from '../core/model';
import {compose} from '../core/compose';
import {parsePageRange,fitToPrintable} from '../core/output';
import {ReadonlyPage} from './ReadonlyPages';
import {measureText} from './typography';
import {Modal} from './Modal';
interface PrinterArea {printer:string;width:number;height:number;left:number;top:number;printableWidth:number;printableHeight:number}
export function OutputDialog({project,missing,onClose}:{project:Project;missing:string[];onClose:()=>void}){
 const [frozen]=useState(()=>cloneProject(project)),layout=useMemo(()=>compose(frozen,measureText),[frozen]);
 const [range,setRange]=useState(''),[printer,setPrinter]=useState(''),[printers,setPrinters]=useState<string[]>([]),[area,setArea]=useState<PrinterArea|null>(null),[sizing,setSizing]=useState<'actual'|'fit'>('fit');
 const [previewKind,setPreviewKind]=useState<'print'|'pdf'>(isTauri()?'print':'pdf');
 const [copies,setCopies]=useState(1),[busy,setBusy]=useState(false),[checking,setChecking]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[zoom,setZoom]=useState(.43),[printing,setPrinting]=useState(false);
 useEffect(()=>{if(!isTauri())return;let alive=true;void invoke<{names:string[];default:string|null}>('list_printers').then(v=>{if(alive){setPrinters(v.names);setPrinter(v.default??v.names[0]??'');}}).catch(()=>{if(alive)setError('プリンター一覧を取得できません。Windowsの接続設定を確認してください。PDF出力は利用できます。');});return()=>{alive=false;};},[]);
 useEffect(()=>{setArea(null);if(!printer)return;let alive=true;setChecking(true);setError('');void invoke<PrinterArea>('printer_area',{printer,paper:frozen.settings.paper,landscape:frozen.settings.orientation==='landscape'}).then(v=>{if(alive)setArea(v);}).catch(e=>{if(alive)setError(String(e));}).finally(()=>{if(alive)setChecking(false);});return()=>{alive=false;};},[printer,frozen]);
 let pages:number[]=[],rangeError='';try{pages=parsePageRange(range,layout.pages.length);}catch(e){rangeError=e instanceof Error?e.message:String(e);}
 const actualTransform={scale:1,left:0,top:0};
 const printTransform=sizing==='fit'&&area?fitToPrintable(layout.width,layout.height,{left:area.left,top:area.top,width:area.printableWidth,height:area.printableHeight}):actualTransform;
 const transform=printing?printTransform:actualTransform;
 const run=async(kind:'pdf'|'print')=>{
  setBusy(true);setError('');setMessage('');setPrinting(kind==='print');
  try{
   await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
   await document.fonts.ready;
   for(const img of document.querySelectorAll<HTMLImageElement>('.print-output img')){await img.decode();}
   const clipped=Array.from(document.querySelectorAll<HTMLElement>('.print-output .floating-text')).some(el=>el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1);if(clipped)throw Error('文字箱の本文が枠からはみ出しています。文字箱の幅・高さを広げるか、文字を小さくしてから出力してください。');
   if(!isTauri()){window.print();setMessage('ブラウザの印刷画面を開きました。倍率100%・余白なし・ヘッダーとフッターなしで確認してください。');}
   else if(kind==='pdf'){const path=await invoke<string|null>('export_pdf',{width:layout.width,height:layout.height});if(path)setMessage('PDFを保存しました。');}
   else {if(!area)throw Error('先にプリンターの印刷可能範囲を確認してください。');await invoke('print_document',{printer,paper:frozen.settings.paper,landscape:frozen.settings.orientation==='landscape',copies,expected:area});setMessage('プリンターへ送信しました。用紙の出力結果をご確認ください。');}
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 const hasUnprintable=area&&(area.left>.1||area.top>.1||area.printableWidth<layout.width-.2||area.printableHeight<layout.height-.2);
 const pageSurface=(i:number,preview=false)=>{
  const placement=preview?(previewKind==='print'?printTransform:actualTransform):transform;
  const previewArea=preview&&previewKind==='print'?area:null;
  const clip=previewArea?`inset(${previewArea.top}mm ${Math.max(0,layout.width-previewArea.left-previewArea.printableWidth)}mm ${Math.max(0,layout.height-previewArea.top-previewArea.printableHeight)}mm ${previewArea.left}mm)`:'none';
  return <div className={preview?'output-preview-frame':'print-sheet'} key={i} style={preview?{width:layout.width*96/25.4*zoom,height:layout.height*96/25.4*zoom}:{width:`${layout.width}mm`,height:`${layout.height}mm`}}>
   <div className={preview?'paper':'print-canvas'} style={{width:`${layout.width}mm`,height:`${layout.height}mm`,position:'relative',transform:preview?`scale(${zoom})`:undefined,transformOrigin:'top left',overflow:'hidden',background:'white'}}>
    <div style={{position:'absolute',inset:0,clipPath:clip}}>
     <div className="print-transform" style={{width:`${layout.width}mm`,height:`${layout.height}mm`,position:'relative',transform:`translate(${placement.left}mm,${placement.top}mm) scale(${placement.scale})`,transformOrigin:'top left',overflow:'hidden'}}><ReadonlyPage project={frozen} layout={layout} index={i}/></div>
    </div>
    {previewArea&&<div className="printable-area-guide" aria-hidden="true" style={{left:`${previewArea.left}mm`,top:`${previewArea.top}mm`,width:`${previewArea.printableWidth}mm`,height:`${previewArea.printableHeight}mm`}}/>}
   </div>{preview&&<small>{i+1}ページ</small>}
  </div>;
 };
 return <><Modal title="PDF・印刷の確認" wide onClose={busy?undefined:onClose}><div className="output-layout"><div className="output-settings"><strong>{frozen.settings.paper==='POSTCARD'?'はがき':frozen.settings.paper} ／ {layout.width} × {layout.height} mm</strong><p className="help-text">この画面を開いた時点の紙面を出力します。続きのページも含めて確認してください。</p><label className="field">出力するページ<input aria-label="出力するページ" placeholder="すべて（例：1-3,5）" value={range} disabled={busy} onChange={e=>setRange(e.target.value)}/></label>{rangeError&&<p role="alert" className="warning">{rangeError}</p>}<button className="primary wide" disabled={busy||!!rangeError} onClick={()=>void run('pdf')}>PDFとして保存…</button><p className="help-text">文字・罫線・飾りは高品質で出力します。PDFは用紙の実寸です。</p><hr/><label className="field">プリンター<select aria-label="プリンター" value={printer} disabled={busy||!printers.length} onChange={e=>setPrinter(e.target.value)}>{!printers.length&&<option>{isTauri()?'プリンターがありません':'Windowsアプリで選択できます'}</option>}{printers.map(p=><option key={p}>{p}</option>)}</select></label><label className="field">部数<input type="number" min={1} max={99} value={copies} disabled={busy} onChange={e=>setCopies(Number(e.target.value))}/></label>{checking&&<p role="status">印刷可能範囲を確認しています…</p>}{area&&<p className="help-text">印刷可能範囲：{area.printableWidth.toFixed(1)} × {area.printableHeight.toFixed(1)} mm<br/>左 {area.left.toFixed(1)} mm ／ 上 {area.top.toFixed(1)} mm</p>}{hasUnprintable&&sizing==='actual'&&<p className="warning">上端 {area.top.toFixed(1)} mm など、用紙の端には印刷できない部分があります。実寸ではその範囲の背景・飾りが切れます。紙面全体を残すには「縮小」を選んでください。</p>}<label className="check-label"><input type="radio" name="print-sizing" checked={sizing==='actual'} onChange={()=>setSizing('actual')} disabled={busy}/>実寸で印刷（100%）</label><label className="check-label"><input type="radio" name="print-sizing" checked={sizing==='fit'} onChange={()=>setSizing('fit')} disabled={busy}/>紙面全体を印刷可能範囲へ縮小</label>{area&&sizing==='fit'&&<p className="help-text">印刷倍率：{(fitToPrintable(layout.width,layout.height,{left:area.left,top:area.top,width:area.printableWidth,height:area.printableHeight}).scale*100).toFixed(1)}%（PDFは100%）</p>}<button className="wide" disabled={busy||checking||!area||!!rangeError||!Number.isInteger(copies)||copies<1||copies>99} onClick={()=>void run('print')}>この設定で印刷する</button><p className="help-text">縮小では文字・画像・罫線を同じ倍率で縮小し、改ページは変えません。</p></div><div className="output-preview"><label className="preview-zoom">表示内容<select aria-label="プレビューの内容" value={previewKind} onChange={e=>setPreviewKind(e.target.value as 'print'|'pdf')}><option value="print">印刷（選択した設定）</option><option value="pdf">PDF（実寸）</option></select></label><label className="preview-zoom">プレビュー倍率<select value={zoom} onChange={e=>setZoom(Number(e.target.value))}><option value={.32}>32%</option><option value={.43}>43%</option><option value={.65}>65%</option><option value={1}>100%</option></select></label><p className="help-text">{previewKind==='print'?(area?'点線の内側が印刷できる範囲です。外側の白い部分と点線は印刷されません。':'プリンターを選ぶと、印刷できる範囲と余白を表示します。'):'PDFは用紙の実寸です。プリンター用の縮小は反映しません。'}</p><div className="output-pages">{pages.map(i=>pageSurface(i,true))}</div></div></div>{missing.length>0&&<p className="warning">このPCにないフォントは代替フォントで出力されます：{missing.join('、')}</p>}{layout.warnings.length>0&&<p className="warning">{layout.warnings.join(' ')}</p>}{error&&<p className="warning" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}{busy&&<p role="status">{printing?'プリンターへ送信しています…':'PDFを作成しています…'}</p>}</Modal>{createPortal(<div className="print-output" aria-hidden="true"><style>{`@page { size: ${layout.width}mm ${layout.height}mm; margin: 0; }`}</style>{pages.map(i=>pageSurface(i))}</div>,document.body)}</>;
}
