async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const edit=page.locator('.page-edit').first();await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('前日本語後');
 await page.keyboard.press('ArrowUp');for(let i=0;i<3;i++)await page.keyboard.press('Shift+ArrowUp');
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
 await cdp.send('Input.imeSetComposition',{text:'',selectionStart:0,selectionEnd:0});await cdp.detach();
 const text=(await page.locator('.page-edit [data-token]').allTextContents()).join('');
 if(text!=='前日本語後')throw Error('Cancelling selected-text composition removed original text: '+text);
 return {selectedCompositionCancelPreservesText:true};
}
