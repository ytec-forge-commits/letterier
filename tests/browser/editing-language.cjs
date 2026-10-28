async page=>{
 const close=page.locator('dialog[open]').getByRole('button',{name:/^(閉じる|Close)$/});if(await close.count())await close.last().click();
 await page.getByRole('tab',{name:/^(ヘルプ|Help)$/}).click();await page.getByRole('button',{name:/^(設定・使い方|Settings & Help)$/}).click();
 let dialog=page.locator('dialog[open]');await dialog.getByLabel(/^(表示言語|Display language)$/).selectOption('en');await dialog.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('tab',{name:'Home',exact:true}).click();
 await page.getByLabel('Print page numbers',{exact:true}).check();await page.getByLabel('Align line ends',{exact:true}).check();
 const text='ホーム・保存・日本語の合成本文\n改行後';const body=page.locator('.page-edit').first();await body.click();await page.keyboard.press('Control+a');await page.keyboard.insertText(text);await page.keyboard.insertText('変更');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await page.getByRole('button',{name:'Redo',exact:true}).click();
 if((await page.locator('.page-edit [data-history-highlight]').allTextContents()).join('')!=='変更')throw Error('English UI lost redo feedback');
 await page.waitForFunction(()=>!document.querySelector('.page-edit [data-history-highlight]'),null,{timeout:7000});
 await page.getByRole('tab',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Settings & Help',exact:true}).click();dialog=page.locator('dialog[open]');await dialog.getByLabel('Display language',{exact:true}).selectOption('ja');await dialog.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 await page.getByLabel('ページ番号を印刷',{exact:true}).uncheck();await page.getByLabel('行末を揃える',{exact:true}).uncheck();
 const actual=(await page.locator('.page-edit').allTextContents()).join('').replaceAll('\u200b','');if(actual!==text+'変更')throw Error('Language switching altered document text: '+actual);
 await page.getByRole('button',{name:'本文の書式を一括変更…',exact:true}).click();await page.getByRole('dialog',{name:'本文の書式を一括変更',exact:true}).getByLabel('文字サイズを揃える',{exact:true}).waitFor();await page.getByRole('button',{name:'キャンセル',exact:true}).click();
 return {newControlsInEnglish:true,historyFeedbackExpires:true,bodyUnchanged:true,japaneseNewDialogs:true};
}
