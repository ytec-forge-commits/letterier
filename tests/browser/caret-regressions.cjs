async(page)=>{
 await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
 await page.locator('.page-edit').first().click();await page.keyboard.press('Control+a');await page.keyboard.insertText(('あ'.repeat(80)+'\n').repeat(35));
 const focusEnd=()=>page.evaluate(()=>{const host=document.querySelector('.page-edit');const n=Array.from(host.querySelectorAll('[data-offset]')).at(-1);host.focus();getSelection().setBaseAndExtent(n.firstChild,n.textContent.length,n.firstChild,n.textContent.length);});
 await focusEnd();await page.keyboard.press('ArrowRight');if(await page.evaluate(()=>getSelection().focusNode.parentElement.closest('.page-edit').getAttribute('aria-label'))!=='手紙の本文 2ページ')throw Error('Right boundary blocked');
 await focusEnd();await page.keyboard.press('ArrowDown');if(await page.evaluate(()=>getSelection().focusNode.parentElement.closest('.page-edit').getAttribute('aria-label'))!=='手紙の本文 2ページ')throw Error('Down boundary blocked');
 await page.keyboard.press('Control+a');await page.keyboard.insertText('ABCDE');
 await page.evaluate(()=>{let t=document.querySelector('[data-offset="2"]');getSelection().setBaseAndExtent(t.firstChild,0,t.firstChild,0);const d=new DataTransfer();d.setData('text/plain','X\r\nY');document.querySelector('.page-edit').dispatchEvent(new ClipboardEvent('paste',{clipboardData:d,bubbles:true,cancelable:true}));});
 await page.keyboard.insertText('!');if(await page.locator('.page-edit').textContent()!=='ABX\nY!CDE')throw Error('CRLF caret mismatch '+await page.locator('.page-edit').textContent());
}
