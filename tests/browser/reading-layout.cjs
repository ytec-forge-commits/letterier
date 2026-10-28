async page=>{
 const startup=page.getByRole('dialog',{name:/^(新規作成|New letter)$/});if(await startup.count())await startup.getByRole('button',{name:/^(閉じる|Close)$/}).click();
 const language=await page.evaluate(()=>navigator.language.startsWith('ja')?'ja':'en');
 const en=language==='en';
 const name=(ja,english)=>en?english:ja;
 await page.getByRole('tab',{name:name('表示','View'),exact:true}).click();
 await page.getByRole('button',{name:name('設定・使い方','Settings & Help'),exact:true}).click();
 const preferences=page.locator('dialog[open]');await preferences.locator('input[type=checkbox]').first().check();
 await preferences.getByRole('button',{name:name('閉じる','Close'),exact:true}).click();
 await page.getByRole('tab',{name:name('ホーム','Home'),exact:true}).click();
 await page.locator('.page-edit').first().click();await page.keyboard.insertText('ホーム 読み返し表示\n'+('文章を広く読み返します。'.repeat(100))+'\f次のページ');
 const first=(await page.locator('.page-edit').allTextContents()).join('').replaceAll('\u200b','');
 await page.getByRole('button',{name:name('ツールバーを折りたたむ','Collapse toolbar'),exact:true}).click();
 await page.screenshot({path:`output/playwright/reading-20261029-${language}-${page.viewportSize().width}-folded.png`});
 await page.getByRole('button',{name:name('読み返し表示','Reading view'),exact:true}).click();
 const reader=page.getByRole('region',{name:name('手紙を読み返す','Read the letter'),exact:true});await reader.waitFor();
 await page.getByLabel(name('読み返しの表示方法','Reading zoom mode'),{exact:true}).selectOption('page');
 await page.getByLabel(name('読むページ','Page to read'),{exact:true}).selectOption('0');
 const bounds=await page.evaluate(()=>{const el=document.querySelector('.reading-scroll'),r=el.getBoundingClientRect(),p=el.querySelector('.sheet-frame').getBoundingClientRect();return {width:innerWidth,height:r.height,pageWidth:p.width,pageHeight:p.height,overflow:document.documentElement.scrollWidth>innerWidth};});
 if(bounds.overflow||bounds.pageWidth>bounds.width||bounds.pageHeight>bounds.height)throw Error('Reading layout overflows: '+JSON.stringify(bounds));
 await page.screenshot({path:`output/playwright/reading-20261029-${language}-${page.viewportSize().width}-reader.png`});
 await page.getByRole('button',{name:name('編集に戻る','Back to editing'),exact:true}).click();
 if((await page.locator('.page-edit').allTextContents()).join('').replaceAll('\u200b','')!==first)throw Error('Layout/language switch altered the letter');
 return {...bounds,language,largeControls:true};
}
