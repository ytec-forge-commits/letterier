async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const results=[];
 for(const scenario of ['single','cross-page-selection','page-overflow']){
  await page.locator('.page-edit').first().click();await page.keyboard.press('Control+a');await page.keyboard.insertText(scenario==='cross-page-selection'?'前\f後':scenario==='page-overflow'?'春'.repeat(1600):'');
  if(scenario==='cross-page-selection'){await page.locator('.page-edit').last().click();await page.keyboard.press('Control+a');}
  if(scenario==='page-overflow'){
   await page.locator('.page-edit').first().evaluate(host=>{const token=[...host.querySelectorAll('[data-token]')].at(-1);host.focus({preventScroll:true});getSelection().setBaseAndExtent(token.firstChild,token.textContent.length,token.firstChild,token.textContent.length);});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
  }
  const result=await page.evaluate(scenario=>{const host=document.activeElement,ec=host.editContext;if(!ec)throw Error('Focused input context required');const before=ec.text,start=ec.selectionStart,end=ec.selectionEnd,prefix=scenario==='page-overflow'?'あ'.repeat(100):'あ',expected=before.slice(0,start)+prefix+before.slice(end),body=()=>[...document.querySelectorAll('.page-edit')].map(n=>n.textContent).join('').replaceAll('\u200b','');const update=(a,b,text)=>{ec.updateText(a,b,text);ec.updateSelection(a+text.length,a+text.length);ec.dispatchEvent(new TextUpdateEvent('textupdate',{updateRangeStart:a,updateRangeEnd:b,text,selectionStart:ec.selectionStart,selectionEnd:ec.selectionEnd}));};ec.dispatchEvent(new Event('compositionstart'));update(start,end,prefix+'い');update(start,start+prefix.length+1,prefix);ec.dispatchEvent(new Event('compositionend'));ec.dispatchEvent(new Event('compositionstart'));const next=start+prefix.length;update(next,next,'い');update(next,next+1,'');ec.dispatchEvent(new Event('compositionend'));const afterCancel=body();ec.dispatchEvent(new Event('compositionstart'));update(next,next,'う');ec.dispatchEvent(new Event('compositionend'));return {scenario,start,end,beforeLength:before.length,sourcePage:host.dataset.pageIndex,sourceConnected:host.isConnected,activePage:document.activeElement.dataset.pageIndex,afterCancel,afterNext:body(),expected,expectedNext:expected.slice(0,next)+'う'+expected.slice(next),preedit:!!document.querySelector('[data-ime-preedit]')};},scenario);
  if(result.afterCancel!==result.expected||result.afterNext!==result.expectedNext||result.preedit)throw Error('Native partial composition stream lost its input connection: '+JSON.stringify({...result,afterCancel:result.afterCancel.slice(0,12),afterNext:result.afterNext.slice(0,12),expected:result.expected.slice(0,12),expectedNext:result.expectedNext.slice(0,12)}));
  results.push({scenario,start:result.start,end:result.end,beforeLength:result.beforeLength,sourcePage:result.sourcePage,sourceConnected:result.sourceConnected,activePage:result.activePage,confirmedPrefixPreserved:true,cancelledRemainder:true,nextInput:true});
 }
 return results;
}
