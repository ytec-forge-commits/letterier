import {expect,test} from 'vitest';
import {zipSync,strToU8,unzipSync} from 'fflate';
import {newProject} from '../src/core/model';
import {bytesBase64,packProject,safeUnzip,unpackProject} from '../src/core/archive';
import {inspectSvg} from '../src/core/svg';
import {DocumentRepository,type KeyValueStore} from '../src/persistence/repository';

function png(width:number,height:number){const bytes=new Uint8Array(33);bytes.set([137,80,78,71,13,10,26,10]);const view=new DataView(bytes.buffer);view.setUint32(8,13);bytes.set(new TextEncoder().encode('IHDR'),12);view.setUint32(16,width);view.setUint32(20,height);return bytes;}
function documentWith(images:Uint8Array[]){const p=newProject(),files:Record<string,Uint8Array>={};const assets=Object.fromEntries(images.map((bytes,i)=>{const id=`image${i}`;files[`assets/${id}`]=bytes;return [id,{id,name:'合成画像.png',mime:'image/png',path:`assets/${id}`}];}));return zipSync({'project.json':strToU8(JSON.stringify({...p,assets})),...files});}
test('文書から開く巨大画像を背景・配置・プレビューの描画前に拒否する',()=>{
 expect(()=>unpackProject(documentWith([png(100000,100000)]))).toThrow();
 expect(()=>unpackProject(documentWith([png(6000,6000),png(6000,6000),png(6000,6000)]))).toThrow();
 expect(Object.keys(unpackProject(documentWith([png(120,80)])).assets)).toHaveLength(1);
});
test('小型SVGに埋め込まれた巨大ラスターも描画前に拒否する',()=>{
 const svg=(bytes:Uint8Array)=>`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><image width="10" height="10" href="data:image/png;base64,${bytesBase64(bytes)}"/></svg>`;
 expect(()=>inspectSvg(svg(png(100000,100000)))).toThrow();
 expect(inspectSvg(svg(png(120,80)))).toEqual({width:10,height:10});
});
test('表示用アセットのアニメーションWebPを静止画像として信用しない',()=>{
 const bytes=new Uint8Array(46);bytes.set(new TextEncoder().encode('RIFF'));bytes.set(new TextEncoder().encode('WEBPVP8X'),8);const v=new DataView(bytes.buffer);v.setUint32(16,10,true);bytes[20]=2;bytes[24]=9;bytes[27]=9;bytes.set(new TextEncoder().encode('ANMF'),30);v.setUint32(34,8,true);
 const p=newProject();p.assets.a={id:'a',name:'a.webp',mime:'image/webp',data:`data:image/webp;base64,${bytesBase64(bytes)}`};expect(()=>packProject(p)).toThrow();
});
test('APNGのフレーム宣言を静止PNGとして保存文書に通さない',()=>{
 const bytes=new Uint8Array(65),v=new DataView(bytes.buffer);bytes.set(png(10,10));v.setUint32(8,13);bytes.set(new TextEncoder().encode('IHDR'),12);v.setUint32(33,8);bytes.set(new TextEncoder().encode('acTL'),37);v.setUint32(41,2);expect(()=>unpackProject(documentWith([bytes]))).toThrow();
});
test('ネストしたZIPは呼出しをまたぐ展開予算を共有する',()=>{
 const budget={remaining:10},bytes=zipSync({a:strToU8('123456')});
 expect(safeUnzip(bytes,1000,budget).a).toHaveLength(6);
 expect(()=>safeUnzip(bytes,1000,budget)).toThrow();
});
class Store implements KeyValueStore {data=new Map<string,Uint8Array>();writes=0;async get(key:string){return this.data.get(key)??null;}async put(key:string,bytes:Uint8Array){this.writes++;this.data.set(key,bytes);}async remove(key:string){this.data.delete(key);}}
test('バックアップ内の重複履歴は一件も書き込まず拒否する',async()=>{
 const source=new DocumentRepository(new Store()),p=newProject();await source.snapshot(p,'保護版');const files=unzipSync(await source.exportBackup(p));const meta=JSON.parse(new TextDecoder().decode(files['history.json']));meta.history=Array.from({length:2000},()=>meta.history[0]);files['history.json']=strToU8(JSON.stringify(meta));
 const store=new Store(),target=new DocumentRepository(store);await expect(target.importBackup(zipSync(files))).rejects.toThrow();expect(store.writes).toBe(0);
});
