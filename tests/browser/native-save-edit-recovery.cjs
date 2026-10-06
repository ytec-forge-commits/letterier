async(page)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 if(!await page.evaluate(()=>Boolean(window.__TAURI_INTERNALS__)))throw Error('Actual Tauri/WebView2 required');
 const identifier=await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('plugin:app|identifier'));
 if(identifier!=='jp.ytec.binsen-kobo.qa-save-20261002')throw Error('Dedicated QA application identifier required');
 const initial=(await page.locator('.page-edit [data-token]').allTextContents()).join('');
 if(initial!=='合成保存試験：最初の本文／Windows手動保存')throw Error('Dedicated manual-save fixture required before editing');
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();
 await page.keyboard.press('Control+End');await page.keyboard.insertText('／Windows回復専用');
 await page.getByRole('status',{name:'回復用データ保存済み・ファイルは未保存',exact:true}).waitFor();
 const expected='合成保存試験：最初の本文／Windows手動保存／Windows回復専用';
 const body=()=>page.locator('.page-edit [data-token]').allTextContents().then(parts=>parts.join(''));
 if(await body()!==expected)throw Error('Dedicated manual-save stage required');
 await page.getByRole('button',{name:'新規作成',exact:true}).click();
 await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 const leave=page.getByRole('dialog').filter({has:page.getByRole('button',{name:'保存しない',exact:true})});
 await leave.waitFor();await leave.getByRole('button',{name:'キャンセル',exact:true}).click();
 await leave.waitFor({state:'hidden'});
 await page.getByRole('dialog').filter({has:page.getByRole('heading',{name:'新規作成',exact:true})}).getByRole('button',{name:'閉じる',exact:true}).click();
 if(await body()!==expected)throw Error('New-document cancellation lost the current body');
 await page.screenshot({path:'output/playwright/native-save-new-cancelled-1280.png'});
 if(errors.length)throw Error(errors.join(';'));
 const result={identifier,latestRecoveryEdit:true,unsavedNewPrompt:true,newCancelKeepsBody:true,body:await body(),pageErrors:errors};
 await page.evaluate(value=>{window.__letterierNativeNewCancel=value;},result);return result;
}
