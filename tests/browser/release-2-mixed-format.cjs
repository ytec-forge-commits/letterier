async(page)=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('button',{name:'表示倍率を100%に戻す',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 await page.getByLabel('本文の標準サイズ（pt）',{exact:true}).fill('18');
 const body=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
 await body.fill('あいうえ');await body.focus();await page.keyboard.press('Home');await page.keyboard.press('Shift+ArrowRight');
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 await page.getByLabel('文字サイズ（pt）',{exact:true}).fill('24');
 await page.getByLabel('文字間隔（pt）',{exact:true}).fill('3');
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 await page.getByLabel('本文の標準サイズ（pt）',{exact:true}).fill('20');
 const values=await body.locator('[data-token]').evaluateAll(els=>els.map(e=>({text:e.textContent,font:getComputedStyle(e).fontSize,gap:getComputedStyle(e).marginInlineEnd})));
 if(values.length!==4||values[0].font!=='32px'||values[0].gap!=='4px'||values.slice(1).some(v=>Math.abs(parseFloat(v.font)-26.6667)>0.01||v.gap!=='0px'))throw Error('Default size erased explicit formatting or failed inheritance: '+JSON.stringify(values));
 await body.focus();await page.keyboard.press('Control+a');await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 if(await page.getByLabel('文字間隔（pt）',{exact:true}).inputValue()!=='')throw Error('Mixed tracking should not claim a single value');
 await page.getByLabel('文字間隔（pt）',{exact:true}).fill('6');
 if(await body.locator('[data-token]').evaluateAll(els=>els.some(e=>getComputedStyle(e).marginInlineEnd!=='8px')))throw Error('Apply tracking to selection failed');
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();
 const undone=await body.locator('[data-token]').evaluateAll(els=>els.map(e=>getComputedStyle(e).marginInlineEnd));
 if(JSON.stringify(undone)!=='["4px","0px","0px","0px"]')throw Error('Undo lost run tracking: '+JSON.stringify(undone));
 await page.getByRole('button',{name:'やり直す',exact:true}).click();
 if(await body.locator('[data-token]').evaluateAll(els=>els.some(e=>getComputedStyle(e).marginInlineEnd!=='8px')))throw Error('Redo failed');
 return {defaultSizePreservesExplicitRuns:true,mixedTracking:true,undoRedo:true,values};
}
