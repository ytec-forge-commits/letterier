async page=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const editor=page.locator('.page-edit').first(),body=()=>page.locator('.page-edit').allTextContents().then(a=>a.join('').replaceAll('\u200b',''));
 await editor.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('ああ');await page.keyboard.press('ArrowUp');await page.keyboard.press('Control+b');
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.imeSetComposition',{text:'あ',selectionStart:1,selectionEnd:1});await cdp.send('Input.insertText',{text:'あ'});
 const result=await page.evaluate(()=>{const s=getSelection(),el=s.focusNode.parentElement.closest('[data-offset]');return {caret:Number(el.dataset.offset)+s.focusOffset,bold:[...document.querySelectorAll('.page-edit [data-token]')].filter(n=>getComputedStyle(n).fontWeight==='700').map(n=>Number(n.dataset.offset))};});
 if(result.caret!==2||result.bold.join(',')!=='1')throw Error('Repeated text changed insertion position or typing style: '+JSON.stringify(result));
 await page.keyboard.press('Control+b');await page.keyboard.press('Control+a');await page.keyboard.insertText('前\f後');await page.locator('.page-edit').last().click({position:{x:500,y:80}});await page.keyboard.press('Control+a');
 await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
 if(await page.locator('[data-ime-preedit]').count()!==1)throw Error('Cross-page composition ended before confirmation');
 const visibility=await page.locator('[data-ime-preedit]').evaluate(el=>{const r=el.getBoundingClientRect(),area=el.closest('.paper-scroll').getBoundingClientRect();return {visible:r.top>=area.top&&r.bottom<=area.bottom&&r.left>=area.left&&r.right<=area.right,rect:r.toJSON(),area:area.toJSON()};});if(!visibility.visible)throw Error('Cross-page preedit is outside the reading viewport: '+JSON.stringify(visibility));
 await cdp.send('Input.insertText',{text:'日本'});if(await body()!=='日本')throw Error('Cross-page replacement failed: '+await body());
 await page.keyboard.press('Control+a');await page.keyboard.insertText('前\f後');await page.keyboard.press('Control+a');
 await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});await cdp.send('Input.imeSetComposition',{text:'',selectionStart:0,selectionEnd:0});
 if(await body()!=='前\f後')throw Error('Cross-page cancellation lost original text: '+await body());
 await cdp.detach();return {repeatedTextCaret:true,typingStyle:true,crossPageCommit:true,crossPageCancel:true};
}
