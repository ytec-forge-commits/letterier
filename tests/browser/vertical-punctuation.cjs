async(page)=>{
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 await page.getByRole('button',{name:'背景・罫線・余白…',exact:true}).click();const dialog=page.getByRole('dialog',{name:/ページの背景・罫線/});await dialog.getByLabel('1行の目安文字数（全角）',{exact:true}).fill('20');await dialog.getByRole('button',{name:'この設定を適用',exact:true}).click();
 const edit=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('「桜の手紙」（季節）【便り】(abc)[test]12');
 await edit.locator('[data-token]').first().scrollIntoViewIfNeeded();
 await page.locator('.paper-scroll .sheet-frame').first().screenshot({path:'output/playwright/vertical-punctuation.png'});
 return await edit.locator('[data-token]').evaluateAll(xs=>xs.map(x=>({text:x.textContent,orientation:getComputedStyle(x).textOrientation})));
}
