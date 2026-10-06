async(page)=>{
 await page.getByRole('status').filter({hasText:'回復用データ保存済み'}).waitFor();
 const body=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
 const read=()=>body.locator('[data-token]').evaluateAll(els=>els.map(e=>({text:e.textContent,font:e.style.fontSize,gap:e.style.marginInlineEnd})));
 const before=await read();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('.quick-actions').getByRole('button',{name:'保存',exact:true}).click();
 await (await downloadPromise).saveAs('output/playwright/release-2-mixed-tracking.binsen');
 await page.reload();
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});await startup.waitFor();await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 if(await body.locator('[data-token]').count())throw Error('Startup must not silently reopen a letter');
 await page.getByRole('button',{name:'前回の回復用データを開く',exact:true}).click();
 await page.getByRole('status').filter({hasText:'回復用データ保存済み'}).waitFor();
 if(JSON.stringify(await read())!==JSON.stringify(before))throw Error('Explicit recovery lost mixed formatting');
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'設定・使い方',exact:true}).click();
 const help=page.getByRole('dialog',{name:'設定・使い方',exact:true});const rect=await help.boundingBox();
 await page.mouse.move(rect.x+10,rect.y+10);await page.mouse.down();await page.mouse.move(4,4);await page.mouse.up();
 if(!await help.isVisible())throw Error('Dragging from inside must not dismiss');
 await page.mouse.click(4,4);if(await help.isVisible())throw Error('Outside click must dismiss');
 await body.focus();await page.keyboard.press('End');await page.keyboard.insertText('追記');
 await page.locator('.ribbon-titlebar').getByRole('button',{name:'新しい手紙',exact:true}).click();
 return {savedDownload:true,blankStartup:true,explicitRecovery:true,dragInsideOutsideKeepsDialog:true,outsideDismisses:true,dialogs:await page.locator('dialog').allTextContents()};
}
