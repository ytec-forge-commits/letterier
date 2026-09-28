import type {Asset} from './model';
import {chargePixels,staticRasterInfo,type PixelBudget} from './image-info';
import {inspectSvg} from './svg';
export function inspectImagePixels(mime:string,bytes:Uint8Array,budget:PixelBudget){
 if(mime==='image/svg+xml')inspectSvg(new TextDecoder('utf-8',{fatal:true}).decode(bytes),budget);
 else{const size=staticRasterInfo(bytes,mime);chargePixels(budget,size.width*size.height);}
}
// Asset fields are immutable in the editor; avoid decoding unchanged data on each keystroke.
const pixelsByAsset=new WeakMap<Asset,number>();
export function assertImageBudget(assets:Record<string,Asset>){
 const total={pixels:0};
 for(const asset of Object.values(assets)){
  let pixels=pixelsByAsset.get(asset);
  if(pixels===undefined){const budget={pixels:0},raw=atob(asset.data.slice(asset.data.indexOf(',')+1));inspectImagePixels(asset.mime,Uint8Array.from(raw,c=>c.charCodeAt(0)),budget);pixels=budget.pixels;pixelsByAsset.set(asset,pixels);}
  chargePixels(total,pixels);
 }
}
