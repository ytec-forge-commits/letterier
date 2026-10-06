async(page)=>{
 const errors=[];const pageError=error=>errors.push(error.message),accept=dialog=>dialog.accept().catch(()=>{});page.on('pageerror',pageError);page.on('dialog',accept);
 await page.setViewportSize({width:1280,height:720});await page.reload();await page.getByRole('dialog',{name:'新規作成',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 await page.evaluate(()=>{
  const original=IDBObjectStore.prototype.put;
  window.__letterierRetryFault={attempts:0,failures:1,restore:()=>{IDBObjectStore.prototype.put=original;}};
  IDBObjectStore.prototype.put=function(value,key){
   const fault=window.__letterierRetryFault;
   if(this.name==='files'&&typeof key==='string'&&key.startsWith('draft-')){
    fault.attempts++;
    if(fault.failures>0){fault.failures--;this.transaction.abort();throw new DOMException('Synthetic autosave transaction abort','QuotaExceededError');}
   }
   return original.call(this,value,key);
  };
 });
 try{
  await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();await page.keyboard.insertText('合成再試行：入力を止めても本文を守る');
  await page.getByRole('status').filter({hasText:'保存に失敗'}).waitFor();await page.getByRole('alert').filter({hasText:'Synthetic autosave transaction abort'}).waitFor();
  if(await page.evaluate(()=>window.__letterierRetryFault.attempts)!==1)throw Error('The first write did not fail in isolation');await page.screenshot({path:'output/playwright/autosave-retry-failure-1280.png'});
  await page.getByRole('status').filter({hasText:'回復用データ保存済み'}).waitFor({timeout:12000});
  if(await page.evaluate(()=>window.__letterierRetryFault.attempts)!==2)throw Error('Expected a single automatic retry without more typing');
  await page.getByRole('alert').filter({hasText:'Synthetic autosave transaction abort'}).waitFor({state:'hidden'});
  await page.screenshot({path:'output/playwright/autosave-retry-recovered-1280.png'});
 }finally{await page.evaluate(()=>window.__letterierRetryFault.restore());}
 await page.reload();const startup=page.getByRole('dialog',{name:'新規作成',exact:true});await startup.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('button',{name:'前回の回復用データを開く',exact:true}).click();await page.getByRole('status').filter({hasText:'回復用データ保存済み'}).waitFor();
 const text=(await page.locator('.page-edit [data-token]').allTextContents()).join('');if(text!=='合成再試行：入力を止めても本文を守る')throw Error('Automatic retry was not persisted to actual IndexedDB');
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'保存履歴',exact:true}).click();const history=page.getByRole('dialog',{name:'保存履歴',exact:true});
 await page.setViewportSize({width:375,height:720});if(await history.evaluate(el=>el.scrollWidth>el.clientWidth+1))throw Error('History modal overflows at 375px');await history.getByLabel('保護版の名前',{exact:true}).fill('合成375保護');await history.getByRole('button',{name:'現在を保護版にする',exact:true}).click();await history.getByRole('button').filter({hasText:'★ 合成375保護'}).waitFor();await page.screenshot({path:'output/playwright/save-recovery-history-375.png'});await history.getByRole('button',{name:'閉じる',exact:true}).first().click();
 if(errors.length)throw Error('Unhandled page errors: '+errors.join(';'));page.off('pageerror',pageError);page.off('dialog',accept);
 const result={abortedActualTransaction:true,automaticRetryWithoutTyping:true,recoveredAfterReload:true,history375NoOverflow:true,protectedRevisionAt375:true,pageErrors:errors};await page.evaluate(value=>{window.__letterierAutosaveRetryQA=value;},result);return result;
}
