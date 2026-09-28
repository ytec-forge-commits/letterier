export interface ImageInfo {mime:string;width:number;height:number;frames?:number}
export const MAX_DOCUMENT_PIXELS=80_000_000;
export interface PixelBudget {pixels:number}
export function chargePixels(budget:PixelBudget,pixels:number){budget.pixels+=pixels;if(!Number.isFinite(budget.pixels)||budget.pixels>MAX_DOCUMENT_PIXELS)throw Error('文書内の画像は合計8000万画素までです。画像を小さくするか、別の手紙に分けてください。');}
export function staticRasterInfo(bytes:Uint8Array,mime:string){const info=imageInfo(bytes);if(!info||info.mime!==mime||info.frames!==undefined)throw Error('表示用の画像は静止したPNG・JPEG・WebP・BMPである必要があります。');return info;}
export function checkPixels(width:number,height:number){if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>16384||height>16384||width*height>40_000_000)throw Error('画像は4000万画素・一辺16384画素までです。画像サイズを小さくして追加してください。');}
export function imageInfo(bytes:Uint8Array):ImageInfo|null{
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),match=(a:number[],at=0)=>a.every((n,i)=>bytes[at+i]===n),tag=(at:number,n=4)=>String.fromCharCode(...bytes.subarray(at,at+n));
 const bad=():never=>{throw Error('画像の構造が破損しているか、対応していない種類の画像です。別名で保存した画像をお試しください。');};
 let mime='',width=0,height=0,frames:number|undefined;
 if(match([137,80,78,71,13,10,26,10])){if(bytes.length<24)bad();mime='image/png';width=v.getUint32(16);height=v.getUint32(20);for(let p=8;p+12<=bytes.length;){const length=v.getUint32(p);if(p+12+length>bytes.length)bad();if(tag(p+4)==='acTL'){if(length!==8)bad();frames=v.getUint32(p+8);if(!frames)bad();}p+=12+length;}}
 else if(match([66,77])){if(bytes.length<26)bad();mime='image/bmp';const dib=v.getUint32(14,true);width=dib===12?v.getUint16(18,true):Math.abs(v.getInt32(18,true));height=dib===12?v.getUint16(20,true):Math.abs(v.getInt32(22,true));}
 else if(match([255,216,255])){mime='image/jpeg';let p=2;while(p+3<bytes.length){if(bytes[p++]!==255)bad();while(bytes[p]===255)p++;const marker=bytes[p++];if(marker===217||marker===218)break;if(marker===1||marker>=208&&marker<=215)continue;if(p+2>bytes.length)bad();const size=v.getUint16(p);if(size<2||p+size>bytes.length)bad();if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){if(size<7)bad();height=v.getUint16(p+3);width=v.getUint16(p+5);break;}p+=size;}if(!width||!height)bad();}
 else if(tag(0,6)==='GIF87a'||tag(0,6)==='GIF89a'){
  if(bytes.length<13)bad();mime='image/gif';width=v.getUint16(6,true);height=v.getUint16(8,true);checkPixels(width,height);frames=0;let p=13+(bytes[10]&128?3*(2**((bytes[10]&7)+1)):0),trailer=false;
  const blocks=()=>{while(p<bytes.length){const length=bytes[p++];if(!length)return;p+=length;if(p>bytes.length)bad();}bad();};
  while(p<bytes.length){const type=bytes[p++];if(type===59){trailer=true;break;}if(type===33){p++;blocks();}else if(type===44){if(p+9>bytes.length)bad();const fw=v.getUint16(p+4,true),fh=v.getUint16(p+6,true);checkPixels(fw,fh);const flags=bytes[p+8];p+=9+(flags&128?3*2**((flags&7)+1):0);p++;blocks();frames++;if(frames>500||frames*width*height>200_000_000)throw Error('このGIFはコマ数または画像サイズが大きすぎます。500コマ・全コマ合計2億画素までの素材を使用してください。');}else bad();}
  if(!trailer||!frames)bad();
 }
 else if(tag(0)==='RIFF'&&tag(8)==='WEBP'){
  mime='image/webp';if(bytes.length<21)bad();const codec=tag(12);
  if(codec==='VP8X'){if(bytes.length<30)bad();width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16);if(bytes[20]&2){frames=0;for(let p=12;p+8<=bytes.length;){const length=v.getUint32(p+4,true);if(p+8+length>bytes.length)bad();if(tag(p)==='ANMF')frames++;p+=8+length+(length&1);}if(!frames||frames>500||frames*width*height>200_000_000)throw Error('アニメーションWebPのコマ数または画像サイズが大きすぎます。');}}
  else if(codec==='VP8L'){if(bytes.length<25)bad();const data=v.getUint32(21,true);width=1+(data&0x3fff);height=1+((data>>>14)&0x3fff);}
  else if(codec==='VP8 '){if(bytes.length<30)bad();if(!match([157,1,42],23))bad();width=v.getUint16(26,true)&0x3fff;height=v.getUint16(28,true)&0x3fff;}else bad();
 }
 else return null;
 checkPixels(width,height);return {mime,width,height,...(frames===undefined?{}:{frames})};
}
