async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const edit=page.locator('.page-edit').first();await edit.click();const cdp=await page.context().newCDPSession(page);await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
 const effects=[];page.on('download',()=>effects.push('save'));page.on('filechooser',()=>effects.push('open'));
 for(const key of ['s','o']){
  await edit.evaluate((el,key)=>el.dispatchEvent(new KeyboardEvent('keydown',{key,ctrlKey:true,isComposing:false,bubbles:true,cancelable:true})),key);
  await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  if(effects.length||await page.getByRole('dialog',{name:'変更を保存しますか？',exact:true}).count())throw Error('IME key escaped to file actions: '+JSON.stringify({key,effects}));
 }
 await cdp.send('Input.imeSetComposition',{text:'',selectionStart:0,selectionEnd:0});await cdp.detach();
 return {saveKeyPreserved:true,openKeyPreserved:true};
}
