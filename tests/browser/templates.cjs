async (page) => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.getByRole('button',{name:'桜の便り 和風 · 春',exact:true}).click();
 await page.getByLabel('プレビューの書字方向').selectOption('vertical');
 await page.screenshot({path:'output/playwright/templates-fixed.png'});
 await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 await page.getByRole('dialog').waitFor({state:'hidden'});
 if(await page.getByLabel('書字方向',{exact:true}).inputValue()!=='vertical')throw Error('writing mode');
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();
 await page.getByRole('button',{name:'今の便箋を登録…'}).click();
 await page.getByLabel('名前',{exact:true}).fill('春のお礼用');
 await page.getByRole('button',{name:'登録する',exact:true}).click();
 await page.getByRole('button',{name:'春のお礼用 デザインのみ'}).waitFor();
 await page.getByRole('button',{name:'春のお礼用 デザインのみ'}).click();
 await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'画面設定・使い方',exact:true}).click();
 await page.getByLabel('画面のテーマ').selectOption('sakura');
 await page.getByLabel('操作画面の文字を大きくする').check();
 await page.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.reload();
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).waitFor();
 await page.screenshot({path:'output/playwright/large-theme.png'});
 if(await page.evaluate(()=>document.documentElement.dataset.large)!=='true')throw Error('preference lost');
 if(errors.length)throw Error(errors.join('\n'));
 return {templateCreate:true,register:true,customOpen:true,preferencesPersist:true};
}
