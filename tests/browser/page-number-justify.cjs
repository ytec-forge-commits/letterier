async page=>{
 const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.setViewportSize({width:1280,height:720});
 const results=[];
 for(const mode of ['horizontal','vertical']){
  await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption(mode);
  await page.getByRole('tab',{name:'ホーム',exact:true}).click();
  await page.getByLabel('ページ番号を印刷',{exact:true}).uncheck();await page.getByLabel('行末を揃える',{exact:true}).uncheck();
  const text='季節の便りをお届けします。お元気でお過ごしでしょうか。'.repeat(5)+'\n短い文\f次のページ';
  const body=page.locator('.page-edit').first();await body.click();await page.keyboard.press('Control+a');await page.keyboard.insertText(text);
  await page.getByLabel('ページ番号を印刷',{exact:true}).check();await page.getByLabel('行末を揃える',{exact:true}).check();
  const numbers=await page.locator('.paper-scroll .paper-page-number').allTextContents();if(JSON.stringify(numbers)!=='["1","2"]')throw Error('Page numbering missing: '+numbers);
  const geometry=await page.locator('.paper-scroll .body-line').evaluateAll((lines,mode)=>{
   const nonempty=lines.filter(l=>l.querySelector('[data-token]')),first=nonempty[0],last=nonempty.find(l=>[...l.querySelectorAll('[data-token]')].map(n=>n.textContent).join('')==='短い文');
   const lineRect=first.getBoundingClientRect(),tokens=[...first.querySelectorAll('[data-token]')],tail=tokens.at(-1).getBoundingClientRect();
   return {endGap:mode==='vertical'?lineRect.bottom-tail.bottom:lineRect.right-tail.right,hasGap:tokens.some(n=>parseFloat(n.style.marginInlineEnd)>0),shortMargins:[...last.querySelectorAll('[data-token]')].map(n=>n.style.marginInlineEnd)};
  },mode);
  if(Math.abs(geometry.endGap)>1.5||!geometry.hasGap||geometry.shortMargins.some(v=>v&&v!=='0px'))throw Error('Line ends do not align: '+JSON.stringify({mode,...geometry}));
  if((await page.locator('.page-edit [data-token]').allTextContents()).join('')!==text.replace(/[\n\f]/g,''))throw Error('Justification changed text');
  await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();
  const output=page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true});
  if(JSON.stringify(await output.locator('.paper-page-number').allTextContents())!=='["1","2"]')throw Error('Preview differs from editor numbering');
  await output.getByLabel('出力するページ',{exact:true}).fill('2');
  if((await output.locator('.paper-page-number').allTextContents()).join('')!=='2')throw Error('Selected range renumbered page 2');
  await page.screenshot({path:`output/playwright/editing-20261027-${mode}-output.png`});
  await output.getByRole('button',{name:'閉じる',exact:true}).click();
  await page.locator('.paper-scroll').evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:`output/playwright/editing-20261027-${mode}-1280.png`});
  await page.getByLabel('ページ番号を印刷',{exact:true}).uncheck();if(await page.locator('.paper-scroll .paper-page-number').count())throw Error('Page number did not switch off');
  results.push({mode,numbers,...geometry});
 }
 await page.setViewportSize({width:960,height:640});await page.screenshot({path:'output/playwright/editing-20261027-laptop-960.png'});
 await page.setViewportSize({width:375,height:812});await page.screenshot({path:'output/playwright/editing-20261027-375.png'});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Application shell overflows at 375px');
 await page.setViewportSize({width:1280,height:720});page.off('pageerror',onError);if(errors.length)throw Error(errors.join(';'));
 return {results,smallShellFits:true,errors,notes:'Preview and browser layout verified; native printer and MS-IME popup require Windows validation.'};
}
