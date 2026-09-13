async(page)=>{
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();
 await page.getByRole('button',{name:'白の和紙 和風 · 通年',exact:true}).click();
 await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 const title='再開順序の合成試験 '+Date.now();await page.getByLabel('手紙の名前').fill(title);
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();
 await page.keyboard.insertText('保存済み');await page.keyboard.press('Control+s');
 await page.getByRole('status').filter({hasText:'自動保存済み'}).waitFor();
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();await page.keyboard.press('Control+End');
 await page.keyboard.insertText('直前の追記');
 const before=(await page.locator('[data-token]').allTextContents()).join('');if(before!=='保存済み直前の追記')throw new Error('入力準備が一致しません: '+before);
 await page.getByRole('button',{name:'ファイル',exact:true}).click();
 await page.getByRole('button',{name:'最近使った手紙',exact:true}).click();
 await page.getByRole('button').filter({has:page.getByText(title,{exact:true})}).click();
 await page.getByRole('dialog',{name:'最近使った手紙',exact:true}).waitFor({state:'hidden'});
 await page.getByRole('status').filter({hasText:'保存データを処理しています'}).waitFor({state:'hidden'});
 const text=(await page.locator('[data-token]').allTextContents()).join('');
 if(text!=='保存済み直前の追記')throw new Error('直前の入力が失われた: '+text);
 return {recentKeepsUnsavedEdit:true};
}
