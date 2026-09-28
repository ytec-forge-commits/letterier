import {bytesBase64} from '../core/archive';
import {inspectPsd} from '../core/design-image';
import type {FrameSource} from './FrameDialog';
// Conversion is local; imported originals are retained separately from display PNGs.
export async function decodePsd(bytes:Uint8Array):Promise<{data:string;width:number;height:number}>{
 inspectPsd(bytes);
 const worker=new Worker(new URL('./psd.worker.ts',import.meta.url),{type:'module'});
 return new Promise((resolve,reject)=>{const end=()=>{clearTimeout(timer);worker.terminate();};const timer=setTimeout(()=>{end();reject(Error('PSDの変換が30秒以内に終わりませんでした。統合PNGに書き出してください。'));},30000);worker.onerror=()=>{end();reject(Error('PSDの変換に失敗しました。統合PNGをお試しください。'));};worker.onmessage=event=>{end();const r=event.data as {error?:string;data:ArrayBuffer;width:number;height:number};if(r.error)reject(Error(r.error));else resolve({...r,data:`data:image/png;base64,${bytesBase64(new Uint8Array(r.data))}`});};worker.postMessage(bytes.slice().buffer);});
}
export async function decodePdf(bytes:Uint8Array,name:string,pick:(source:FrameSource)=>Promise<number|null>){
 const pdfjs=await import('pdfjs-dist');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).href;
 const base=new URL('pdf-assets/',document.baseURI).href;
 const loading=pdfjs.getDocument({data:bytes.slice(),cMapUrl:`${base}cmaps/`,cMapPacked:true,standardFontDataUrl:`${base}standard_fonts/`,wasmUrl:`${base}wasm/`,useSystemFonts:false,enableXfa:false,maxImageSize:16_000_000,canvasMaxAreaInBytes:64_000_000,stopAtErrors:true});
 const timer=setTimeout(()=>{void loading.destroy();},30000);
 let chain:Promise<unknown>=Promise.resolve();
 try{const pdf=await loading.promise;clearTimeout(timer);if(pdf.numPages<1||pdf.numPages>200)throw Error('PDF互換素材は200ページまでです。');
  const render=(index:number,thumbnail:boolean)=>{const job=chain.then(async()=>{const page=await pdf.getPage(index+1);const view=page.getViewport({scale:1});const scale=thumbnail?Math.min(1,500/Math.max(view.width,view.height)):Math.min(300/72,Math.sqrt(16_000_000/(view.width*view.height)),16384/Math.max(view.width,view.height));const viewport=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const task=page.render({canvas:null,canvasContext:canvas.getContext('2d',{alpha:true})!,viewport,background:'rgba(0,0,0,0)',annotationMode:pdfjs.AnnotationMode.DISABLE});const timeout=setTimeout(()=>task.cancel(),30000);try{await task.promise;return {data:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height};}finally{clearTimeout(timeout);page.cleanup();canvas.width=0;canvas.height=0;}});chain=job.catch(()=>{});return job;};
  const index=pdf.numPages===1?0:await pick({name,count:pdf.numPages,unit:'ページ',thumbnail:async i=>(await render(i,true)).data});if(index===null)return null;const result=await render(index,false);if(result.data.length>24*1024*1024)throw Error('変換画像が大きすぎます。小さい素材に書き出してください。');return {...result,index};
 }catch(e){if(e instanceof Error&&e.name==='PasswordException')throw Error('暗号化されたPDF互換素材には対応していません。保護されていない画像に書き出してください。');throw Error(`PDF互換素材を読み込めません。${e instanceof Error?e.message:String(e)}`);}finally{clearTimeout(timer);await chain;await loading.destroy();}
}


