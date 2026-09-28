import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import {bundledFonts,bundledFamily} from './core/bundled-fonts';
const host=document.getElementById('root')!;
host.textContent='レタリエのフォントを準備しています…';
async function start(){
 try{
  const loaded=await Promise.all(bundledFonts.flatMap(f=>[400,700].map(w=>document.fonts.load(`${w} 16px "${bundledFamily(f.name)}"`))));
  if(loaded.some(f=>!f.length))throw Error('missing font');
  createRoot(host).render(<React.StrictMode><App /></React.StrictMode>);
 }catch{host.replaceChildren();const message=document.createElement('p');message.textContent='同梱フォントを読み込めませんでした。アプリを再起動してください。改善しない場合は再インストールしてください。保存データは変更していません。';host.append(message);}
}
void start();
