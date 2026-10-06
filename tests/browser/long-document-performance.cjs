async(page)=>{
 const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 await page.setViewportSize({width:1280,height:720});
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 const text='合成の長文性能を確認します。ABCD1234 '.repeat(500).slice(0,10000);
 const body=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
 await body.click();await page.keyboard.press('Control+a');
 await page.evaluate(()=>{
  window.__longDocSamples=[];
  window.__longDocBeforeInput=event=>{
   if(event.inputType!=='insertText'||!event.target.closest('.page-edit'))return;
   const start=performance.now();
   requestAnimationFrame(()=>requestAnimationFrame(()=>window.__longDocSamples.push({kind:'input',milliseconds:performance.now()-start})));
  };
  document.addEventListener('beforeinput',window.__longDocBeforeInput,true);
 });
 const client=await page.context().newCDPSession(page);await client.send('Profiler.enable');await client.send('Profiler.start');
 await page.keyboard.insertText(text);await page.waitForFunction(()=>window.__longDocSamples.length===1);
 const initialProfile=(await client.send('Profiler.stop')).profile;
 const verify=async expected=>{
  const actual=(await page.locator('.page-edit [data-token]').allTextContents()).join('');
  if(actual!==expected)throw Error(`Body mismatch: expected ${expected.length}, actual ${actual.length}`);
 };
 await verify(text);
 let expected=text;
 for(const letter of ['甲','乙','丙','丁','戊']){
  await page.keyboard.insertText(letter);expected+=letter;
  const count=expected.length-text.length+1;await page.waitForFunction(n=>window.__longDocSamples.length===n,count);await verify(expected);
 }
 const beforePages=await page.locator('.paper-scroll .sheet-frame').count();
 await page.evaluate(()=>{window.__longDocPageStart=performance.now();});
 await page.getByRole('button',{name:'末尾にページを追加',exact:true}).click();
 await page.waitForFunction(n=>document.querySelectorAll('.paper-scroll .sheet-frame').length===n,beforePages+1);
 const pageAdd=await page.evaluate(()=>performance.now()-window.__longDocPageStart);
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();
 await page.waitForFunction(n=>document.querySelectorAll('.paper-scroll .sheet-frame').length===n,beforePages);await verify(expected);
 await page.getByRole('button',{name:'本文の書式を一括変更…',exact:true}).click();
 const bulk=page.getByRole('dialog',{name:'本文の書式を一括変更',exact:true});
 await bulk.getByLabel('変更する範囲',{exact:true}).selectOption('all');await bulk.getByRole('spinbutton').fill('18');
 await page.evaluate(()=>{window.__longDocBulkStart=performance.now();});
 await bulk.getByRole('button',{name:'一括変更する',exact:true}).click();await bulk.waitFor({state:'hidden'});
 const bulkDuration=await page.evaluate(()=>performance.now()-window.__longDocBulkStart);await verify(expected);
 const sizes=await page.locator('.page-edit [data-token]').evaluateAll(nodes=>[...new Set(nodes.map(n=>getComputedStyle(n).fontSize))]);
 if(sizes.length!==1||sizes[0]!=='24px')throw Error('Bulk size not applied: '+sizes);
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();await verify(expected);
 await page.screenshot({path:'output/playwright/long-document-1280.png'});
 const observations=await page.evaluate(()=>({samples:window.__longDocSamples,nodes:document.querySelectorAll('*').length,heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null,userAgent:navigator.userAgent}));
 await page.evaluate(()=>document.removeEventListener('beforeinput',window.__longDocBeforeInput,true));await client.detach();page.off('pageerror',onError);
 const hits=new Map(initialProfile.nodes.map(node=>[node.id,{name:node.callFrame.functionName,url:node.callFrame.url,selfMs:0}]));
 for(let i=0;i<(initialProfile.samples??[]).length;i++){const row=hits.get(initialProfile.samples[i]);if(row)row.selfMs+=(initialProfile.timeDeltas?.[i]??0)/1000;}
 const profileTop=[...hits.values()].sort((a,b)=>b.selfMs-a.selfMs).slice(0,12);
 if(errors.length)throw Error(errors.join(';'));
 const result={characters:text.length,pages:beforePages,...observations,pageAddMilliseconds:pageAdd,bulkMilliseconds:bulkDuration,profileTop,errors,notes:'input event to two RAFs; includes frame scheduling; click samples include automation overhead; heap snapshot is not a leak test; synthetic Chromium only'};
 await page.evaluate(value=>{window.__letterierLongDocumentQA=value;},result);return result;
}
