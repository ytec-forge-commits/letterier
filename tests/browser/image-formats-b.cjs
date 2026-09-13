async(page)=>{
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();await page.getByRole('button',{name:'白の和紙 和風 · 通年',exact:true}).click();await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 await page.locator('.toolbar input[type=file]').setInputFiles('output/fixtures/統合画像.psd');await page.getByRole('button',{name:'画像を選択 統合画像.psd',exact:true}).waitFor();
 await page.locator('.toolbar input[type=file]').setInputFiles('output/fixtures/PDF互換.ai');const d=page.getByRole('dialog',{name:'使用するページを選択'});await d.waitFor();await d.getByLabel('ページ番号').fill('2');await d.getByRole('button',{name:'このページを使う'}).click();
 await page.getByRole('button',{name:'画像を選択 PDF互換.ai',exact:true}).waitFor();await page.screenshot({path:'output/playwright/image-formats-b.png'});await page.getByRole('status').filter({hasText:'自動保存済み'}).waitFor();await page.reload();await page.getByRole('button',{name:'画像を選択 PDF互換.ai',exact:true}).waitFor();if(await page.locator('.paper-scroll .object-art img').count()!==2)throw Error('derived images lost');
 await page.locator('.toolbar input[type=file]').setInputFiles('output/fixtures/非互換.ai');await page.getByRole('alert').filter({hasText:'PDF互換ではありません'}).waitFor();if(await page.locator('.paper-scroll .object-art img').count()!==2)throw Error('unsupported AI added');
}
