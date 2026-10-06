async(page)=>{
 const old=page.getByRole('dialog',{name:'新規作成',exact:true});if(await old.count())await old.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('button',{name:'保存',exact:true}).first().click();await page.getByRole('status').filter({hasText:'ファイル保存済み'}).waitFor();await page.reload();
 await page.getByRole('tab',{name:'ホーム',exact:true}).waitFor({timeout:90000});
 const dialog=page.getByRole('dialog',{name:'新規作成',exact:true});
 await dialog.waitFor({timeout:30000});
 if((await page.locator('.page-edit [data-token]').allTextContents()).join(''))throw Error('前回の本文が自動表示されています');
 await dialog.getByRole('button',{name:'白の和紙 和風 · 通年',exact:true}).click();
 await dialog.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();await dialog.waitFor({state:'hidden'});
 await page.locator('.page-edit').first().click();await page.keyboard.insertText('一括変更を確認');
 await page.getByRole('button',{name:'本文の書式を一括変更…',exact:true}).click();
 const bulk=page.getByRole('dialog',{name:'本文の書式を一括変更',exact:true});
 await bulk.getByLabel('変更する範囲',{exact:true}).selectOption('all');
 await bulk.getByRole('spinbutton').fill('22');await bulk.getByRole('button',{name:'一括変更する',exact:true}).click();await bulk.waitFor({state:'hidden'});
 const sizes=await page.locator('.page-edit [data-token]').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).fontSize));
 if(sizes.some(v=>Math.abs(parseFloat(v)-29.3333)>.01))throw Error('サイズの一括変更が反映されません: '+sizes);
 return {newAtStartup:true,noAutomaticRecovery:true,bulkSize:true};
}
