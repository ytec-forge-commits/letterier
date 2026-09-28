async(page)=>{
 if(await page.getByRole('button',{name:/Start a new letter|新しい手紙で始める/}).count())await page.getByRole('button',{name:/Start a new letter|新しい手紙で始める/}).click();
 for(let guard=0;guard<5&&await page.getByRole('dialog').count();guard++)await page.getByRole('dialog').last().getByRole('button',{name:/Close|閉じる/}).click();
 await page.reload();
 if(await page.getByRole('button',{name:/Start a new letter|新しい手紙で始める/}).count())await page.getByRole('button',{name:/Start a new letter|新しい手紙で始める/}).click();
 await page.evaluate(()=>{
  window.isTauri=true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener:()=>{}};
  window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'main'},currentWebview:{label:'main'}},transformCallback:()=>0,unregisterCallback:()=>{},invoke:async cmd=>{
   if(cmd==='export_pdf')return new Promise(resolve=>{window.__completePdf=resolve;});
   if(cmd==='plugin:event|listen')return 0;
   if(cmd==='plugin:event|unlisten'||cmd==='local_write'||cmd==='local_remove')return;
   if(cmd==='local_read')return null;
   if(cmd==='list_printers')return {names:[],default:null};
   throw Error('Unexpected synthetic native operation: '+cmd);
  }};
 });
 await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();
 await page.getByRole('dialog',{name:'PDF・印刷の確認'}).waitFor();
 await page.getByRole('button',{name:'PDFとして保存…',exact:true}).click();
 await page.locator('.print-output .paper-art').first().waitFor();
 await page.emulateMedia({media:'print'});
 try{
  const colors=await page.evaluate(()=>({canvas:getComputedStyle(document.documentElement).backgroundColor,body:getComputedStyle(document.body).backgroundColor,paper:getComputedStyle(document.querySelector('.print-output .paper-art')).backgroundColor}));
  // Printer margins and the space exposed by uniform shrinking must be unpainted white,
  // while the letter's own selected paper color must remain in the page artwork.
  if(colors.canvas!=='rgb(255, 255, 255)'||colors.body!=='rgb(255, 255, 255)')throw Error('印刷用紙の外側へ操作画面の背景色が混入します: '+JSON.stringify(colors));
  await page.pdf({path:'output/playwright/print-line-after.pdf',printBackground:true,preferCSSPageSize:true});
  await page.evaluate(()=>window.__completePdf());
  return colors;
 }finally{
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.__completePdf?.();delete window.isTauri;});
  await page.getByRole('dialog',{name:'PDF・印刷の確認'}).getByRole('button',{name:'閉じる',exact:true}).click();
 }
}
