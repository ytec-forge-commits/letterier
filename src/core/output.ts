export interface Printable {left:number;top:number;width:number;height:number}
export function parsePageRange(value:string,count:number):number[]{
 if(!value.trim())return Array.from({length:count},(_,i)=>i);
 if(value.length>2000)throw Error('ページ範囲が長すぎます。');const pages=new Set<number>();
 for(const part of value.split(',')){const m=/^\s*(\d+)(?:\s*-\s*(\d+))?\s*$/.exec(part);if(!m)throw Error('ページは「1-3,5」のように指定してください。');const from=Number(m[1]),to=Number(m[2]??m[1]);if(from<1||to<from||to>count)throw Error(`ページ番号は1〜${count}の範囲で指定してください。`);for(let i=from;i<=to;i++)pages.add(i-1);}
 return [...pages].sort((a,b)=>a-b);
}
export function fitToPrintable(width:number,height:number,rect:Printable){
 if(![width,height,rect.width,rect.height].every(v=>Number.isFinite(v)&&v>0)||![rect.left,rect.top].every(v=>Number.isFinite(v)&&v>=0))throw Error('印刷可能範囲を確認できません。');
 const scale=Math.min(1,rect.width/width,rect.height/height);return {scale,left:rect.left+(rect.width-width*scale)/2,top:rect.top+(rect.height-height*scale)/2};
}
