async(page)=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'設定・使い方',exact:true}).click();
 await page.getByRole('checkbox',{name:/^操作画面の文字とボタンを大きくする/}).check();await page.getByLabel('表示言語',{exact:true}).selectOption('en');
 await page.getByRole('dialog',{name:'Settings & Help',exact:true}).getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('tab',{name:'Layout',exact:true}).click();
 await page.getByLabel('Default body size (pt)',{exact:true}).waitFor();
 const label=page.getByRole('checkbox',{name:'Keep first and last paragraph lines together',exact:true});
 const dims=await label.evaluate(el=>{const l=el.closest('label').getBoundingClientRect(),p=el.closest('.ribbon-panel').getBoundingClientRect();return {bottom:l.bottom,panelBottom:p.bottom};});
 if(dims.bottom>dims.panelBottom)throw Error('Large English checkbox clipped: '+JSON.stringify(dims));
 await page.screenshot({path:'output/playwright/release-2-large-en-layout.png'});
 await page.getByRole('tab',{name:'Home',exact:true}).click();await page.getByLabel('Character spacing (pt)',{exact:true}).waitFor();
 await page.getByRole('slider',{name:'Zoom slider',exact:true}).waitFor();
 await page.getByRole('tab',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Settings & Help',exact:true}).click();
 await page.getByRole('checkbox',{name:/^Make interface text and buttons larger/}).uncheck();await page.getByLabel('Display language',{exact:true}).selectOption('ja');
 await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 page.off('pageerror',onError);if(errors.length)throw Error(errors.join(';'));return {largeEnglishLayout:true,newLabelsTranslated:true,pageErrors:errors,dims};
}
