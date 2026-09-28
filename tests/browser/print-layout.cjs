async(page)=>{
 await page.reload();
 await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.getByRole('status').filter({hasText:'自動保存済み'}).waitFor();
 await page.evaluate(()=>{
  window.isTauri=true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener:()=>{}};
  window.__printCalls=[];window.__nativeRequests=[];
  window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'main'},currentWebview:{label:'main'}},transformCallback:()=>0,unregisterCallback:()=>{},invoke:async(cmd,args)=>{
   window.__nativeRequests.push(cmd);
   if(cmd==='plugin:event|listen')return 0;
   if(cmd==='plugin:event|unlisten'||cmd==='local_write'||cmd==='local_remove')return;
   if(cmd==='local_read')return null;
   if(cmd==='list_printers')return {names:['合成プリンター'],default:'合成プリンター'};
   if(cmd==='printer_area')return {printer:'合成プリンター',width:210,height:297,left:4,top:5,printableWidth:200,printableHeight:285};
   if(cmd==='print_document'||cmd==='export_pdf'){
    const surface=document.querySelector('.print-output .print-transform');
    window.__printCalls.push({cmd,args,transform:getComputedStyle(surface).transform});
    if(cmd==='print_document')return new Promise(resolve=>{window.__completePrint=resolve;});
    return null;
   }
   throw Error('Unexpected synthetic native operation: '+cmd);
  }};
 });
 try{
  await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();
  const fit=page.getByRole('radio',{name:'紙面全体を印刷可能範囲へ縮小',exact:true});
  if(!await fit.isChecked())throw Error('標準設定で用紙端の飾りが切れる実寸印刷を選択しています');
  await page.waitForFunction(()=>document.querySelector('.output-settings')?.textContent?.includes('200.0'));
  const inspect=()=>page.locator('.output-preview-frame .print-transform').first().evaluate(el=>{
   const m=new DOMMatrix(getComputedStyle(el).transform);return {scale:m.a,x:m.e*25.4/96,y:m.f*25.4/96};
  });
  const preview=await inspect();
  if(Math.abs(preview.scale-200/210)>.00001||Math.abs(preview.x-4)>.01||preview.y<5)throw Error('プレビューが印刷可能範囲へ収まっていません: '+JSON.stringify(preview));
  await page.getByLabel('プレビューの内容',{exact:true}).selectOption('pdf');
  if((await inspect()).scale!==1||await page.locator('.output-preview-frame .printable-area-guide').count())throw Error('PDFプレビューへ印刷の縮小や範囲線が混入しました');
  await page.getByLabel('プレビューの内容',{exact:true}).selectOption('print');
  await page.screenshot({path:'output/playwright/print-fit-preview.png'});
  await page.getByRole('button',{name:'この設定で印刷する',exact:true}).click();
  await page.waitForFunction(()=>!!window.__completePrint);
  if(await page.locator('.print-output .printable-area-guide').count())throw Error('範囲の案内線が印刷内容へ混入しました');
  await page.emulateMedia({media:'print'});
  await page.pdf({path:'output/playwright/print-fit-output.pdf',printBackground:true,preferCSSPageSize:true});
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>window.__completePrint());
  await page.getByText('プリンターへ送信しました。用紙の出力結果をご確認ください。',{exact:true}).waitFor();
  const printed=await page.evaluate(()=>window.__printCalls.at(-1));
  if(Math.abs(Number(printed.transform.match(/matrix\(([^,]+)/)[1])-preview.scale)>.00001)throw Error('プレビューと送信する紙面の倍率が異なります');
  await page.getByRole('button',{name:'PDFとして保存…',exact:true}).click();
  await page.waitForFunction(()=>window.__printCalls.at(-1)?.cmd==='export_pdf');
  const pdf=await page.evaluate(()=>window.__printCalls.at(-1));
  if(pdf.transform!=='matrix(1, 0, 0, 1, 0, 0)')throw Error('印刷の縮小がPDFへ混入しました: '+pdf.transform);
  await page.getByRole('radio',{name:'実寸で印刷（100%）',exact:true}).check();
  const actual=await inspect();if(actual.scale!==1||actual.x!==0||actual.y!==0)throw Error('実寸プレビューの寸法が変わりました');
  await page.screenshot({path:'output/playwright/print-actual-preview.png'});
  if(errors.length)throw Error(errors.join('\n'));
  return {preview,printed,pdf,actual};
 }catch(e){throw Error(String(e)+' '+await page.locator('.output-settings').innerText()+' '+await page.evaluate(()=>JSON.stringify(window.__nativeRequests)));}finally{
  const close=page.getByRole('dialog',{name:'PDF・印刷の確認'}).getByRole('button',{name:'閉じる',exact:true});if(await close.count())await close.click();
  await page.evaluate(()=>{delete window.isTauri;});
 }
}
