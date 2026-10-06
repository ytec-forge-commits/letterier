async(page)=>{
 const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const startup=page.getByRole('dialog',{name:/^(New letter|新規作成)$/});
 if(await startup.count())await startup.getByRole('button',{name:/^(Close|閉じる)$/}).click();
 await page.keyboard.press('Escape');
 const results=[];
 for(const language of ['ja','en']){
  const current=await page.evaluate(()=>document.documentElement.lang);
  if(current!==language){
   await page.getByRole('tab',{name:current==='ja'?'ヘルプ':'Help',exact:true}).click();
   await page.getByRole('button',{name:current==='ja'?'設定・使い方':'Settings & Help',exact:true}).click();
   await page.getByLabel(current==='ja'?'表示言語':'Display language',{exact:true}).selectOption(language);
   await page.getByRole('dialog',{name:language==='ja'?'設定・使い方':'Settings & Help',exact:true}).getByRole('button',{name:language==='ja'?'閉じる':'Close',exact:true}).click();
  }
  for(const width of [1280,375]){
   await page.setViewportSize({width,height:720});
   await page.getByRole('tab',{name:language==='ja'?'ホーム':'Home',exact:true}).click();
   const trigger=page.getByRole('button',{name:language==='ja'?'文字の色':'Text color',exact:true});
   const popover=page.locator('.color-popover');
   await trigger.click();await popover.waitFor();
   const bounds=await popover.boundingBox();
   if(!bounds||bounds.x<0||bounds.y<0||bounds.x+bounds.width>width||bounds.y+bounds.height>720)throw Error('Palette out of viewport: '+JSON.stringify({language,width,bounds}));
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Window horizontal overflow');
   await page.screenshot({path:`output/playwright/palette-${width}-${language}.png`});
   await page.keyboard.press('Escape');await popover.waitFor({state:'hidden'});
   if(await trigger.getAttribute('aria-expanded')!=='false')throw Error('Expanded state not reset');
   await trigger.click();await popover.waitFor();
   // Synthetic composing event checks the event guard, not an actual OS IME.
   await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',isComposing:true,bubbles:true,cancelable:true})));
   if(!await popover.isVisible())throw Error('Composing Escape dismissed palette');
   await page.keyboard.press('Escape');await popover.waitFor({state:'hidden'});
   await trigger.click();await popover.waitFor();
   const body=page.getByRole('textbox',{name:language==='ja'?'手紙の本文 1ページ':'Letter body, page 1',exact:true});
   await body.click();await popover.waitFor({state:'hidden'});
   if(!await body.evaluate(element=>document.activeElement===element))throw Error('Outside body click lost focus');
   await trigger.click();await popover.waitFor();
   await page.getByRole('tab',{name:language==='ja'?'挿入':'Insert',exact:true}).click();
   await popover.waitFor({state:'hidden'});
   const canceled=await page.evaluate(()=>!document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
   if(canceled)throw Error('Dismiss listener persisted after unmount');
   results.push({language,width,bounds,outsideFocus:true,compositionGuard:true,unmountCleanup:true});
  }
 }
 await page.setViewportSize({width:1280,height:720});
 page.off('pageerror',onError);if(errors.length)throw Error(errors.join(';'));
 return {results,pageErrors:errors};
}
