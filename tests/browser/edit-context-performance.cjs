async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const text='合成長文の入力を確認します。ABCD1234 '.repeat(500).slice(0,10000),first=page.locator('.page-edit').first();
 await first.click();await page.keyboard.insertText(text);await page.waitForFunction(()=>[...document.querySelectorAll('.page-edit [data-token]')].map(n=>n.textContent).join('').length===10000);
 const edits=page.locator('.page-edit');await edits.nth(1).click({position:{x:500,y:80}});await first.click({position:{x:500,y:80}});await page.keyboard.press('Control+End');
 const retained=await page.locator('.page-edit,.paper-scroll').evaluateAll(hosts=>hosts.filter(h=>h!==document.activeElement).reduce((sum,h)=>sum+(h.editContext?.text.length??0),0));
 if(retained!==0)throw Error('Inactive EditContexts retain duplicate full-document buffers: '+retained);
 await page.evaluate(()=>{window.__imeLatency=[];window.__imeKeySample=e=>{if(e.key.length!==1||e.ctrlKey||e.altKey)return;const start=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>window.__imeLatency.push(performance.now()-start)));};document.addEventListener('keydown',window.__imeKeySample,true);});
 for(const [i,key] of [...'abcde'].entries()){await page.keyboard.press(key);await page.waitForFunction(n=>window.__imeLatency.length===n,i+1);}
 const actual=(await page.locator('.page-edit [data-token]').allTextContents()).join('');if(actual!==text+'abcde')throw Error('Long-document input was lost');
 const result=await page.evaluate(()=>({milliseconds:window.__imeLatency,pages:document.querySelectorAll('.page-edit').length,nodes:document.querySelectorAll('*').length}));
 await page.evaluate(()=>document.removeEventListener('keydown',window.__imeKeySample,true));return {...result,characters:10000,inactiveBufferedCharacters:retained,metric:'keydown capture to two animation frames; includes frame scheduling'};
}
