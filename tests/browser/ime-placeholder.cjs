async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 await page.locator('.page-edit').first().click();const cdp=await page.context().newCDPSession(page);await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
 const placeholder=page.locator('.paper-placeholder');if(await placeholder.isVisible())throw Error('The empty-document hint overlaps IME preedit');
 await cdp.send('Input.imeSetComposition',{text:'',selectionStart:0,selectionEnd:0});await cdp.detach();await placeholder.waitFor({state:'visible'});
 return {hiddenDuringComposition:true,restoredAfterCancel:true};
}
