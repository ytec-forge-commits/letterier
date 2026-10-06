async (page) => {
 const name='便箋適用-'+Date.now();
 const old=page.getByRole('dialog',{name:/新規作成|便箋変更/});if(await old.count())await old.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 if(!await page.getByRole('dialog').count())await page.getByRole('button',{name:'背景・罫線・余白…',exact:true}).click();
 const visual=page.getByRole('dialog',{name:/ページの背景・罫線/});
 await visual.getByLabel('背景の色',{exact:true}).fill('#ffeedd');
 await visual.getByRole('button',{name:'この設定を適用',exact:true}).click();
 await page.getByRole('button',{name:'便箋変更',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'便箋変更',exact:true});
 await dialog.getByRole('button',{name:'今の便箋を登録…',exact:true}).click();
 await dialog.getByLabel('名前',{exact:true}).fill(name);await dialog.getByRole('button',{name:'登録する',exact:true}).click();
 await dialog.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.locator('.page-edit').first().click();await page.keyboard.insertText('本文を保つ');
 await page.getByRole('button',{name:'背景・罫線・余白…',exact:true}).click();
 await visual.getByLabel('背景の色',{exact:true}).fill('#ffffff');await visual.getByRole('button',{name:'この設定を適用',exact:true}).click();
 await page.getByRole('button',{name:'便箋変更',exact:true}).click();
 await dialog.getByRole('combobox',{name:'種類',exact:true}).selectOption('自分のテンプレート');
 await dialog.getByRole('button',{name:'✉ '+name+' デザインのみ',exact:true}).click();
 await dialog.getByRole('button',{name:'今の手紙にデザインを適用',exact:true}).click();
 await dialog.waitFor({state:'hidden'});
 const color=await page.locator('.paper-scroll .paper-art').first().evaluate(el=>getComputedStyle(el).backgroundColor);
 if(color!=='rgb(255, 238, 221)')throw Error('登録した背景色が適用されません: '+color);
 if(!(await page.locator('.page-edit').first().innerText()).includes('本文を保つ'))throw Error('本文が失われました');
 return {customApply:true,bodyPreserved:true};
}
