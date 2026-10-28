async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 await page.locator('.page-edit').first().click();
 await page.evaluate(()=>{window.__unpreparedImeFocus=0;document.addEventListener('focusin',e=>{if(e.target.matches?.('.paper-scroll')&&!e.target.editContext)window.__unpreparedImeFocus++;},true);});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});await cdp.send('Input.insertText',{text:'日本'});await cdp.detach();
 const count=await page.evaluate(()=>window.__unpreparedImeFocus);if(count)throw Error('Windows focus was restored before its EditContext was attached: '+count);
 return {inputContextReadyBeforeFocus:true};
}
