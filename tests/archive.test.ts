import { expect, test } from 'vitest';
import { strToU8, unzipSync, zipSync } from 'fflate';
import { newProject, replaceRange, bodyText } from '../src/core/model';
import { packProject, unpackProject, validateProject } from '../src/core/archive';
import { addRevision, type Revision } from '../src/core/history';

const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8coAAAAASUVORK5CYII=';
test('画像と元フォント指定を含む通常文書を往復できる',()=>{
  const p=replaceRange(newProject(),0,0,'日本語\n12月\f続き');
  p.baseStyle.fontFamily='不足フォント'; p.assets.a={id:'a',name:'写真.png',mime:'image/png',data:png};
  const read=unpackProject(packProject(p));
  expect(bodyText(read)).toBe('日本語\n12月\f続き');expect(read.assets.a.data).toBe(png);expect(read.baseStyle.fontFamily).toBe('不足フォント');
});
test('通常便箋は現在状態だけで履歴・UI設定・外部情報を持ち出さない',()=>{
  const p={...newProject(),history:['過去の秘密文'],appTheme:'dark',filePath:'private-path'};
  const archive=unzipSync(packProject(p));
  const text=new TextDecoder().decode(archive['project.json']);
  expect(text).not.toContain('過去の秘密文');expect(text).not.toContain('private-path');expect(text).not.toContain('appTheme');
  expect(Object.keys(archive)).toEqual(['project.json']);
});
test('未知version・不正値・危険な画像を拒否して入力を変更しない',()=>{
  const p=newProject();const original=JSON.stringify(p);
  expect(()=>validateProject({...p,version:999})).toThrow();
  expect(()=>validateProject({...p,baseStyle:{...p.baseStyle,sizePt:NaN}})).toThrow();
  expect(()=>validateProject({...p,assets:{a:{id:'a',name:'a',mime:'image/svg+xml',data:'data:image/svg+xml,<svg onload="alert(1)"/>'}}})).toThrow();
  expect(JSON.stringify(p)).toBe(original);
});
test('相対パストラバーサルを含むコンテナを拒否する',()=>{
  const bytes=zipSync({'project.json':strToU8(JSON.stringify(newProject())),'../evil':strToU8('bad')});
  expect(()=>unpackProject(bytes)).toThrow();
});
test('不足アセット参照で壊れた文書を読み込まない',()=>{
  const p=newProject();p.pages[0].background.assetId='missing';
  expect(()=>unpackProject(zipSync({'project.json':strToU8(JSON.stringify(p))}))).toThrow();
});
test('破損ZIPは元の編集状態へ取り込まない',()=>{expect(()=>unpackProject(new Uint8Array([0,1,2,3]))).toThrow();});
test('文法上は正常でもCRCの違う本文を破損として拒否する',()=>{
  const p=newProject();p.title='CRC_CHECK_TITLE';
  const bytes=zipSync({'project.json':strToU8(JSON.stringify(p))},{level:0});
  const marker=strToU8('CRC_CHECK_TITLE');
  const index=bytes.findIndex((_,i)=>marker.every((b,j)=>bytes[i+j]===b));
  expect(index).toBeGreaterThan(0);bytes[index]=65;
  expect(()=>unpackProject(bytes)).toThrow();
});
test('画像の名乗りと実データが異なる場合は拒否する',()=>{
  const p=newProject();p.assets.fake={id:'fake',name:'fake.png',mime:'image/png',data:'data:image/png;base64,PGh0bWw+'};
  expect(()=>packProject(p)).toThrow();
});
const rev=(i:number,protectedVersion=false):Revision=>({id:String(i),hash:`h${i}`,time:i,label:protectedVersion?'完成版':'',protected:protectedVersion,preview:'合成本文'});
test('通常履歴は50世代で保護版は枠外に保持する',()=>{
  let entries:Revision[]=[rev(0,true)];for(let i=1;i<=52;i++)entries=addRevision(entries,rev(i));
  expect(entries.length).toBe(51);expect(entries.some(e=>e.id==='0')).toBe(true);expect(entries.filter(e=>!e.protected).map(e=>e.id)).toEqual(Array.from({length:50},(_,i)=>String(i+3)));
});
test('同一内容を重複保存せず保護名の付与はできる',()=>{
  const entries=addRevision([rev(1)],{...rev(1,true),label:'送付版'});
  expect(entries).toHaveLength(1);expect(entries[0].protected).toBe(true);expect(entries[0].label).toBe('送付版');
});
