import { memo,useMemo,useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import {flushSync} from 'react-dom';
import { bodyText, type Project, type TextStyle, type FloatingObject } from '../core/model';
import { graphemes } from '../core/layout';
import { type Layout,type LayoutPage } from '../core/compose';
import { LineContent, PageArtwork } from './Paper';
import { ObjectLayer } from './ObjectLayer';
import {moveBlockCaret,moveInlineCaret,pickCaretCandidate,wordDeletionRange} from '../core/caret';
import type {HistoryHighlight} from '../core/history-highlight';
import {textCss} from './typography';
import {bindEditContext,type EditContextBinding} from './edit-context';
import {nativeImeAvailable,prepareNativeIme} from './native-ime';

export interface TextSelection { start:number; end:number }
interface Props { uiLanguage:'ja'|'en';currentStyle:TextStyle;project:Project;layout:Layout;zoom:number;selection:TextSelection;caretRequest:number;onSelection:(value:TextSelection)=>void;onInsert:(start:number,end:number,text:string)=>void;onHistory:(redo:boolean)=>void;onFormat:(style:Partial<TextStyle>)=>void;onPage:(page:number)=>void;selectedObject?:string|null;onSelectObject?:(id:string)=>void;onObjectPreview?:(id:string,patch:Partial<FloatingObject>|null)=>void;onObjectChange?:(id:string,patch:Partial<FloatingObject>)=>void;onObjectDelete?:(id:string)=>void }
interface Props {onCompositionChange?:(active:boolean)=>void}
interface Props {onTransfer?:(start:number,end:number,target:number,copy:boolean)=>void}
interface Props {historyMark?:HistoryHighlight|null;onDismissHistory?:()=>void}

function domOffset(node:Node|null, offset:number):number|null {
  if(!node) return null;
  const element=node.nodeType===Node.ELEMENT_NODE?node as HTMLElement:node.parentElement;
  if(!element?.closest('.page-edit'))return null;
  const token=element?.closest<HTMLElement>('[data-offset]');
  if(token) return Number(token.dataset.offset)+(token.dataset.empty!==undefined?0:Math.min(offset,(token.textContent??'').length));
  if(element?.matches('.page-edit')) {
    const children=element.querySelectorAll<HTMLElement>('[data-offset]');
    return Number((offset===0?children[0]?.dataset.offset:children[children.length-1]?.dataset.end)??0);
  }
  if(element?.matches('.body-line')) return Number(offset===0?element.dataset.lineStart:element.dataset.lineEnd);
  return null;
}

export function readSelection():TextSelection|null {
  const selection=window.getSelection();
  if(!selection?.rangeCount) return null;
  const a=domOffset(selection.anchorNode,selection.anchorOffset),b=domOffset(selection.focusNode,selection.focusOffset);
  return a===null||b===null?null:{start:Math.min(a,b),end:Math.max(a,b)};
}

// An unchanged page keeps its browser-owned editable DOM and skips token reconciliation.
const EditablePage=memo(function EditablePage({page,index,contentKey,vertical,language,baseStyle,editable,onClick}:{page:LayoutPage;index:number;contentKey:string;vertical:boolean;language:string;baseStyle:TextStyle;editable:boolean;onClick:(e:MouseEvent<HTMLDivElement>,index:number)=>void}){
  return <div className="page-edit" key={contentKey} role="textbox" aria-label={`手紙の本文 ${index+1}ページ`} aria-multiline="true" contentEditable={editable} suppressContentEditableWarning spellCheck={false} lang={language} data-page-index={index} data-writing-mode={vertical?'vertical':'horizontal'} style={{...textCss(baseStyle),writingMode:vertical?'vertical-rl':'horizontal-tb'}} onClick={e=>onClick(e,index)}>
    {[...page.lines,...page.caretLines].map((line,i)=><LineContent key={i} index={i} line={line} vertical={vertical}/>)}
  </div>;
},(a,b)=>a.contentKey===b.contentKey&&a.editable===b.editable);

export function EditorCanvas(props:Props) {
  const [,refreshNative]=useState(0);
  useLayoutEffect(()=>{let alive=true;const refresh=()=>{if(alive)refreshNative(v=>v+1);};window.addEventListener('letterier-native-ime-ready',refresh);void prepareNativeIme().then(ready=>{if(ready)refresh();});return()=>{alive=false;window.removeEventListener('letterier-native-ime-ready',refresh);};},[]);
  const root=useRef<HTMLDivElement>(null), composing=useRef(false), compositionRange=useRef<TextSelection|null>(null);
  const compositionFinal=useRef<string|null>(null);
  const compositionPage=useRef(0);
  const compositionLine=useRef<number|undefined>(undefined),compositionRestore=useRef<{page:number;line?:number}|null>(null);
  const [compositionRevisions,setCompositionRevisions]=useState<Record<number,number>>({});
  const pageKeys=useMemo(()=>props.layout.pages.map((page,index)=>JSON.stringify([index,props.project.id,props.uiLanguage,props.project.settings.writingMode,props.project.baseStyle,page.lines,page.caretLines,compositionRevisions[index]??0])),[props.layout,props.project.id,props.uiLanguage,props.project.settings.writingMode,props.project.baseStyle,compositionRevisions]);
  const offsetIndex=useRef(new WeakMap<HTMLElement,{key:string;nodes:HTMLElement[]}>());
  const editContexts=useRef(new Map<HTMLElement,EditContextBinding>());
  const preferTextEnd=useRef<number|null>(null);
  const revealInsertion=useRef(false);
  const preferredInline=useRef<number|undefined>(undefined);
  const draggedText=useRef<{project:Project;selection:TextSelection}|null>(null);
  const dropOffset=(x:number,y:number)=>{
    const point=document.caretRangeFromPoint(x,y);
    if(!point||!root.current?.contains(point.startContainer))return null;
    const at=domOffset(point.startContainer,point.startOffset);if(at===null)return null;
    const element=point.startContainer.nodeType===Node.ELEMENT_NODE?point.startContainer as Element:point.startContainer.parentElement;
    const token=element?.closest<HTMLElement>('[data-offset]');
    if(!token)return at;
    let offset=Number(token.dataset.offset),previous=offset;
    for(const part of graphemes(token.dataset.empty!==undefined?'':token.textContent??'')){previous=offset;offset+=part.length;if(offset>=at)return at-previous<offset-at?previous:offset;}
    return offset;
  };
  const restore=(rangeSelection:TextSelection=props.selection,backward=false,focusPage?:number,focusLine?:number)=>{
    if(!root.current||composing.current) return;
    const hosts=Array.from(root.current.querySelectorAll<HTMLElement>('.page-edit'));
    const indexed=(host:HTMLElement)=>{const key=pageKeys[Number(host.dataset.pageIndex)];let entry=offsetIndex.current.get(host);if(!entry||entry.key!==key){entry={key,nodes:Array.from(host.querySelectorAll<HTMLElement>('[data-offset]')).sort((a,b)=>Number(a.dataset.offset)-Number(b.dataset.offset))};offsetIndex.current.set(host,entry);}return entry.nodes;};
    const point=(offset:number,isFocus:boolean)=>{
      const nearby:HTMLElement[]=[];
      for(const [index,host] of hosts.entries()){
        const page=props.layout.pages[index];if(offset<page.start||offset>page.end)continue;
        const nodes=indexed(host);let low=0,high=nodes.length;while(low<high){const middle=(low+high)>>>1;if(Number(nodes[middle].dataset.offset)<=offset)low=middle+1;else high=middle;}
        const matches:HTMLElement[]=[];for(let i=low-1;i>=0&&Number(nodes[i].dataset.end)>=offset;i--)matches.unshift(nodes[i]);nearby.push(...matches);
      }
      const pageNodes=focusPage===undefined||!isFocus?nearby:nearby.filter(n=>(n.closest('.page-edit') as HTMLElement|null)?.dataset.pageIndex===String(focusPage));
      const lineNodes=focusLine===undefined||!isFocus?pageNodes:pageNodes.filter(n=>(n.closest('.body-line') as HTMLElement|null)?.dataset.lineIndex===String(focusLine));
      const candidates=[lineNodes,pageNodes,nearby].find(list=>list.length)??[];
      const candidateIndex=pickCaretCandidate(candidates.map(n=>({start:Number(n.dataset.offset),end:Number(n.dataset.end),empty:n.dataset.empty!==undefined,separator:n.dataset.separator!==undefined})),offset,rangeSelection.start===rangeSelection.end&&preferTextEnd.current===offset);
      const node=candidates[candidateIndex]??(hosts.length?indexed(hosts.at(-1)!).at(-1):undefined);
      return node?.firstChild?{node:node.firstChild,offset:node.dataset.empty!==undefined?0:Math.max(0,Math.min(offset-Number(node.dataset.offset),node.textContent?.length??0))}:null;
    };
    const a=point(rangeSelection.start,backward||rangeSelection.start===rangeSelection.end),b=point(rangeSelection.end,!backward);
    if(!a||!b) return;
    const inputHost=editContexts.current.has(root.current)?root.current:(backward?a:b).node.parentElement?.closest<HTMLElement>('.page-edit');
    inputHost?.focus({preventScroll:true});
    const range=document.createRange(); range.setStart(a.node,a.offset);range.setEnd(b.node,b.offset);
    const selected=window.getSelection(); selected?.removeAllRanges();selected?.addRange(range);if(backward)selected?.setBaseAndExtent(b.node,b.offset,a.node,a.offset);
    for(const binding of editContexts.current.values())binding.sync(bodyText(props.project),rangeSelection);
    if(revealInsertion.current){b.node.parentElement?.scrollIntoView({block:'nearest',inline:'nearest'});revealInsertion.current=false;}
    if(rangeSelection.start===rangeSelection.end&&preferTextEnd.current===rangeSelection.end)preferTextEnd.current=null;
  };
  useLayoutEffect(()=>{
    const mark=props.historyMark;if(!mark||!root.current)return;
    const nodes=Array.from(root.current.querySelectorAll<HTMLElement>('[data-offset]'));
    const affected=mark.start===mark.end?[]:nodes.filter(n=>Number(n.dataset.end)>mark.start&&Number(n.dataset.offset)<mark.end&&n.dataset.token!==undefined);
    for(const node of affected)node.dataset.historyHighlight='true';
    const position=affected.length?undefined:nodes.find(n=>Number(n.dataset.offset)===mark.start&&n.dataset.separator===undefined)??nodes.find(n=>Number(n.dataset.offset)<=mark.start&&Number(n.dataset.end)>=mark.start&&n.dataset.separator===undefined);
    if(position)position.dataset.historyPosition=Number(position.dataset.end)===mark.start&&Number(position.dataset.offset)!==mark.start?'end':'start';
    const target=affected[0]??position;
    if(target){
      const area=root.current.getBoundingClientRect(),first=target.getBoundingClientRect();
      const bounds=(affected.length?affected:[target]).reduce((b,n)=>{const r=n.getBoundingClientRect();return {top:Math.min(b.top,r.top),bottom:Math.max(b.bottom,r.bottom),left:Math.min(b.left,r.left),right:Math.max(b.right,r.right)};},{top:first.top,bottom:first.bottom,left:first.left,right:first.right});
      // Bring the whole changed phrase into view when it fits. For a change
      // spanning many lines/pages, start at its first visible portion.
      const top=bounds.bottom-bounds.top<=area.height-48?bounds.top:first.top,bottom=bounds.bottom-bounds.top<=area.height-48?bounds.bottom:first.bottom;
      const left=bounds.right-bounds.left<=area.width-48?bounds.left:first.left,right=bounds.right-bounds.left<=area.width-48?bounds.right:first.right;
      root.current.scrollTop+=top<area.top+24?top-area.top-24:bottom>area.bottom-24?bottom-area.bottom+24:0;
      root.current.scrollLeft+=left<area.left+24?left-area.left-24:right>area.right-24?right-area.right+24:0;
    }
    return()=>{for(const n of affected)delete n.dataset.historyHighlight;if(position)delete position.dataset.historyPosition;};
  },[props.historyMark,props.layout]);
  const capture=()=>{if(!composing.current){const range=readSelection();if(range){const focusHost=window.getSelection()?.focusNode?.parentElement?.closest<HTMLElement>('.page-edit');for(const binding of editContexts.current.values())binding.sync(bodyText(props.project),range);props.onSelection(range);const host=focusHost;if(host&&root.current?.contains(host))props.onPage(Number(host.dataset.pageIndex));}}};
  const insert=(text:string,range=readSelection()??props.selection)=>{revealInsertion.current=true;if(text)preferTextEnd.current=range.start+text.length;props.onInsert(range.start,range.end,text);};
  const inputLatest=useRef({props,insert});inputLatest.current={props,insert};
  useLayoutEffect(()=>{
    // One persistent native input connection spans every rendered page.
    const hosts=new Set<HTMLElement>(root.current&&props.project.settings.writingMode==='vertical'?[root.current]:[]);
    for(const [host,binding] of editContexts.current)if(!hosts.has(host)){binding.dispose();editContexts.current.delete(host);}
    for(const host of hosts){
      const previous=editContexts.current.get(host);if(previous&&!composing.current&&!!previous.native!==nativeImeAvailable()){previous.dispose();editContexts.current.delete(host);}
      if(!editContexts.current.has(host)){
        const binding=bindEditContext(host,{
          snapshot:()=>({text:bodyText(inputLatest.current.props.project),selection:readSelection()??inputLatest.current.props.selection}),
          begin:()=>{inputLatest.current.props.onCompositionChange?.(true);composing.current=true;compositionRange.current=readSelection()??inputLatest.current.props.selection;compositionPage.current=Number(window.getSelection()?.focusNode?.parentElement?.closest<HTMLElement>('.page-edit')?.dataset.pageIndex??0);compositionLine.current=Number(window.getSelection()?.focusNode?.parentElement?.closest<HTMLElement>('.body-line')?.dataset.lineIndex??0);},
          finish:(change,selection,cancelled,previewPage)=>{flushSync(()=>{inputLatest.current.props.onCompositionChange?.(false);composing.current=false;compositionRange.current=null;const page=compositionPage.current;if(cancelled)compositionRestore.current={page,line:compositionLine.current};else if(!change&&selection.start===selection.end)preferTextEnd.current=selection.end;setCompositionRevisions(revisions=>({...revisions,[page]:(revisions[page]??0)+1,...(previewPage!==undefined&&previewPage!==page?{[previewPage]:(revisions[previewPage]??0)+1}:{})}));if(change)inputLatest.current.insert(change.text,{start:change.start,end:change.end});else inputLatest.current.props.onSelection(selection);});},
          abort:()=>{inputLatest.current.props.onCompositionChange?.(false);composing.current=false;compositionRange.current=null;compositionRestore.current=null;},
          insert:(start,end,text)=>flushSync(()=>inputLatest.current.insert(text,{start,end})),
        });
        if(binding)editContexts.current.set(host,binding);
      }
      editContexts.current.get(host)?.sync(bodyText(props.project),readSelection()??props.selection);
    }
  });
  // Windows negotiates the native IME context when focus enters the host.
  // Attach EditContext above before restoring focus to a rebuilt page.
  useLayoutEffect(()=>{const hint=compositionRestore.current;compositionRestore.current=null;restore(props.selection,false,hint?.page,hint?.line);},[props.caretRequest,compositionRevisions]);
  useLayoutEffect(()=>()=>{for(const binding of editContexts.current.values())binding.dispose();editContexts.current.clear();},[]);
  const handleInput=(event:FormEvent<HTMLDivElement>)=>{
    const e=event.nativeEvent as InputEvent;
    if(composing.current||e.isComposing||e.inputType==='insertCompositionText')return;
    // beforeinput owns regular edits. Browser-only fallback covers speech/drop input.
    if(e.inputType==='insertText'&&compositionFinal.current!==null){compositionFinal.current=null;return;}
  };
  const beforeInput=(event:InputEvent)=>{
    if(composing.current||event.isComposing||event.inputType==='insertCompositionText')return;
    if(event.inputType==='insertFromComposition'&&compositionFinal.current!==null){event.preventDefault();compositionFinal.current=null;return;}
    const range=readSelection()??props.selection;
    if(event.inputType==='insertFromDrop'||event.inputType==='deleteByDrag'){event.preventDefault();return;}
    if(event.inputType==='insertText' || event.inputType==='insertReplacementText') {event.preventDefault();insert(event.data??'',range);}
    else if(event.inputType==='insertParagraph'||event.inputType==='insertLineBreak'){event.preventDefault();insert('\n',range);}
    else if(event.inputType.startsWith('delete')) {
      event.preventDefault();
      const text=bodyText(props.project);
      if(range.start!==range.end)insert('',range);
      else if(event.inputType.includes('Backward')){const previous=graphemes(text.slice(0,range.start)).at(-1)??'';insert('',{start:range.start-previous.length,end:range.end});}
      else {const next=graphemes(text.slice(range.end))[0]??'';insert('',{start:range.start,end:range.end+next.length});}
    } else if(event.inputType==='historyUndo'||event.inputType==='historyRedo'){event.preventDefault();props.onHistory(event.inputType==='historyRedo');}
    else if(event.inputType.startsWith('format'))event.preventDefault();
  };
  useLayoutEffect(()=>{
    const el=root.current;if(!el)return;
    el.addEventListener('beforeinput',beforeInput);
    document.addEventListener('selectionchange',capture);
    return()=>{el.removeEventListener('beforeinput',beforeInput);document.removeEventListener('selectionchange',capture);};
  });
  const keyboard=(e:KeyboardEvent)=>{
    if(!((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())))props.onDismissHistory?.();
    if(composing.current||e.nativeEvent.isComposing)return;
    if(e.ctrlKey||e.metaKey){
      if(e.key.toLowerCase()==='a'){e.preventDefault();const selection={start:0,end:bodyText(props.project).length};props.onSelection(selection);restore(selection);}
      if(e.key.toLowerCase()==='z'||e.key.toLowerCase()==='y'){e.preventDefault();props.onHistory(e.shiftKey||e.key.toLowerCase()==='y');}
      if(e.key==='Enter'){e.preventDefault();insert('\f');}
      if(e.key.toLowerCase()==='b'){e.preventDefault();props.onFormat({bold:!props.currentStyle.bold});}
      if(e.key.toLowerCase()==='i'){e.preventDefault();props.onFormat({italic:!props.currentStyle.italic});}
      if(e.key.toLowerCase()==='u'){e.preventDefault();props.onFormat({underline:!props.currentStyle.underline});}
      if((e.key==='Backspace'||e.key==='Delete')&&root.current&&editContexts.current.has(root.current)){e.preventDefault();const range=readSelection()??props.selection;insert('',range.start===range.end?wordDeletionRange(bodyText(props.project),range.start,e.key==='Backspace'?-1:1):range);return;}
    }
    const selected=window.getSelection(),focus=selected?domOffset(selected.focusNode,selected.focusOffset):null,anchor=selected?domOffset(selected.anchorNode,selected.anchorOffset):null;
    if(focus===null||anchor===null||!selected)return;
    const active=selected.focusNode?.parentElement?.closest<HTMLElement>('.body-line'),host=active?.closest('.page-edit');
    const pageIndex=Array.from(root.current?.querySelectorAll('.page-edit')??[]).indexOf(host!);
    if(host&&(editContexts.current.has(host as HTMLElement)||!!root.current&&editContexts.current.has(root.current))&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
      if(e.key==='Enter'){e.preventDefault();insert('\n');return;}
      if(e.key==='Backspace'||e.key==='Delete'){
        e.preventDefault();const range=readSelection()??props.selection,text=bodyText(props.project);
        if(range.start!==range.end)insert('',range);
        else if(e.key==='Backspace')insert('',{start:range.start-(graphemes(text.slice(0,range.start)).at(-1)?.length??0),end:range.end});
        else insert('',{start:range.start,end:range.end+(graphemes(text.slice(range.end))[0]?.length??0)});
        return;
      }
    }
    const vertical=props.project.settings.writingMode==='vertical',text=bodyText(props.project);
    const move=(offset:number,targetPage?:number)=>{e.preventDefault();const from=e.shiftKey?anchor:offset,range={start:Math.min(from,offset),end:Math.max(from,offset)};props.onSelection(range);restore(range,offset<from,targetPage);const target=window.getSelection()?.focusNode?.parentElement;const host=target?.closest<HTMLElement>('.page-edit');if(host)props.onPage(Number(host.dataset.pageIndex));target?.scrollIntoView({block:'nearest',inline:'nearest'});};
    if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.key==='PageUp'||e.key==='PageDown')){const target=Math.max(0,Math.min(props.layout.pages.length-1,pageIndex+(e.key==='PageDown'?1:-1)));move(target===pageIndex?(e.key==='PageDown'?text.length:0):props.layout.pages[target].start,target);return;}
    if(!e.ctrlKey&&!e.metaKey&&!e.altKey){
      const blockForward=e.key===(vertical?'ArrowLeft':'ArrowDown'),blockBackward=e.key===(vertical?'ArrowRight':'ArrowUp');
      if((blockForward||blockBackward)&&active){const result=moveBlockCaret(props.layout,vertical,pageIndex,Number(active.dataset.lineStart),focus,blockForward?1:-1,preferredInline.current);preferredInline.current=result.coordinate;move(result.offset,result.pageIndex);return;}
      const forward=e.key===(vertical?'ArrowDown':'ArrowRight'),back=e.key===(vertical?'ArrowUp':'ArrowLeft');
      if(forward||back){preferredInline.current=undefined;if(!e.shiftKey&&anchor!==focus){move(forward?Math.max(anchor,focus):Math.min(anchor,focus));return;}move(moveInlineCaret(text,focus,forward?1:-1));return;}
    }
    if(e.key==='Home'||e.key==='End'){preferredInline.current=undefined;const end=e.key==='End';move(e.ctrlKey?(end?text.length:0):Number(end?(Array.from(active?.querySelectorAll<HTMLElement>('[data-token]')??[]).at(-1)?.dataset.end??active?.dataset.lineEnd):active?.dataset.lineStart));}
  };
  const clickPaper=(e:MouseEvent<HTMLDivElement>,index:number)=>{
    if(root.current&&editContexts.current.get(root.current)?.native)root.current.focus({preventScroll:true});
    preferredInline.current=undefined;
    props.onPage(index);
    const nativeSelection=readSelection();
    if(nativeSelection&&nativeSelection.start!==nativeSelection.end){props.onSelection(nativeSelection);return;}
    if(e.target!==e.currentTarget){capture();return;}
    const bounds=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-bounds.left)*25.4/96/props.zoom,y=(e.clientY-bounds.top)*25.4/96/props.zoom;
    const vertical=props.project.settings.writingMode==='vertical';
    const lines=[...props.layout.pages[index].lines,...props.layout.pages[index].caretLines];
    const closest=lines.map((line,lineIndex)=>({line,lineIndex})).sort((a,b)=>Math.abs((vertical?a.line.x:a.line.y)-(vertical?x:y))-Math.abs((vertical?b.line.x:b.line.y)-(vertical?x:y)))[0];
    if(closest){const at={start:closest.line.end,end:closest.line.end};props.onSelection(at);restore(at,false,index,closest.lineIndex);}
  };
  const beginBodySelection=(e:PointerEvent<HTMLDivElement>)=>{
    props.onDismissHistory?.();
    if(!(e.target as Element).closest('.page-edit'))return;
    const scroll=e.currentTarget;scroll.dataset.selectingBody='true';
    const finish=()=>{delete scroll.dataset.selectingBody;window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);};
    window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
  };
  const clickLatest=useRef(clickPaper);clickLatest.current=clickPaper;
  return <div className="paper-scroll" ref={root} tabIndex={props.project.settings.writingMode==='vertical'?0:undefined} role={props.project.settings.writingMode==='vertical'?'textbox':undefined} aria-label={props.project.settings.writingMode==='vertical'?'手紙の編集領域':undefined} aria-multiline={props.project.settings.writingMode==='vertical'?true:undefined} onScroll={()=>{for(const binding of editContexts.current.values())binding.bounds();}} onPointerDownCapture={beginBodySelection} onKeyDown={keyboard} onInput={handleInput}
    onDragStart={e=>{
      const range=readSelection()??props.selection;
      if(composing.current||!props.onTransfer||range.start===range.end||!(e.target as Element).closest('.page-edit')){e.preventDefault();return;}
      draggedText.current={project:props.project,selection:range};
      e.dataTransfer.effectAllowed='copyMove';e.dataTransfer.setData('text/plain',bodyText(props.project).slice(range.start,range.end));
    }}
    onDragEnd={()=>{draggedText.current=null;}}
    onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect=draggedText.current?.project===props.project&&dropOffset(e.clientX,e.clientY)!==null?(e.ctrlKey?'copy':'move'):'none';}}
    onDrop={e=>{e.preventDefault();const drag=draggedText.current;draggedText.current=null;const target=dropOffset(e.clientX,e.clientY);if(drag?.project===props.project&&target!==null)props.onTransfer?.(drag.selection.start,drag.selection.end,target,e.ctrlKey);}}
    onCompositionStart={e=>{props.onCompositionChange?.(true);const host=(e.target as Element).closest<HTMLElement>('.page-edit');if(host)host.dataset.imeComposing='true';composing.current=true;compositionRange.current=readSelection()??props.selection;compositionPage.current=Number(host?.dataset.pageIndex??0);}}
    onCompositionEnd={e=>{props.onCompositionChange?.(false);const host=(e.target as Element).closest<HTMLElement>('.page-edit');if(host)delete host.dataset.imeComposing;composing.current=false;const range=compositionRange.current??props.selection;compositionFinal.current=e.data;const page=compositionPage.current;setCompositionRevisions(revisions=>({...revisions,[page]:(revisions[page]??0)+1}));if(e.data)insert(e.data,range);compositionRange.current=null;}}
    onPaste={e=>{e.preventDefault();insert(e.clipboardData.getData('text/plain'));}}
    onCut={e=>{const range=readSelection()??props.selection;if(range.start!==range.end){e.preventDefault();e.clipboardData.setData('text/plain',bodyText(props.project).slice(range.start,range.end));insert('',range);}}}
    onCopy={e=>{const range=readSelection();if(range&&range.start!==range.end){e.preventDefault();e.clipboardData.setData('text/plain',bodyText(props.project).slice(range.start,range.end));}}}>
    {props.layout.pages.map((page,index)=><section key={index} className="sheet-frame" style={{width:`${props.layout.width*96/25.4*props.zoom}px`,height:`${props.layout.height*96/25.4*props.zoom}px`}} aria-label={`${index+1}ページ`}>
      <div className="paper" style={{width:`${props.layout.width}mm`,height:`${props.layout.height}mm`,transform:`scale(${props.zoom})`}}>
        <PageArtwork project={props.project} layout={props.layout} index={index}/>
        {/* Preserve unchanged pages, but reset the composing page even for an IME commit
            with identical text: the browser may have modified its editable DOM. */}
        <EditablePage page={page} index={index} contentKey={pageKeys[index]} vertical={props.project.settings.writingMode==='vertical'} language={props.uiLanguage} baseStyle={props.project.baseStyle} editable={!(props.project.settings.writingMode==='vertical'&&nativeImeAvailable())} onClick={(e,index)=>clickLatest.current(e,index)}/>
        {props.onSelectObject&&props.onObjectPreview&&props.onObjectChange&&props.onObjectDelete&&<ObjectLayer project={props.project} layout={props.layout} page={index} zoom={props.zoom} selected={props.selectedObject??null} onSelect={props.onSelectObject} onPreview={props.onObjectPreview} onChange={props.onObjectChange} onDelete={props.onObjectDelete}/>}
        {page.lines.filter(l=>l.breakAfter==='\f').map((line,i)=><div key={i} className="manual-break-marker" style={{left:`${line.x}mm`,top:`${line.y}mm`}} aria-hidden="true">改ページ</div>)}
        {!bodyText(props.project)&&index===0&&page.lines[0]&&<div className="paper-placeholder" aria-hidden="true" style={{left:`${page.lines[0].x}mm`,top:`${page.lines[0].y}mm`,width:`${props.project.settings.writingMode==='vertical'?page.lines[0].spacing:page.lines[0].extent}mm`,height:`${props.project.settings.writingMode==='vertical'?page.lines[0].extent:page.lines[0].spacing}mm`,lineHeight:`${page.lines[0].spacing}mm`,writingMode:props.project.settings.writingMode==='vertical'?'vertical-rl':'horizontal-tb'}}>ここから、お手紙を。</div>}
      </div>
      <span className="page-caption">{index+1}</span>
    </section>)}
  </div>;
}
