async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
 await page.locator('.page-edit').first().click();await page.keyboard.press('Control+a');await page.keyboard.insertText('元の文章');
 await page.keyboard.press('Control+a');await page.locator('#font').click();
 const dialog=page.getByRole('dialog',{name:'フォントを選択'});
 await dialog.getByRole('button',{name:'Klee One',exact:true}).last().click();
 await page.screenshot({path:'output/playwright/font-picker.png'});
 await dialog.getByRole('button',{name:'このフォントを使う'}).click();
 const before=await page.locator('.page-edit [data-token]').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).fontFamily));
 if(before.some(n=>!n.includes('Letarie Bundled Klee One')))throw Error('bundle not applied '+before);
 await page.locator('.page-edit').first().click();await page.keyboard.press('Control+End');
 await page.locator('#font').click();await dialog.getByRole('button',{name:'Yomogi',exact:true}).last().click();await dialog.getByRole('button',{name:'このフォントを使う'}).click();
 await page.keyboard.insertText('追記');
 const tokens=await page.locator('.page-edit [data-token]').evaluateAll(ns=>ns.map(n=>({text:n.textContent,font:getComputedStyle(n).fontFamily})));
 if(tokens.filter(t=>t.text==='元'||t.text==='の').some(t=>!t.font.includes('Klee One'))||tokens.filter(t=>t.text==='追'||t.text==='記').some(t=>!t.font.includes('Yomogi')))throw Error('typing format changed old text '+JSON.stringify(tokens));
 await page.locator('#font').click();const recents=dialog.locator('.font-group').filter({has:page.getByRole('heading',{name:'最近使ったフォント',exact:true})});
 if((await recents.getByRole('button').allTextContents()).slice(0,2).join(',')!=='Yomogi,Klee One')throw Error('recent order');
 await dialog.getByRole('button',{name:'Caveat',exact:true}).last().click();await dialog.getByRole('button',{name:'キャンセル'}).click();
 await page.getByRole('button',{name:'画面設定・使い方',exact:true}).click();await page.getByRole('button',{name:'オープンソースライセンス → 同梱フォント'}).click();
 const license=page.getByRole('dialog',{name:'同梱フォントのライセンス'});if(!(await license.locator('pre').textContent()).includes('SIL OPEN FONT LICENSE'))throw Error('license missing');
 await license.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('dialog',{name:'画面設定・使い方'}).getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('status').filter({hasText:'自動保存済み'}).waitFor();await page.reload();await page.locator('#font').waitFor();await page.locator('#font').click();
 const again=page.getByRole('dialog',{name:'フォントを選択'}).locator('.font-group').filter({has:page.getByRole('heading',{name:'最近使ったフォント',exact:true})});if((await again.getByRole('button').allTextContents()).slice(0,2).join(',')!=='Yomogi,Klee One')throw Error('recent persist/cancel');
 await page.getByRole('dialog',{name:'フォントを選択'}).getByRole('button',{name:'キャンセル'}).click();
 if(errors.length)throw Error(errors.join('\n'));
}
