async(page)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewportSize({width:1280,height:720});
 const reset=async()=>{await page.reload();await page.getByRole('dialog',{name:'新規作成',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'設定・使い方',exact:true}).click();};
 await reset();
 const initial=await page.evaluate(()=>performance.getEntriesByType('resource').map(resource=>resource.name).filter(name=>/font-licenses/.test(name)));
 if(initial.length)throw Error('Font license payload was loaded before use');
 let release,arrived;const pending=new Promise(done=>{release=done;}),requested=new Promise(done=>{arrived=done;});
 await page.route('**/assets/font-licenses-*.js',async route=>{arrived();await pending;await route.continue();},{times:1});
 await page.getByRole('button',{name:'オープンソースライセンス → 同梱フォント',exact:true}).click();await requested;
 const modal=page.getByRole('dialog',{name:'同梱フォントのライセンス',exact:true});await modal.getByRole('button',{name:'閉じる',exact:true}).click();release();
 if(await modal.count())throw Error('Closing while loading resurrected the modal');
 await page.getByRole('button',{name:'オープンソースライセンス → 同梱フォント',exact:true}).click();
 const pre=modal.locator('.license-text');await modal.locator('[aria-busy="false"]').waitFor();
 const digest=async()=>pre.evaluate(async el=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(el.textContent))),byte=>byte.toString(16).padStart(2,'0')).join(''));
 const klee=await digest();if(klee!=='b2003c9857e7e747880ab639f1acb4e5b96140b4f8a61ef52c81db182fe3a7b7')throw Error('Klee license was altered or truncated');
 await modal.getByRole('combobox').selectOption('Yomogi');const yomogi=await digest();if(yomogi!=='bc0330d5973ab1f200553f51b4cb4ef11b81187fdcd0249f7f83992726c02a48')throw Error('Yomogi license was altered or truncated');
 if(await modal.getByRole('combobox').locator('option').count()!==20)throw Error('Bundled font missing');
 await page.screenshot({path:'output/playwright/font-license-lazy-1280.png'});await page.setViewportSize({width:375,height:720});
 if(await modal.evaluate(el=>el.scrollWidth>el.clientWidth+1))throw Error('Font license modal overflow');await page.screenshot({path:'output/playwright/font-license-lazy-375.png'});
 await modal.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 await page.setViewportSize({width:1280,height:720});await reset();await page.route('**/assets/font-licenses-*.js',route=>route.abort(),{times:1});
 await page.getByRole('button',{name:'オープンソースライセンス → 同梱フォント',exact:true}).click();await modal.getByRole('alert').waitFor();
 const failure=await modal.getByRole('alert').textContent();if(!failure.includes('再起動'))throw Error('Load failure was not explained');
 await modal.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 if(errors.length)throw Error('Unhandled page errors: '+errors.join(';'));
 return {initialLicenseRequests:initial.length,klee,yomogi,closeDuringLoad:true,modal375NoOverflow:true,expectedNetworkFailure:failure,pageErrors:errors};
}
