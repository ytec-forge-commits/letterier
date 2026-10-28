async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'挿入',exact:true}).click();await page.getByRole('button',{name:'文字箱',exact:true}).click();
 const editor=page.getByLabel('文字箱の本文',{exact:true}),initial=await editor.inputValue();await editor.click();await editor.press('Control+a');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
 if(await page.locator('.floating-text').textContent()!==initial)throw Error('Unconfirmed object composition entered document and undo history');
 await cdp.send('Input.insertText',{text:'日本'});await cdp.detach();if(await page.locator('.floating-text').textContent()!=='日本')throw Error('Object composition not committed');
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();if(await page.locator('.floating-text').textContent()!==initial)throw Error('One Undo did not undo the entire object composition');
 await page.getByRole('button',{name:'やり直す',exact:true}).click();if(await page.locator('.floating-text').textContent()!=='日本')throw Error('Object composition redo failed');
 return {preeditIsolated:true,commitOnce:true,undoOnce:true,redo:true};
}
