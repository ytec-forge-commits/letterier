async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 const body=page.locator('.page-edit').first();await body.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('前半\f後半');
 await page.keyboard.press('Control+Home');await page.keyboard.press('Control+End');
 await page.getByRole('button',{name:'本文の書式を一括変更…',exact:true}).click();
 let bulk=page.getByRole('dialog',{name:'本文の書式を一括変更',exact:true});
 await bulk.getByRole('spinbutton').fill('20');await bulk.getByRole('button',{name:'一括変更する',exact:true}).click();
 const sizes=await page.locator('.page-edit').evaluateAll(nodes=>nodes.map(n=>[...n.querySelectorAll('[data-token]')].map(t=>parseFloat(t.style.fontSize))));
 if(sizes[0].some(n=>n===20)||sizes[1].some(n=>n!==20))throw Error('Keyboard navigation did not update the page for bulk formatting: '+JSON.stringify(sizes));
 await page.getByRole('button',{name:'本文の書式を一括変更…',exact:true}).click();
 bulk=page.getByRole('dialog',{name:'本文の書式を一括変更',exact:true});await bulk.getByLabel('変更する範囲',{exact:true}).selectOption('all');
 await bulk.getByLabel('文字サイズを揃える',{exact:true}).uncheck();
 await bulk.getByRole('button',{name:'一括変更するフォント',exact:true}).click();
 const picker=page.getByRole('dialog',{name:'フォントを選択',exact:true});await picker.getByRole('button',{name:'Yomogi',exact:true}).first().click();await picker.getByRole('button',{name:'このフォントを使う',exact:true}).click();
 if(!await bulk.getByLabel('フォントを揃える',{exact:true}).isChecked())throw Error('Selecting a bulk font did not enable applying that font');
 await bulk.getByRole('button',{name:'一括変更する',exact:true}).click();
 const families=await page.locator('.page-edit [data-token]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.style.fontFamily))]);
 if(families.length!==1||!families[0].includes('Yomogi'))throw Error('Entire body font unchanged: '+families);
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();
 return {pageScopeFollowsKeyboard:true,fontSelectionEnablesApply:true,allBodyFont:true,undo:true};
}
