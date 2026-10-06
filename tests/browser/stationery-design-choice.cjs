async(page)=>{
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'便箋変更',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'便箋変更',exact:true});
 await dialog.getByRole('button',{name:'桜の便り 和風 · 春',exact:true}).click();
 await dialog.getByLabel('図案',{exact:true}).selectOption('3',{timeout:3000});
 const options=await dialog.getByLabel('図案',{exact:true}).locator('option').allTextContents();
 if(options.length!==5||!options[2].includes('桜と小鳥'))throw Error('Expected five distinct Sakura designs');
 await dialog.getByLabel('続きのページで5図案を順番に使う',{exact:true}).check();
 await dialog.getByRole('button',{name:'今の手紙にデザインを適用',exact:true}).click();
 const images=page.locator('.paper-scroll .paper-decoration image');await images.first().waitFor();
 const paths=await images.evaluateAll(items=>items.map(el=>el.getAttribute('href')));
 if(!paths.some(p=>p.includes('sakura-v3.png'))||!paths.some(p=>p.includes('sakura-v3-companion.png')))throw Error('Selected art missing: '+paths);
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'便箋変更',exact:true}).click();
 await dialog.getByRole('button',{name:'パステルドット 洋風 · 通年',exact:true}).click();
 const dotsOptions=await dialog.getByLabel('図案',{exact:true}).locator('option').allTextContents();
 if(dotsOptions.length!==5||!dotsOptions[4].includes('ボタンと糸'))throw Error('Dots designs missing');
 if(!await dialog.getByLabel('続きのページで5図案を順番に使う',{exact:true}).isEnabled())throw Error('Completed Dots cycling unavailable');
 await dialog.getByRole('button',{name:'閉じる',exact:true}).click();
 return {sakuraOptions:options,paths,dotsOptions};
}
