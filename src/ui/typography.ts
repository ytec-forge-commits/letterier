import type { CSSProperties } from 'react';
import type { TextStyle } from '../core/model';
import {bundledFamily} from '../core/bundled-fonts';
const cache=new Map<string,number>();
let context: CanvasRenderingContext2D|null=null;
export function fontStack(family: string) { return `${JSON.stringify(bundledFamily(family))}, "Yu Mincho", "ＭＳ 明朝", serif`; }
export function textCss(style: TextStyle): CSSProperties {
  return {fontFamily:fontStack(style.fontFamily),fontSize:`${style.sizePt}pt`,fontWeight:style.bold?700:400,fontStyle:style.italic?'italic':'normal',fontSynthesis:'weight style',textDecoration:style.underline?'underline':'none',color:style.color,fontKerning:'none',fontVariantLigatures:'none'};
}
export function measureText(text: string, style: TextStyle): number {
  const key=`${style.fontFamily}/${style.sizePt}/${style.bold}/${style.italic}/${text}`;
  const old=cache.get(key); if(old!==undefined) return old;
  context??=document.createElement('canvas').getContext('2d');
  if(!context) throw new Error('文字の大きさを測れません。アプリを再起動してください。');
  context.font=`${style.italic?'italic':'normal'} ${style.bold?'bold':'normal'} ${style.sizePt*4/3}px ${fontStack(style.fontFamily)}`;
  context.fontKerning='none';
  const width=context.measureText(text).width*25.4/96;
  if(cache.size>10000) cache.clear();
  cache.set(key,width); return width;
}
