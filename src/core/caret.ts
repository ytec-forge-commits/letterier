import type {Layout,LayoutLine} from './compose';
import {graphemes} from './layout';
export interface CaretCandidate {start:number;end:number;empty:boolean;separator?:boolean}
export function pickCaretCandidate(candidates:CaretCandidate[],offset:number,preferTextEnd:boolean):number{
 if(preferTextEnd){for(let index=candidates.length-1;index>=0;index--)if(!candidates[index].empty&&!candidates[index].separator&&candidates[index].end===offset)return index;}
 const emptyAtOffset=candidates.findIndex(candidate=>candidate.empty&&candidate.start===offset);
 if(emptyAtOffset>=0)return emptyAtOffset;
 const contains=candidates.findIndex(candidate=>candidate.start<=offset&&candidate.end>offset);
 if(contains>=0)return contains;
 const begins=candidates.findIndex(candidate=>candidate.start===offset);if(begins>=0)return begins;
 for(let index=candidates.length-1;index>=0;index--)if(candidates[index].end===offset)return index;
 return candidates.length-1;
}
export function moveInlineCaret(text:string,offset:number,direction:1|-1):number{
 if(direction===1&&text.slice(offset,offset+2)==='\n\f')return offset+2;
 if(direction===-1&&text.slice(offset-2,offset)==='\n\f')return offset-2;
 const part=direction===1?graphemes(text.slice(offset))[0]??'':graphemes(text.slice(0,offset)).at(-1)??'';
 return offset+direction*part.length;
}
function points(line:LayoutLine,vertical:boolean){let at=vertical?line.y:line.x;const points=[{offset:line.start,coordinate:at}];for(const token of line.tokens){const chars=graphemes(token.text);let offset=token.start;for(const c of chars){at+=token.advance/chars.length;offset+=c.length;points.push({offset,coordinate:at});}}return points;}
export function moveBlockCaret(layout:Layout,vertical:boolean,pageIndex:number,lineStart:number,offset:number,direction:1|-1,preferred?:number){
 const all=layout.pages.flatMap(p=>[...p.lines,...p.caretLines]),current=all.find(l=>l.pageIndex===pageIndex&&l.start===lineStart)??all[0];
 const coordinate=preferred??points(current,vertical).find(p=>p.offset===offset)?.coordinate??points(current,vertical).at(-1)!.coordinate;
 const origin=all.indexOf(current),block=(l:LayoutLine)=>vertical?l.x:l.y;let next:LayoutLine|undefined;
 for(let i=origin+direction;i>=0&&i<all.length;i+=direction){const line=all[i];if(line.pageIndex!==current.pageIndex||Math.abs(block(line)-block(current))>.01){next=line;break;}}
 if(!next)return {offset,pageIndex,coordinate};
 const candidates=all.filter(l=>l.pageIndex===next.pageIndex&&Math.abs(block(l)-block(next))<.01).flatMap(l=>points(l,vertical));
 const closest=candidates.sort((a,b)=>Math.abs(a.coordinate-coordinate)-Math.abs(b.coordinate-coordinate))[0];
 return {offset:closest.offset,pageIndex:next.pageIndex,coordinate};
}
