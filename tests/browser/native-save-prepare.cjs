async(page)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 if(!await page.evaluate(()=>Boolean(window.__TAURI_INTERNALS__)))throw Error('Actual Tauri/WebView2 required');
 const identifier=await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('plugin:app|identifier'));
 if(identifier!=='jp.ytec.binsen-kobo.qa-save-20261002')throw Error('Dedicated QA application identifier required');
 const expected='合成保存試験：最初の本文';
 const body=()=>page.locator('.page-edit [data-token]').allTextContents().then(parts=>parts.join(''));
 if(await body()!==expected)throw Error('Dedicated synthetic launch document required');
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();
 await page.keyboard.press('Control+End');await page.keyboard.insertText('／Windows手動保存');
 await page.getByRole('status',{name:'回復用データ保存済み・ファイルは未保存',exact:true}).waitFor();
 if(await body()!==expected+'／Windows手動保存')throw Error('Native body edit lost');
 const pointer=await page.evaluate(async()=>JSON.parse(new TextDecoder().decode(new Uint8Array(await window.__TAURI_INTERNALS__.invoke('local_read',{key:'session-current'})))));
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(pointer.id))throw Error('Native recovery pointer missing');
 await page.screenshot({path:'output/playwright/native-save-autosave-1280.png'});
 if(errors.length)throw Error(errors.join(';'));
 const result={identifier,recoveryPointerRead:true,id:pointer.id,body:await body(),pageErrors:errors};
 await page.evaluate(value=>{window.__letterierNativeSavePrepare=value;},result);return result;
}
