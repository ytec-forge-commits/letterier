async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const edit=page.locator('.page-edit').first();await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('前後');
 await page.waitForFunction(()=>document.querySelector('.page-edit')?.textContent.replaceAll('\u200b','')==='前後');await page.keyboard.press('ArrowUp');
 await page.waitForFunction(()=>document.querySelector('.paper-scroll')?.editContext?.selectionStart===1);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Input.imeSetComposition',{text:'日本語を入力',selectionStart:3,selectionEnd:3});
 await edit.evaluate(el=>el.closest('.paper-scroll').editContext.dispatchEvent(new TextFormatUpdateEvent('textformatupdate',{textFormats:[new TextFormat({rangeStart:1,rangeEnd:4,underlineStyle:'solid',underlineThickness:'thick'}),new TextFormat({rangeStart:4,rangeEnd:7,underlineStyle:'solid',underlineThickness:'thin'})]})));
 const target=await page.evaluate(()=>[...(CSS.highlights.get('letterier-ime-target')??[])].map(r=>r.toString()).join(''));
 if(target!=='日本語')throw Error('Active IME clause is not distinguished: '+target);
 await cdp.send('Input.insertText',{text:'日本語を入力'});await cdp.detach();
 if(await page.evaluate(()=>CSS.highlights.has('letterier-ime-target')))throw Error('IME clause mark survived confirmation');
 return {activeClause:true,removedAfterCommit:true};
}
