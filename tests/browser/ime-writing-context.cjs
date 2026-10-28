async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const context=await page.locator('.page-edit').first().evaluate(el=>({host:getComputedStyle(el).writingMode,line:getComputedStyle(el.querySelector('.body-line')).writingMode,hostFont:getComputedStyle(el).fontFamily}));
 if(context.host!==context.line)throw Error('IME host and text disagree on writing mode: '+JSON.stringify(context));
 return {consistentVerticalInputContext:true,...context,notes:'Does not inspect the native MS-IME candidate popup.'};
}
