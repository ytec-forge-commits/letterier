async(page)=>{
 if(new URL(page.url()).origin!=='http://127.0.0.1:1432')throw Error('Dedicated local synthetic browser required');
 if(await page.evaluate(()=>Boolean(window.__TAURI_INTERNALS__)))throw Error('Browser-only test');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const expectWarning=async(expected)=>page.waitForFunction(text=>{
   const alert=document.querySelector('.warning[role="alert"]');
   return alert&&Array.from(alert.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('')===text;
 },expected);
 await page.setViewportSize({width:1280,height:720});
 let d=page.locator('dialog[open]');
 if(await d.count())await d.getByRole('button',{name:/^(閉じる|Close)$/}).click();
 if((await page.locator('.page-edit [data-token]').allTextContents()).join(''))throw Error('Fresh empty document required');
 const setLanguage=async(language)=>{
   await page.getByRole('tab',{name:/^(ヘルプ|Help)$/}).click();
   await page.getByRole('button',{name:/^(設定・使い方|Settings & Help)$/}).click();
   d=page.locator('dialog[open]');await d.getByLabel(/^(表示言語|Display language)$/).selectOption(language);
   await page.waitForFunction(language=>document.documentElement.lang===language,language);
   await d.getByRole('button',{name:/^(閉じる|Close)$/}).click();
   await page.getByRole('tab',{name:/^(ホーム|Home)$/}).click();
 };
 await setLanguage('en');
 // Reject only the external clipboard boundary; the real ribbon/error/render/localization path remains intact.
 await page.evaluate(()=>{window.__qaClipboardDescriptor=Object.getOwnPropertyDescriptor(navigator,'clipboard');Object.defineProperty(navigator,'clipboard',{configurable:true,value:{readText:()=>Promise.reject(new DOMException('Synthetic denial','NotAllowedError'))}});});
 try{
   await page.getByRole('button',{name:'Paste',exact:true}).click();
   const alert=page.locator('.warning[role="alert"]');
   await expectWarning('Clipboard access is unavailable. Select body text and use Ctrl+C, Ctrl+X, or Ctrl+V.');
   await page.screenshot({path:'output/playwright/i18n-warning-clipboard-en-1280.png'});
   await setLanguage('ja');
   await expectWarning('クリップボードを利用できません。本文を選んでCtrl+C・Ctrl+X・Ctrl+Vを使用してください。');
   await page.setViewportSize({width:375,height:812});await setLanguage('en');
   await expectWarning('Clipboard access is unavailable. Select body text and use Ctrl+C, Ctrl+X, or Ctrl+V.');
   await page.screenshot({path:'output/playwright/i18n-warning-clipboard-en-375.png'});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal page overflow');
   await alert.getByRole('button',{name:'Close',exact:true}).click();await alert.waitFor({state:'hidden'});
   if((await page.locator('.page-edit [data-token]').allTextContents()).join(''))throw Error('Failed clipboard operation modified the body');
   if(errors.length)throw Error(JSON.stringify(errors));
   return {clipboardFailureLocalized:true,jaEnRoundtrip:true,bodyUnchanged:true,alertDismissed:true,pageErrors:0,screenshots:2};
 }finally{
   await page.evaluate(()=>{const original=window.__qaClipboardDescriptor;if(original)Object.defineProperty(navigator,'clipboard',original);else delete navigator.clipboard;delete window.__qaClipboardDescriptor;});
 }
}
