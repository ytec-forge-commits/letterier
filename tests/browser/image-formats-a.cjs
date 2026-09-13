async(page)=>{
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();await page.getByRole('button',{name:'白の和紙 和風 · 通年',exact:true}).click();await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 await page.locator('.toolbar input[type=file]').setInputFiles('output/fixtures/花のベクター.svg');
 await page.getByRole('button',{name:'画像を選択 花のベクター.svg',exact:true}).waitFor();
 await page.locator('.toolbar input[type=file]').setInputFiles('output/fixtures/選べる花.gif');
 const frames=page.getByRole('dialog',{name:'使用するコマを選択'});await frames.waitFor();await frames.getByLabel('コマ番号').fill('2');await frames.getByRole('button',{name:'このコマを使う'}).click();
 await page.getByRole('button',{name:'画像を選択 選べる花.gif',exact:true}).waitFor();
 const src=await page.locator('.paper-scroll .object-art img').last().getAttribute('src');if(!src.startsWith('data:image/png;'))throw Error('GIF not frozen');
 await page.screenshot({path:'output/playwright/image-formats-a.png'});
 await page.getByRole('status').filter({hasText:'自動保存済み'}).waitFor();await page.reload();await page.getByRole('button',{name:'画像を選択 選べる花.gif',exact:true}).waitFor();
 if(await page.locator('.paper-scroll .object-art img').count()!==2)throw Error('image lost on reload');
 await page.locator('.toolbar input[type=file]').setInputFiles('output/fixtures/危険な外部参照.svg');
 await page.getByRole('alert').filter({hasText:'外部画像または外部参照'}).waitFor();if(await page.locator('.paper-scroll .object-art img').count()!==2)throw Error('unsafe SVG added');
}
