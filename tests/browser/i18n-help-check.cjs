async(page)=>{
 if(new URL(page.url()).origin!=='http://127.0.0.1:1421')throw Error('Synthetic local browser required');
 const open=page.locator('dialog[open]');
 if(await open.count())await open.getByRole('button',{name:/^(閉じる|Close)$/}).click();
 await page.getByRole('tab',{name:/^(ヘルプ|Help)$/}).click();
 await page.getByRole('button',{name:/^(設定・使い方|Settings & Help)$/}).click();
 const dialog=page.locator('dialog[open]');
 await dialog.getByLabel(/^(表示言語|Display language)$/).selectOption('en');
 await page.waitForFunction(()=>document.documentElement.lang==='en');
 const help=await dialog.locator('.getting-started').innerText();
 if(!help.includes('Choose New letter on the Home tab above.'))throw Error('Obsolete help route: '+help);
 await dialog.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('tab',{name:'Home',exact:true}).click();
 await page.getByRole('tabpanel',{name:'Home',exact:true}).getByRole('button',{name:'New letter',exact:true}).click();
 await page.locator('dialog[open]').getByRole('heading',{name:'New letter',exact:true}).waitFor();
 return {helpRoute:'Home → New letter',openedActualNewDialog:true};
}
