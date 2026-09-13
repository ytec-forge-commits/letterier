import { useLayoutEffect, useRef, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { bodyText, type Project, type TextStyle, type FloatingObject } from '../core/model';
import { graphemes } from '../core/layout';
import { type Layout } from '../core/compose';
import { LineContent, PageArtwork } from './Paper';
import { ObjectLayer } from './ObjectLayer';
import {moveBlockCaret,pickCaretCandidate} from '../core/caret';

export interface TextSelection { start:number; end:number }
interface Props { uiLanguage:'ja'|'en';currentStyle:TextStyle;project:Project;layout:Layout;zoom:number;selection:TextSelection;caretRequest:number;onSelection:(value:TextSelection)=>void;onInsert:(start:number,end:number,text:string)=>void;onHistory:(redo:boolean)=>void;onFormat:(style:Partial<TextStyle>)=>void;onPage:(page:number)=>void;selectedObject?:string|null;onSelectObject?:(id:string)=>void;onObjectPreview?:(id:string,patch:Partial<FloatingObject>|null)=>void;onObjectChange?:(id:string,patch:Partial<FloatingObject>)=>void;onObjectDelete?:(id:string)=>void }

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

export function EditorCanvas(props:Props) {
  const root=useRef<HTMLDivElement>(null), composing=useRef(false), compositionRange=useRef<TextSelection|null>(null);
  const compositionFinal=useRef<string|null>(null);
  const preferTextEnd=useRef<number|null>(null);
  const preferredInline=useRef<number|undefined>(undefined);
  const restore=(rangeSelection:TextSelection=props.selection,backward=false,focusPage?:number,focusLine?:number)=>{
    if(!root.current||composing.current) return;
    const nodes=Array.from(root.current.querySelectorAll<HTMLElement>('[data-offset]'));
    const point=(offset:number,isFocus:boolean)=>{
      const pageNodes=focusPage===undefined||!isFocus?nodes:nodes.filter(n=>(n.closest('.page-edit') as HTMLElement|null)?.dataset.pageIndex===String(focusPage));
      const lineNodes=focusLine===undefined||!isFocus?pageNodes:pageNodes.filter(n=>(n.closest('.body-line') as HTMLElement|null)?.dataset.lineIndex===String(focusLine));
      const candidates=[lineNodes,pageNodes,nodes].map(list=>list.filter(n=>Number(n.dataset.offset)<=offset&&Number(n.dataset.end)>=offset)).find(list=>list.length)??[];
      const candidateIndex=pickCaretCandidate(candidates.map(n=>({start:Number(n.dataset.offset),end:Number(n.dataset.end),empty:n.dataset.empty!==undefined,separator:n.dataset.separator!==undefined})),offset,rangeSelection.start===rangeSelection.end&&preferTextEnd.current===offset);
      const node=candidates[candidateIndex]??nodes.at(-1);
      return node?.firstChild?{node:node.firstChild,offset:node.dataset.empty!==undefined?0:Math.max(0,Math.min(offset-Number(node.dataset.offset),node.textContent?.length??0))}:null;
    };
    const a=point(rangeSelection.start,backward||rangeSelection.start===rangeSelection.end),b=point(rangeSelection.end,!backward);
    if(!a||!b) return;
    ((backward?a:b).node.parentElement?.closest('.page-edit') as HTMLElement)?.focus({preventScroll:true});
    const range=document.createRange(); range.setStart(a.node,a.offset);range.setEnd(b.node,b.offset);
    const selected=window.getSelection(); selected?.removeAllRanges();selected?.addRange(range);if(backward)selected?.setBaseAndExtent(b.node,b.offset,a.node,a.offset);
    if(rangeSelection.start===rangeSelection.end&&preferTextEnd.current===rangeSelection.end)preferTextEnd.current=null;
  };
  useLayoutEffect(()=>restore(),[props.caretRequest]);
  const capture=()=>{if(!composing.current){const range=readSelection();if(range)props.onSelection(range);}};
  const insert=(text:string,range=readSelection()??props.selection)=>{if(text)preferTextEnd.current=range.start+text.length;props.onInsert(range.start,range.end,text);};
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
    if(composing.current||e.nativeEvent.isComposing)return;
    if(e.ctrlKey||e.metaKey){
      if(e.key.toLowerCase()==='a'){e.preventDefault();const selection={start:0,end:bodyText(props.project).length};props.onSelection(selection);restore(selection);}
      if(e.key.toLowerCase()==='z'||e.key.toLowerCase()==='y'){e.preventDefault();props.onHistory(e.shiftKey||e.key.toLowerCase()==='y');}
      if(e.key==='Enter'){e.preventDefault();insert('\f');}
      if(e.key.toLowerCase()==='b'){e.preventDefault();props.onFormat({bold:!props.currentStyle.bold});}
      if(e.key.toLowerCase()==='i'){e.preventDefault();props.onFormat({italic:!props.currentStyle.italic});}
      if(e.key.toLowerCase()==='u'){e.preventDefault();props.onFormat({underline:!props.currentStyle.underline});}
    }
    const selected=window.getSelection(),focus=selected?domOffset(selected.focusNode,selected.focusOffset):null,anchor=selected?domOffset(selected.anchorNode,selected.anchorOffset):null;
    if(focus===null||anchor===null||!selected)return;
    const active=selected.focusNode?.parentElement?.closest<HTMLElement>('.body-line'),host=active?.closest('.page-edit');
    const pageIndex=Array.from(root.current?.querySelectorAll('.page-edit')??[]).indexOf(host!);
    const vertical=props.project.settings.writingMode==='vertical',text=bodyText(props.project);
    const move=(offset:number,targetPage?:number)=>{e.preventDefault();const from=e.shiftKey?anchor:offset,range={start:Math.min(from,offset),end:Math.max(from,offset)};props.onSelection(range);restore(range,offset<from,targetPage);const target=window.getSelection()?.focusNode?.parentElement;target?.scrollIntoView({block:'nearest',inline:'nearest'});};
    if(!e.ctrlKey&&!e.metaKey&&!e.altKey){
      const blockForward=e.key===(vertical?'ArrowLeft':'ArrowDown'),blockBackward=e.key===(vertical?'ArrowRight':'ArrowUp');
      if((blockForward||blockBackward)&&active){const result=moveBlockCaret(props.layout,vertical,pageIndex,Number(active.dataset.lineStart),focus,blockForward?1:-1,preferredInline.current);preferredInline.current=result.coordinate;move(result.offset,result.pageIndex);return;}
      const forward=e.key===(vertical?'ArrowDown':'ArrowRight'),back=e.key===(vertical?'ArrowUp':'ArrowLeft');
      if(forward||back){preferredInline.current=undefined;if(!e.shiftKey&&anchor!==focus){move(forward?Math.max(anchor,focus):Math.min(anchor,focus));return;}const part=forward?graphemes(text.slice(focus))[0]??'':graphemes(text.slice(0,focus)).at(-1)??'';move(focus+(forward?part.length:-part.length));return;}
    }
    if(e.key==='Home'||e.key==='End'){preferredInline.current=undefined;const end=e.key==='End';move(e.ctrlKey?(end?text.length:0):Number(end?(Array.from(active?.querySelectorAll<HTMLElement>('[data-token]')??[]).at(-1)?.dataset.end??active?.dataset.lineEnd):active?.dataset.lineStart));}
  };
  const clickPaper=(e:MouseEvent<HTMLDivElement>,index:number)=>{
    preferredInline.current=undefined;
    props.onPage(index);
    if(e.target!==e.currentTarget){capture();return;}
    const bounds=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-bounds.left)*25.4/96/props.zoom,y=(e.clientY-bounds.top)*25.4/96/props.zoom;
    const vertical=props.project.settings.writingMode==='vertical';
    const lines=[...props.layout.pages[index].lines,...props.layout.pages[index].caretLines];
    const closest=lines.map((line,lineIndex)=>({line,lineIndex})).sort((a,b)=>Math.abs((vertical?a.line.x:a.line.y)-(vertical?x:y))-Math.abs((vertical?b.line.x:b.line.y)-(vertical?x:y)))[0];
    if(closest){const at={start:closest.line.end,end:closest.line.end};props.onSelection(at);restore(at,false,index,closest.lineIndex);}
  };
  return <div className="paper-scroll" ref={root} onKeyDown={keyboard} onInput={handleInput} onDragOver={e=>e.preventDefault()} onDrop={e=>e.preventDefault()}
    onCompositionStart={()=>{composing.current=true;compositionRange.current=readSelection()??props.selection;}}
    onCompositionEnd={e=>{composing.current=false;const range=compositionRange.current??props.selection;compositionFinal.current=e.data;insert(e.data,range);compositionRange.current=null;}}
    onPaste={e=>{e.preventDefault();insert(e.clipboardData.getData('text/plain'));}}
    onCut={e=>{const range=readSelection()??props.selection;if(range.start!==range.end){e.preventDefault();e.clipboardData.setData('text/plain',bodyText(props.project).slice(range.start,range.end));insert('',range);}}}
    onCopy={e=>{const range=readSelection();if(range&&range.start!==range.end){e.preventDefault();e.clipboardData.setData('text/plain',bodyText(props.project).slice(range.start,range.end));}}}>
    {props.layout.pages.map((page,index)=><section key={index} className="sheet-frame" style={{width:`${props.layout.width*96/25.4*props.zoom}px`,height:`${props.layout.height*96/25.4*props.zoom}px`}} aria-label={`${index+1}ページ`}>
      <div className="paper" style={{width:`${props.layout.width}mm`,height:`${props.layout.height}mm`,transform:`scale(${props.zoom})`}}>
        <PageArtwork project={props.project} layout={props.layout} index={index}/>
        <div className="page-edit" key={`${index}-${props.caretRequest}`} role="textbox" aria-label={`手紙の本文 ${index+1}ページ`} aria-multiline="true" contentEditable suppressContentEditableWarning spellCheck={false} lang={props.uiLanguage} data-page-index={index} data-writing-mode={props.project.settings.writingMode} onClick={e=>clickPaper(e,index)}>
          {[...page.lines,...page.caretLines].map((line,i)=><LineContent key={i} index={i} line={line} vertical={props.project.settings.writingMode==='vertical'}/>)}
        </div>
        {props.onSelectObject&&props.onObjectPreview&&props.onObjectChange&&props.onObjectDelete&&<ObjectLayer project={props.project} layout={props.layout} page={index} zoom={props.zoom} selected={props.selectedObject??null} onSelect={props.onSelectObject} onPreview={props.onObjectPreview} onChange={props.onObjectChange} onDelete={props.onObjectDelete}/>}
        {page.lines.filter(l=>l.breakAfter==='\f').map((line,i)=><div key={i} className="manual-break-marker" style={{left:`${line.x}mm`,top:`${line.y}mm`}} aria-hidden="true">改ページ</div>)}
        {!bodyText(props.project)&&index===0&&page.lines[0]&&<div className="paper-placeholder" aria-hidden="true" style={{left:`${page.lines[0].x}mm`,top:`${page.lines[0].y}mm`,width:`${props.project.settings.writingMode==='vertical'?page.lines[0].spacing:page.lines[0].extent}mm`,height:`${props.project.settings.writingMode==='vertical'?page.lines[0].extent:page.lines[0].spacing}mm`,lineHeight:`${page.lines[0].spacing}mm`,writingMode:props.project.settings.writingMode==='vertical'?'vertical-rl':'horizontal-tb'}}>ここから、お手紙を。</div>}
      </div>
      <span className="page-caption">{index+1}</span>
    </section>)}
  </div>;
}
