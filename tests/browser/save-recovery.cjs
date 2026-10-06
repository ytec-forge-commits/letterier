async(page)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));const acceptDialog=dialog=>dialog.accept().catch(()=>{});page.on('dialog',acceptDialog);
 await page.setViewportSize({width:1280,height:720});await page.reload();
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 const body=()=>page.locator('.page-edit [data-token]').allTextContents().then(parts=>parts.join(''));
 const waitSaved=()=>page.getByRole('status').filter({hasText:'回復用データ保存済み'}).waitFor();
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();await page.keyboard.insertText('合成保存試験：最初の本文');await waitSaved();
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'保存履歴',exact:true}).click();
 const history=page.getByRole('dialog',{name:'保存履歴',exact:true});const closeHistory=()=>history.getByRole('button',{name:'閉じる',exact:true}).first().click();await history.getByLabel('保護版の名前',{exact:true}).fill('合成試験の戻り先');await history.getByRole('button',{name:'現在を保護版にする',exact:true}).click();await history.getByRole('button').filter({hasText:'★ 合成試験の戻り先'}).waitFor();await closeHistory();
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();await page.keyboard.press('End');await page.keyboard.insertText('／後からの変更');await waitSaved();
 if(await body()!=='合成保存試験：最初の本文／後からの変更')throw Error('Synthetic body editing failed');
 await page.reload();await startup.waitFor();if(await body()!=='')throw Error('Recovery was opened automatically');await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('button',{name:'前回の回復用データを開く',exact:true}).click();await waitSaved();
 if(await body()!=='合成保存試験：最初の本文／後からの変更')throw Error('Actual IndexedDB recovery lost the latest edit');
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'保存履歴',exact:true}).click();await history.getByRole('button').filter({hasText:'★ 合成試験の戻り先'}).click();await history.getByRole('button',{name:'この状態へ復元する',exact:true}).click();await history.waitFor({state:'hidden'});await waitSaved();
 if(await body()!=='合成保存試験：最初の本文')throw Error('History restore did not replace the body');
 await page.getByRole('button',{name:'保存履歴',exact:true}).click();await history.getByRole('button').filter({hasText:'★ 復元前の状態'}).waitFor();await page.screenshot({path:'output/playwright/save-recovery-history-1280.png'});await closeHistory();
 const downloadReady=page.waitForEvent('download');await page.getByRole('button',{name:'保存',exact:true}).first().click();const download=await downloadReady;await download.saveAs('output/playwright/save-recovery-synthetic.binsen');
 await page.reload();await startup.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('button',{name:'前回の回復用データを開く',exact:true}).click();await waitSaved();if(await body()!=='合成保存試験：最初の本文')throw Error('Restored body was not persisted across reload');
 // Only mutate the document generated above in this dedicated synthetic browser profile.
 const preserved=await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('binsen-kobo-local-v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const get=key=>new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const pointer=await get('session-current'),id=JSON.parse(new TextDecoder().decode(pointer)).id,key='draft-'+id,bytes=await get(key);await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(new Uint8Array([0,1,2]),key);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();return {key,bytes:Array.from(bytes)};});
 try{
  await page.reload();const failure=page.getByRole('dialog',{name:'前回の手紙を確認してください',exact:true});await failure.getByRole('alert').waitFor();await page.screenshot({path:'output/playwright/save-recovery-corrupt-1280.png'});
  await page.setViewportSize({width:375,height:720});if(await failure.evaluate(el=>el.scrollWidth>el.clientWidth+1))throw Error('Corrupt recovery dialog overflow at 375px');
  await failure.getByRole('button',{name:'ファイルを開く…',exact:true}).waitFor();await failure.getByRole('button',{name:'新しい手紙で始める',exact:true}).waitFor();
  await page.screenshot({path:'output/playwright/save-recovery-corrupt-375.png'});
  const kept=await page.evaluate(async key=>{const db=await new Promise(resolve=>{const r=indexedDB.open('binsen-kobo-local-v1',1);r.onsuccess=()=>resolve(r.result);});const bytes=await new Promise(resolve=>{const r=db.transaction('files').objectStore('files').get(key);r.onsuccess=()=>resolve(r.result);});db.close();return Array.from(bytes);},preserved.key);if(JSON.stringify(kept)!=='[0,1,2]')throw Error('Corrupt recovery was silently overwritten');
 }finally{
  await page.evaluate(async saved=>{const db=await new Promise(resolve=>{const r=indexedDB.open('binsen-kobo-local-v1',1);r.onsuccess=()=>resolve(r.result);});await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(new Uint8Array(saved.bytes),saved.key);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();},preserved);
  await page.setViewportSize({width:1280,height:720});
 }
 await page.reload();await startup.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('button',{name:'前回の回復用データを開く',exact:true}).click();await waitSaved();if(await body()!=='合成保存試験：最初の本文')throw Error('Retained draft could not be recovered after repair');
 if(errors.length)throw Error('Unhandled page errors: '+errors.join(';'));
 const result={actualIndexedDB:true,latestRecovery:true,explicitRecoveryOnly:true,restoreBeforeProtected:true,restoredBodySurvivesReload:true,manualDownload:download.suggestedFilename(),corruptDraftRetained:true,corruptDialog375NoOverflow:true,repairedRecovery:true,pageErrors:errors};await page.evaluate(value=>{window.__letterierSaveRecoveryQA=value;},result);page.off('dialog',acceptDialog);return result;
}
