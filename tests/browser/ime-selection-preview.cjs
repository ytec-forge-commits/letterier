async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const edit=page.locator('.page-edit').first();await edit.locator('.body-line').first().click({position:{x:2,y:2}});await page.keyboard.insertText('最初の文章\n次の文章');await page.keyboard.press('Control+a');
 const first=await edit.locator('.body-line').first().boundingBox();const cdp=await page.context().newCDPSession(page);await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
 const preview=page.locator('[data-ime-preedit]'),box=await preview.boundingBox();
 if(!await preview.evaluate(el=>!!el.closest('.body-line'))||!box||Math.abs(box.x-first.x)>3||Math.abs(box.y-first.y)>3)throw Error('Selection preedit escaped its first writing line: '+JSON.stringify({first,box}));
 await cdp.send('Input.imeSetComposition',{text:'',selectionStart:0,selectionEnd:0});await cdp.detach();
 if((await edit.textContent()).replaceAll('\u200b','')!=='最初の文章\n次の文章')throw Error('Multiline cancellation lost text');
 return {preeditAtSelectionStart:true,multilineCancelPreserved:true};
}
