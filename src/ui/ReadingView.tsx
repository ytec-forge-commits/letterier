import {useLayoutEffect,useRef,useState} from 'react';
import type {Project} from '../core/model';
import type {Layout} from '../core/compose';
import {ReadonlyPage} from './ReadonlyPages';

// Reuse the output renderer so reading has no editable DOM or input connection.
export function ReadingView({project,layout,initialZoom,initialPage,onClose,onOutput}:{project:Project;layout:Layout;initialZoom:number;initialPage:number;onClose:()=>void;onOutput:()=>void}){
 const scroll=useRef<HTMLDivElement>(null),exit=useRef<HTMLButtonElement>(null);
 const [page,setPage]=useState(Math.min(initialPage,layout.pages.length-1));
 const currentPage=useRef(page);currentPage.current=page;
 const [manualZoom,setManualZoom]=useState(initialZoom),[mode,setMode]=useState<'manual'|'page'|'width'>('manual');
 const [size,setSize]=useState({width:0,height:0});
 const width=layout.width*96/25.4,height=layout.height*96/25.4;
 const fit=Math.min((size.width-48)/width,mode==='page'?(size.height-40)/height:2);
 const zoom=mode==='manual'||!size.width?manualZoom:Math.max(.1,Math.min(2,Math.floor(fit*100)/100));
 const move=(index:number)=>{
  const target=Math.max(0,Math.min(layout.pages.length-1,index));currentPage.current=target;setPage(target);
  const el=scroll.current,frame=el?.querySelectorAll<HTMLElement>('.sheet-frame')[target];
  if(el&&frame)el.scrollTop=frame.offsetTop-20;
 };
 useLayoutEffect(()=>{const el=scroll.current;if(!el)return;const observer=new ResizeObserver(()=>setSize({width:el.clientWidth,height:el.clientHeight}));observer.observe(el);exit.current?.focus({preventScroll:true});return()=>observer.disconnect();},[]);
 useLayoutEffect(()=>move(currentPage.current),[zoom]);
 const updatePage=()=>{
  const el=scroll.current;if(!el)return;const top=el.getBoundingClientRect().top;
  const frames=Array.from(el.querySelectorAll<HTMLElement>('.sheet-frame'));
  const index=frames.findIndex(frame=>frame.getBoundingClientRect().bottom>top+24);
  if(index>=0){currentPage.current=index;setPage(index);}
 };
 const changeZoom=(next:number)=>{setManualZoom(Math.max(.25,Math.min(2,Math.round(next*100)/100)));setMode('manual');};
 return <section className="reading-view" aria-label="読み返し表示">
  <header className="reading-header"><strong className="reading-title" translate="no" title={project.title}>{project.title}</strong><span className="reading-note">読み返し中（編集できません）</span><button onClick={onOutput}>PDF・印刷</button><button ref={exit} className="primary" onClick={onClose} title="編集に戻る（Esc）">編集に戻る</button></header>
  <div ref={scroll} className="paper-scroll reading-scroll" role="region" aria-label="手紙を読み返す" tabIndex={0} onScroll={updatePage} onKeyDown={e=>{
   if(e.ctrlKey||e.altKey||e.metaKey||e.shiftKey)return;
   if(e.key==='PageDown'||e.key==='PageUp'){e.preventDefault();move(page+(e.key==='PageDown'?1:-1));}
   if(e.key==='Home'||e.key==='End'){e.preventDefault();move(e.key==='Home'?0:layout.pages.length-1);}
  }}>
   {layout.pages.map((_,i)=><section key={i} className="sheet-frame" aria-label={`${i+1}ページ`} style={{width:width*zoom,height:height*zoom}}><div className="paper" style={{width:`${layout.width}mm`,height:`${layout.height}mm`,transform:`scale(${zoom})`}}><ReadonlyPage project={project} layout={layout} index={i}/></div><span className="page-caption">{i+1}</span></section>)}
  </div>
  <footer className="reading-footer"><nav aria-label="読み返すページ"><button aria-label="前のページ" disabled={page===0} onClick={()=>move(page-1)}>‹</button><label><span className="sr-only">読むページ</span><select aria-label="読むページ" value={page} onChange={e=>move(Number(e.target.value))}>{layout.pages.map((_,i)=><option key={i} value={i}>{i+1} / {layout.pages.length}</option>)}</select></label><button aria-label="次のページ" disabled={page===layout.pages.length-1} onClick={()=>move(page+1)}>›</button></nav><div className="reading-zoom"><select aria-label="読み返しの表示方法" value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option value="manual">{Math.round(zoom*100)}%</option><option value="width">幅に合わせる</option><option value="page">ページ全体</option></select><button aria-label="読み返しを縮小" disabled={zoom<=.25} onClick={()=>changeZoom(zoom-.05)}>−</button><button aria-label="読み返しを拡大" disabled={zoom>=2} onClick={()=>changeZoom(zoom+.05)}>＋</button></div></footer>
 </section>;
}
