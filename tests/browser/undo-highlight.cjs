async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 const body=page.locator('.page-edit').first();await body.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('前の文章\f後の文章');
 await page.keyboard.insertText('変更部分');
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();
 if(await page.locator('.page-edit [data-history-position]').count()!==1)throw Error('Undo of inserted text did not mark its deletion position');
 await page.getByRole('button',{name:'やり直す',exact:true}).click();
 const marked=page.locator('.page-edit [data-history-highlight]');
 if((await marked.allTextContents()).join('')!=='変更部分')throw Error('Redo did not highlight only its affected text');
 const visible=await marked.evaluateAll(nodes=>nodes.every(el=>{const r=el.getBoundingClientRect(),s=el.closest('.paper-scroll').getBoundingClientRect();return r.top>=s.top&&r.bottom<=s.bottom&&r.left>=s.left&&r.right<=s.right;}));
 if(!visible)throw Error('History target was not scrolled into view');
 await page.screenshot({path:'output/playwright/editing-20261027-undo-highlight.png'});
 await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();
 if(await page.locator('.output-pages [data-history-highlight],.output-pages [data-history-position]').count())throw Error('History markers leaked into output');
 await page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 await page.locator('.paper-scroll').focus();await page.keyboard.press('ArrowLeft');
 if(await page.locator('.page-edit [data-history-highlight],.page-edit [data-history-position]').count())throw Error('Cursor movement did not dismiss history markers');
 return {undoPosition:true,redoRange:true,scrollsToTarget:true,noPrintMarkers:true,dismissOnMovement:true};
}
