import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { defaultStyle, type Project, type TextStyle, type PageVisual, type FloatingObject, type Asset } from './model';
import {inspectImagePixels} from './image-budget';
import {ensureStationeryMargins} from './stationery-layout';
export const MAX_DOCUMENT_BYTES=64*1024*1024;
const error=()=>new Error('この便箋ファイルは破損しているか、対応していない内容を含んでいます。元のファイルは変更していません。');
const obj=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw error();return v as Record<string,unknown>;};
const string=(v:unknown,max=200)=>{if(typeof v!=='string'||v.length>max)throw error();return v;};
const key=(v:unknown)=>{const s=string(v,100);if(!/^[a-zA-Z0-9_-]+$/.test(s)||['__proto__','constructor','prototype'].includes(s))throw error();return s;};
const num=(v:unknown,min:number,max:number)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw error();return v;};
const integer=(v:unknown,min:number,max:number)=>{const n=num(v,min,max);if(!Number.isInteger(n))throw error();return n;};
const bool=(v:unknown)=>{if(typeof v!=='boolean')throw error();return v;};
const choice=<T extends string>(v:unknown,options:readonly T[]):T=>{if(typeof v!=='string'||!options.includes(v as T))throw error();return v as T;};
const color=(v:unknown)=>{const s=string(v,9);if(!/^#[0-9a-fA-F]{6}$/.test(s))throw error();return s;};
const array=(v:unknown,max:number):unknown[]=>{if(!Array.isArray(v)||v.length>max)throw error();return v;};
function style(v:unknown,partial=false):Partial<TextStyle> {
  const s=obj(v),out:Partial<TextStyle>={};
  for(const k of Object.keys(defaultStyle) as (keyof TextStyle)[]) {
    if(partial&&!Object.hasOwn(s,k))continue;
    switch(k){
      case 'fontFamily':out[k]=string(s[k],200);break;
      case 'sizePt':out[k]=num(s[k],6,72);break;
      case 'color':out[k]=color(s[k]);break;
      case 'verticalInlineMode':out[k]=choice(s[k],['auto','normal','tate-chu-yoko'] as const);break;
      default:out[k]=bool(s[k]);
    }
  }
  return out;
}
function visual(v:unknown):PageVisual {
  const p=obj(v),r=obj(p.ruling),m=obj(r.margins),b=obj(p.background);
  return {id:key(p.id),design:key(p.design),ruling:{enabled:bool(r.enabled),spacingMm:num(r.spacingMm,4,30),widthMm:num(r.widthMm,.05,2),color:color(r.color),margins:{top:num(m.top,0,290),right:num(m.right,0,290),bottom:num(m.bottom,0,290),left:num(m.left,0,290)}},background:{color:color(b.color),...(b.assetId?{assetId:key(b.assetId)}:{}),opacity:num(b.opacity,0,1),fit:choice(b.fit,['cover','contain','stretch']),x:num(b.x,0,100),y:num(b.y,0,100),scale:num(b.scale,.1,5)}};
}
function floating(v:unknown,textLength:number):FloatingObject {
  const o=obj(v);
  const kind=choice(o.kind,['image','text']);
  return {id:key(o.id),kind,...(kind==='image'?{assetId:key(o.assetId)}:{text:string(o.text,10000),style:style(o.style) as TextStyle}),anchorMode:choice(o.anchorMode,['flow','page']),anchorOffset:integer(o.anchorOffset,0,textLength),pageIndex:integer(o.pageIndex,0,999),x:num(o.x,-1000,1000),y:num(o.y,-1000,1000),width:num(o.width,1,600),height:num(o.height,1,600),rotation:num(o.rotation,-360,360),opacity:num(o.opacity,0,1),wrap:bool(o.wrap),paddingMm:num(o.paddingMm,0,50),hideRuling:bool(o.hideRuling),z:num(o.z,-1000,1000)};
}

export function validateProject(value: unknown): Project {
  const p=obj(value);
  if(p.format!=='binsen'||![1,2].includes(p.version as number))throw new Error('この文書の保存形式には対応していません。新しい版のレタリエで開いてください。');
  const settings=obj(p.settings),body=obj(p.body);
  const runs=array(body.runs,50000).map(v=>{const r=obj(v);return {text:string(r.text,200000),style:style(r.style,true)};});
  const length=runs.reduce((n,r)=>n+r.text.length,0);if(length>200000)throw error();
  const assets:Record<string,Asset>={},pixelBudget={pixels:0};let size=0;
  const rawAssets=obj(p.assets);if(Object.keys(rawAssets).length>200)throw error();
  for(const [id,value] of Object.entries(rawAssets)) {
    key(id);const a=obj(value),mime=choice(a.mime,['image/png','image/jpeg','image/webp','image/bmp','image/svg+xml']);
    const data=string(a.data,24*1024*1024);
    if(a.id!==id||!data.startsWith(`data:${mime};base64,`)||!/^[A-Za-z0-9+/]*={0,2}$/.test(data.slice(data.indexOf(',')+1)))throw error();
    const bytes=base64Bytes(data.slice(data.indexOf(',')+1));
    inspectImagePixels(mime,bytes,pixelBudget);
    size+=data.length;if(size>MAX_DOCUMENT_BYTES*4/3)throw error();
    assets[id]={id,name:string(a.name,200),mime,data};
    if(a.original){const original=obj(a.original),format=choice(original.format,['gif','webp','heic','heif','psd','ai','pdf']),raw=string(original.data,64*1024*1024);if(!/^[A-Za-z0-9+/]+={0,2}$/.test(raw))throw error();const source=base64Bytes(raw),tag=(at:number,n:number)=>String.fromCharCode(...source.subarray(at,at+n));
      if(!(format==='gif'&&/^GIF8[79]a$/.test(tag(0,6))||format==='webp'&&tag(0,4)==='RIFF'&&tag(8,4)==='WEBP'||(format==='heic'||format==='heif')&&tag(4,4)==='ftyp'||format==='psd'&&tag(0,4)==='8BPS'||(format==='ai'||format==='pdf')&&tag(0,5)==='%PDF-'))throw error();
      size+=raw.length;if(size>MAX_DOCUMENT_BYTES*4/3)throw error();assets[id]={...assets[id],original:{name:string(original.name,200),format,index:integer(original.index,0,999),data:raw}};}
  }
  const pages=array(p.pages,1000).map(visual);if(!pages.length)throw error();
  const continuation=visual(p.continuation);
  const objects=array(p.objects,200).map(v=>floating(v,length));
  const refs=[...pages,continuation].map(p=>p.background.assetId).concat(objects.filter(o=>o.kind==='image').map(o=>o.assetId));
  if(refs.some(id=>id&&!Object.hasOwn(assets,id)))throw error();
  if(new Set(objects.map(o=>o.id)).size!==objects.length)throw error();
  return ensureStationeryMargins({format:'binsen',version:2,id:key(p.id),title:string(p.title,200),settings:{paper:choice(settings.paper,['A4','B5','POSTCARD']),orientation:choice(settings.orientation,['portrait','landscape']),writingMode:choice(settings.writingMode,['horizontal','vertical']),orphanControl:bool(settings.orphanControl)},baseStyle:style(p.baseStyle) as TextStyle,body:{runs},pages,continuation,objects,assets,templateId:key(p.templateId)});
}

export function base64Bytes(value:string):Uint8Array {
  const raw=atob(value);return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
export function bytesBase64(bytes:Uint8Array):string {
  let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result);
}
export function packProject(project: Project): Uint8Array {
  const clean=validateProject(project);
  const files:Record<string,Uint8Array>={};
  const assets=Object.fromEntries(Object.values(clean.assets).map(a=>{
    files[`assets/${a.id}`]=base64Bytes(a.data.slice(a.data.indexOf(',')+1));
    const original=a.original?{name:a.original.name,format:a.original.format,index:a.original.index,path:`originals/${a.id}`}:undefined;
    if(a.original)files[`originals/${a.id}`]=base64Bytes(a.original.data);
    return [a.id,{id:a.id,name:a.name,mime:a.mime,path:`assets/${a.id}`,...(original?{original}:{})}];
  }));
  const manifest=strToU8(JSON.stringify({...clean,assets}));
  if(manifest.length>8*1024*1024)throw error();
  const packed=zipSync({'project.json':manifest,...files},{level:1,mtime:new Date('2020-01-01T00:00:00Z')});
  if(packed.length>MAX_DOCUMENT_BYTES)throw new Error('画像が多く、ファイルが64MBを超えています。画像を小さくして保存してください。');
  return packed;
}
const crcTable=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes:Uint8Array):number{let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export interface UnzipBudget {remaining:number}
export function safeUnzip(bytes:Uint8Array,max=MAX_DOCUMENT_BYTES,budget?:UnzipBudget):Record<string,Uint8Array> {
  if(bytes.length>max)throw error();
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  let end=bytes.length-22;
  for(;end>=Math.max(0,bytes.length-65557);end--)if(view.getUint32(end,true)===0x06054b50&&end+22+view.getUint16(end+20,true)===bytes.length)break;
  if(end<0||end<bytes.length-65557||view.getUint16(end+4,true)||view.getUint16(end+6,true)||view.getUint16(end+8,true)!==view.getUint16(end+10,true))throw error();
  const count=view.getUint16(end+10,true),directorySize=view.getUint32(end+12,true),directoryStart=view.getUint32(end+16,true);
  if(count>10000||directoryStart+directorySize!==end)throw error();
  const checks=new Map<string,{crc:number;size:number}>();let pos=directoryStart;
  for(let i=0;i<count;i++){
    if(pos+46>end||view.getUint32(pos,true)!==0x02014b50||view.getUint16(pos+8,true)&1||![0,8].includes(view.getUint16(pos+10,true)))throw error();
    const nameLength=view.getUint16(pos+28,true),next=pos+46+nameLength+view.getUint16(pos+30,true)+view.getUint16(pos+32,true);
    if(next>end)throw error();
    const name=strFromU8(bytes.subarray(pos+46,pos+46+nameLength));
    if(checks.has(name))throw error();checks.set(name,{crc:view.getUint32(pos+16,true),size:view.getUint32(pos+24,true)});pos=next;
  }
  if(pos!==end)throw error();
  let total=0;const names=new Set<string>();
  const files=unzipSync(bytes,{filter(file){
    if(names.has(file.name)||!/^([a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+$/.test(file.name)||file.name.split('/').some(part=>part==='.'||part==='..'))throw error();
    names.add(file.name);total+=file.originalSize;
    if(names.size>10000||file.originalSize>max||total>max)throw error();
    if(budget){budget.remaining-=file.originalSize;if(!Number.isFinite(budget.remaining)||budget.remaining<0)throw new Error('バックアップ全体の展開量が上限を超えています。現在の文書を通常ファイルとして保存してください。');}
    return true;
  }});
  if(Object.keys(files).length!==checks.size)throw error();
  for(const [name,file] of Object.entries(files)){const check=checks.get(name);if(!check||check.size!==file.length||check.crc!==crc32(file))throw error();}
  return files;
}
export function unpackProject(bytes:Uint8Array,budget?:UnzipBudget):Project{return unpackProjectInfo(bytes,budget).project;}
export function unpackProjectInfo(bytes: Uint8Array,budget?:UnzipBudget): {project:Project;sourceVersion:number} {
  try {
    const files=safeUnzip(bytes,MAX_DOCUMENT_BYTES,budget);
    if(!files['project.json']||files['project.json'].length>8*1024*1024)throw error();
    const p=obj(JSON.parse(strFromU8(files['project.json'])));
    const assets=obj(p.assets);
    const result:Record<string,unknown>={},expected=new Set(['project.json']);
    for(const [id,v] of Object.entries(assets)) {
      key(id);const asset=obj(v),path=`assets/${id}`;
      if(asset.path!==path||!files[path])throw error();
      expected.add(path);let original;
      if(asset.original){const o=obj(asset.original),originalPath=`originals/${id}`;if(o.path!==originalPath||!files[originalPath])throw error();expected.add(originalPath);original={name:o.name,format:o.format,index:o.index,data:bytesBase64(files[originalPath])};}
      result[id]={id,name:asset.name,mime:asset.mime,data:`data:${asset.mime};base64,${bytesBase64(files[path])}`,...(original?{original}:{})};
    }
    for(const name of Object.keys(files))if(!expected.has(name))throw error();
    return {project:validateProject({...p,assets:result}),sourceVersion:p.version as number};
  } catch(e) {if(e instanceof Error&&e.message.includes('保存形式'))throw e;throw error();}
}
