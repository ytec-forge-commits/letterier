import {initializeCanvas,readPsd} from 'ag-psd';
import {inspectPsd} from '../core/design-image';
initializeCanvas((w,h)=>new OffscreenCanvas(w,h) as unknown as HTMLCanvasElement,(w,h)=>new ImageData(w,h));
self.onmessage=async(event:MessageEvent<ArrayBuffer>)=>{
 try{
  const bytes=new Uint8Array(event.data),size=inspectPsd(bytes);
  const psd=readPsd(bytes,{skipLayerImageData:true,skipLinkedFilesData:true,skipThumbnail:true,useImageData:true,totalMemoryLimit:256*1024*1024});
  if(!psd.imageData)throw Error('統合画像がありません。Photoshopの「互換性を優先」で保存するか、PNGに書き出してください。');
  const canvas=new OffscreenCanvas(size.width,size.height),ctx=canvas.getContext('2d');if(!ctx)throw Error('画像を描画できません。');
  ctx.putImageData(new ImageData(new Uint8ClampedArray(psd.imageData.data),size.width,size.height),0,0);
  const blob=await canvas.convertToBlob({type:'image/png'});if(blob.size>16*1024*1024)throw Error('統合画像が16MBを超えます。画像を小さくしてください。');
  const data=await blob.arrayBuffer();self.postMessage({...size,data},{transfer:[data]});
 }catch(e){self.postMessage({error:`PSDを読み込めません。${e instanceof Error?e.message:String(e)}`});}
};
