async(page)=>{
 const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const startup=page.getByRole('dialog',{name:/^(New letter|新規作成)$/});if(await startup.count())await startup.getByRole('button',{name:/^(Close|閉じる)$/}).click();
 if(await page.evaluate(()=>document.documentElement.lang)==='en'){
  await page.getByRole('tab',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Settings & Help',exact:true}).click();
  await page.getByLabel('Display language',{exact:true}).selectOption('ja');
  await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 }
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'設定・使い方',exact:true}).click();
 await page.getByLabel('表示言語',{exact:true}).selectOption('en');
 const settings=page.getByRole('dialog',{name:'Settings & Help',exact:true});await settings.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('tab',{name:'Home',exact:true}).click();
 const save=page.locator('.quick-actions button').first();
 if((await save.textContent()).trim()!=='Save'||await save.locator('svg').count()!==1||await save.getAttribute('title')!=='Save (Ctrl+S)')throw Error('Quick save label or tooltip is not English');
 await page.getByRole('button',{name:'▱ Copy',exact:true}).waitFor();
 await page.getByRole('button',{name:'Change body formatting…',exact:true}).waitFor();
 await page.getByRole('tab',{name:'Home',exact:true}).focus();await page.keyboard.press('ArrowRight');
 if(await page.getByRole('tab',{name:'Insert',exact:true}).getAttribute('aria-selected')!=='true')throw Error('ArrowRight does not select the next ribbon tab');
 await page.setViewportSize({width:375,height:720});
 const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 if(width.scroll>width.viewport)throw Error('Window has horizontal overflow: '+JSON.stringify(width));
 await page.screenshot({path:'output/playwright/ribbon-375-en.png'});
 await page.setViewportSize({width:1280,height:720});await page.getByRole('tab',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Settings & Help',exact:true}).click();
 await page.getByLabel('Display language',{exact:true}).selectOption('ja');
 await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 if((await save.textContent()).trim()!=='保存'||await save.locator('svg').count()!==1||await save.getAttribute('title')!=='保存（Ctrl+S）')throw Error('Quick save label or tooltip did not return to Japanese');
 page.off('pageerror',onError);if(errors.length)throw Error(errors.join('\n'));
 return {english:true,japanese:true,quickSaveLabelAndTooltip:true,copyLabel:true,keyboardTabs:true,noWindowOverflow375:true};
}
