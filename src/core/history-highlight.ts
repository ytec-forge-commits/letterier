import {bodyText,defaultStyle,type Project,type TextStyle} from './model';
import {graphemeSegmenter} from './layout';
export interface HistoryHighlight {start:number;end:number;kind:'text'|'deletion'|'format'}
export function historyHighlight(before:Project,after:Project):HistoryHighlight|null{
 const oldText=bodyText(before),newText=bodyText(after);
 if(oldText!==newText){
  const oldParts=[...graphemeSegmenter.segment(oldText)],newParts=[...graphemeSegmenter.segment(newText)];
  let first=0,oldEnd=oldParts.length,newEnd=newParts.length;
  while(first<oldEnd&&first<newEnd&&oldParts[first].segment===newParts[first].segment)first++;
  while(oldEnd>first&&newEnd>first&&oldParts[oldEnd-1].segment===newParts[newEnd-1].segment){oldEnd--;newEnd--;}
  const start=newParts[first]?.index??newText.length,end=newParts[newEnd]?.index??newText.length;
  return {start,end,kind:start===end?'deletion':'text'};
 }
 const spans=(p:Project)=>{let at=0;return p.body.runs.filter(r=>r.text).map(r=>{const start=at;at+=r.text.length;return {start,end:at,style:{...p.baseStyle,...r.style}};});};
 const a=spans(before),b=spans(after),keys=Object.keys(defaultStyle) as (keyof TextStyle)[];
 let i=0,j=0,start:number|undefined,end=0;
 while(i<a.length&&j<b.length){
  const left=a[i],right=b[j];
  if(keys.some(k=>(left.style[k]??defaultStyle[k])!==(right.style[k]??defaultStyle[k]))){start??=Math.max(left.start,right.start);end=Math.min(left.end,right.end);}
  const at=Math.min(left.end,right.end);if(left.end===at)i++;if(right.end===at)j++;
 }
 return start===undefined?null:{start,end,kind:'format'};
}
