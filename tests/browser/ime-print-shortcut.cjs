async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 const edit=page.locator('.page-edit').first();await edit.click();
 await edit.evaluate(el=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'p',ctrlKey:true,isComposing:true,bubbles:true,cancelable:true})));
 if(await page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true}).count())throw Error('Print shortcut intercepted an IME conversion key');
 await edit.press('Control+p');await page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true}).waitFor();
 return {composingPrintKeyPreserved:true,normalPrintShortcut:true};
}
