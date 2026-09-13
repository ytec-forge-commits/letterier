import type {FrameSource} from './FrameDialog';
interface DecodedFrame {displayWidth:number;displayHeight:number;close:()=>void}
interface Decoder {tracks:{ready:Promise<void>;selectedTrack:{frameCount:number}|null};decode:(o:{frameIndex:number})=>Promise<{image:DecodedFrame}>;close:()=>void}
type DecoderConstructor=new(options:{data:Uint8Array;type:string})=>Decoder;
export async function chooseAnimationFrame(bytes:Uint8Array,mime:string,name:string,pick:(source:FrameSource)=>Promise<number|null>){
 const Factory=(globalThis as unknown as {ImageDecoder?:DecoderConstructor}).ImageDecoder;if(!Factory)throw Error('この環境ではコマ選択を利用できません。Microsoft Edge WebView2を更新してから、もう一度お試しください。');
 const decoder=new Factory({data:bytes,type:mime});let chain:Promise<unknown>=Promise.resolve();
 const render=(index:number,thumbnail:boolean):Promise<{data:string;width:number;height:number}>=>{
  const job=chain.then(async()=>{const {image}=await decoder.decode({frameIndex:index});try{const ratio=thumbnail?Math.min(1,500/Math.max(image.displayWidth,image.displayHeight)):1;const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.displayWidth*ratio));canvas.height=Math.max(1,Math.round(image.displayHeight*ratio));const ctx=canvas.getContext('2d');if(!ctx)throw Error('画像を描画できません。');ctx.drawImage(image as unknown as CanvasImageSource,0,0,canvas.width,canvas.height);return {data:canvas.toDataURL('image/png'),width:image.displayWidth,height:image.displayHeight};}finally{image.close();}});chain=job.catch(()=>{});return job;
 };
 try{await decoder.tracks.ready;const count=decoder.tracks.selectedTrack?.frameCount??0;if(count<1||count>500)throw Error('この素材のコマ数を確認できません。');const index=count===1?0:await pick({name,count,thumbnail:async i=>(await render(i,true)).data});if(index===null){await chain;return null;}const frame=await render(index,false);return {...frame,index};}finally{decoder.close();}
}
