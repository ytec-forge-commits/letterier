async(page)=>{
 const identifier=await page.evaluate(()=>window.__TAURI_INTERNALS__?.invoke('plugin:app|identifier'));
 if(identifier!=='jp.ytec.binsen-kobo.qa-output-20261002')throw Error('Dedicated synthetic output application required');
 if((await page.locator('.page-edit [data-token]').allTextContents()).join('')!=='')throw Error('Fresh synthetic document required');
 const dialog=page.getByRole('dialog',{name:'新規作成',exact:true});await dialog.waitFor();
 await dialog.getByRole('button',{name:'紅葉の彩り 和風 · 秋',exact:true}).click();
 await dialog.getByLabel('図案',{exact:true}).selectOption('5');
 await dialog.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();await dialog.waitFor({state:'hidden'});
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();
 await page.keyboard.insertText('合成PDF試験 第一頁。\n「ありがとう」123。');
 await page.keyboard.press('Control+Enter');await page.keyboard.insertText('合成PDF試験 第二頁。\nDear friend 456.');
 const expected='合成PDF試験 第一頁。\n「ありがとう」123。\f合成PDF試験 第二頁。\nDear friend 456.';
 if(await page.locator('.paper-scroll .sheet-frame').count()!==2)throw Error('Synthetic two-page fixture required');
 const body=(await page.locator('.page-edit [data-token]').allTextContents()).join('');
 if(!body.includes('合成PDF試験 第一頁。')||!body.includes('合成PDF試験 第二頁。'))throw Error('Synthetic text insertion lost');
 await page.evaluate(({identifier,expected})=>{window.__letterierOutputQA={identifier,expected,results:[]};},{identifier,expected});
 return {identifier,pages:2,body};
}
