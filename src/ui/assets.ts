import { bytesBase64 } from '../core/archive';
import { uid,type Asset } from '../core/model';
import {invoke,isTauri} from '@tauri-apps/api/core';
import {designFormat} from '../core/design-image';
import {decodePsd,decodePdf} from './designImages';
import {imageInfo} from '../core/image-info';
import {inspectSvg} from '../core/svg';
import {chooseAnimationFrame} from './frames';
import type {FrameSource} from './FrameDialog';
export const imageAccept='.jpg,.jpeg,.png,.webp,.bmp,.svg,.gif,.heic,.heif,.psd,.ai,.pdf';
export async function readImage(file:File,pick:(source:FrameSource)=>Promise<number|null>):Promise<{asset:Asset;width:number;height:number}|null>{
  if(file.size>16*1024*1024)throw new Error('画像は1枚16MBまでです。画像を小さくして追加してください。');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const head=new TextDecoder().decode(bytes.subarray(0,500)).trimStart();
  if(file.name.toLowerCase().endsWith('.svg')||head.startsWith('<svg')||head.startsWith('<?xml')){
    const source=new TextDecoder('utf-8',{fatal:true}).decode(bytes),size=inspectSvg(source);
    return {asset:{id:uid(),name:file.name.slice(0,200),mime:'image/svg+xml',data:`data:image/svg+xml;base64,${bytesBase64(bytes)}`},...size};
  }
  const format=designFormat(bytes,file.name);
  if(format){
    let result:{data:string;width:number;height:number;index?:number}|null;
    if(format==='psd')result=await decodePsd(bytes);
    else if(format==='ai'||format==='pdf')result=await decodePdf(bytes,file.name,pick);
    else{
      if(!isTauri())throw Error('HEIC/HEIFはWindows版で利用できます。Windowsの画像コーデックが必要です。');
      const decoded=await invoke<{png:number[];width:number;height:number}>('decode_heif',{bytes:Array.from(bytes)});
      result={data:`data:image/png;base64,${bytesBase64(new Uint8Array(decoded.png))}`,width:decoded.width,height:decoded.height};
    }
    if(!result)return null;
    return {asset:{id:uid(),name:file.name.slice(0,200),mime:'image/png',data:result.data,original:{name:file.name.slice(0,200),format,data:bytesBase64(bytes),index:result.index??0}},width:result.width,height:result.height};
  }
  const info=imageInfo(bytes);if(!info)throw Error('対応する画像素材を選んでください。拡張子だけを変更したファイルは読み込めません。');
  if(info.mime==='image/png'&&info.frames!==undefined)throw Error('アニメーションPNGには対応していません。静止PNG、またはGIF・WebPに書き出してください。');
  if(info.mime==='image/gif'||info.frames){
    const frame=await chooseAnimationFrame(bytes,info.mime,file.name,pick);if(!frame)return null;
    if(frame.data.length>24*1024*1024)throw Error('選択したコマの画像が大きすぎます。小さい素材を使用してください。');
    return {asset:{id:uid(),name:file.name.slice(0,200),mime:'image/png',data:frame.data,original:{name:file.name.slice(0,200),format:info.mime==='image/gif'?'gif':'webp',data:bytesBase64(bytes),index:frame.index}},width:frame.width,height:frame.height};
  }
  let bitmap:ImageBitmap;
  try{bitmap=await createImageBitmap(new Blob([bytes],{type:info.mime}),{imageOrientation:'from-image'});}catch{throw new Error('この画像を復号できません。ファイルの破損や未対応の圧縮方式が考えられます。別名で保存した画像をお試しください。');}
  const width=bitmap.width,height=bitmap.height;bitmap.close();
  return {asset:{id:uid(),name:file.name.slice(0,200),mime:info.mime,data:`data:${info.mime};base64,${bytesBase64(bytes)}`},width,height};
}
