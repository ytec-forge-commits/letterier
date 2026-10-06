async(page)=>{
 if(new URL(page.url()).origin!=='http://127.0.0.1:1420')throw Error('Isolated local development QA required');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});await startup.waitFor();await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 if(await page.locator('.page-edit [data-token]').count())throw Error('Fresh blank synthetic profile required');
 const read=()=>page.locator('.page-edit [data-token]').evaluateAll(ts=>ts.map(t=>({text:t.textContent,size:t.style.fontSize,family:t.style.fontFamily,color:t.style.color,weight:t.style.fontWeight,italic:t.style.fontStyle,underline:t.style.textDecoration})));
 const select=(start,end)=>page.evaluate(({start,end})=>{const ts=[...document.querySelectorAll('.page-edit [data-token]')],r=document.createRange();r.setStart(ts[start].firstChild,0);r.setEnd(ts[end-1].firstChild,ts[end-1].firstChild.textContent.length);const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));},{start,end});
 const results=[];
 for(const mode of ['horizontal','vertical']){
  await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption(mode);
  await page.getByRole('tab',{name:'ホーム',exact:true}).click();
  const edit=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('ABCDEF');
  await page.getByRole('button',{name:'本文の書式を一括変更…',exact:true}).click();const bulk=page.getByRole('dialog',{name:'本文の書式を一括変更',exact:true});await bulk.getByLabel('変更する範囲',{exact:true}).selectOption('all');await bulk.getByLabel('文字サイズ（pt）',{exact:true}).fill('14');await bulk.getByRole('button',{name:'一括変更する',exact:true}).click();
  await select(2,4);await page.getByLabel('文字サイズ（pt）',{exact:true}).fill('24');
  await select(2,4);await page.getByRole('button',{name:'選択部分のフォント',exact:true}).click();const picker=page.getByRole('dialog',{name:'フォントを選択',exact:true});await picker.getByRole('button',{name:'Yomogi',exact:true}).first().click();await picker.getByRole('button',{name:'このフォントを使う',exact:true}).click();
  await select(2,4);if(!await page.getByRole('button',{name:'太字',exact:true}).getAttribute('aria-pressed').then(x=>x==='true'))await page.getByRole('button',{name:'太字',exact:true}).click();
  const before=await read();if(before.map(t=>t.size).join(',')!=='14pt,14pt,24pt,24pt,14pt,14pt')throw Error('Mixed fixture not established');
  await select(0,6);const size=page.getByLabel('文字サイズ（pt）',{exact:true});
  const mixedDisplay=await size.inputValue();await size.click();await page.keyboard.press('Control+a');await size.pressSequentially('14');await page.keyboard.press('Tab');
  const after=await read();if(after.some(t=>t.size!=='14pt'))throw Error('Entering the leading 14pt failed to normalize the mixed selection: '+after.map(t=>t.size).join(','));
  if(mixedDisplay!=='')throw Error('Mixed sizes must not display the first size as a uniform value');
  const withoutSize=xs=>xs.map(({size,...rest})=>rest);if(JSON.stringify(withoutSize(after))!==JSON.stringify(withoutSize(before)))throw Error('Size change altered other formatting');
  await page.getByRole('button',{name:'元に戻す',exact:true}).click();if(JSON.stringify(await read())!==JSON.stringify(before))throw Error('One Undo failed to restore mixed formatting');
  await select(0,6);await size.fill('14');await page.getByRole('status').filter({hasText:'回復用データ保存済み'}).waitFor();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'保存',exact:true}).first().click();const download=await pending;await download.saveAs(`output/playwright/mixed-size-${mode}.binsen`);
  const saved=await read();await page.reload();await startup.waitFor();await startup.getByRole('button',{name:'閉じる',exact:true}).click();if(await page.locator('.page-edit [data-token]').count())throw Error('Unexpected automatic reopen');await page.getByRole('button',{name:'前回の回復用データを開く',exact:true}).click();await page.getByRole('status').filter({hasText:'回復用データ保存済み'}).waitFor();if(JSON.stringify(await read())!==JSON.stringify(saved))throw Error('Explicit recovery changed normalized formatting');
  await page.screenshot({path:`output/playwright/mixed-size-${mode}-1280.png`});results.push({mode,leadingValueNormalization:true,formatPreserved:true,oneUndo:true,manualDownload:true,blankStartup:true,explicitRecovery:true});
 }
 if(errors.length)throw Error(errors.join(';'));return {results,pageErrors:errors};
}
