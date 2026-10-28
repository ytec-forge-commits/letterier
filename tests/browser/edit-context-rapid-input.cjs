async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const editor=page.locator('.page-edit').first();await editor.click();
 for(let i=0;i<12;i++){
  await page.keyboard.press('Control+a');await page.keyboard.insertText('前後');await page.keyboard.press('ArrowUp');
  const offset=await page.evaluate(()=>{const s=getSelection(),el=s.focusNode?.parentElement?.closest('[data-offset]');return el?Number(el.dataset.offset)+s.focusOffset:null;});
  if(offset!==1)throw Error('Cursor command immediately after EditContext input used stale DOM: '+JSON.stringify({iteration:i,offset}));
 }
 return {immediateCaretMoves:12};
}
