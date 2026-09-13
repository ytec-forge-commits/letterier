async(page)=>{
 await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
 await page.locator('.page-edit').first().click();await page.keyboard.press('Control+a');await page.keyboard.insertText(('あ'.repeat(80)+'\n').repeat(35));
 const focusEnd=()=>page.evaluate(()=>{const host=document.querySelector('.page-edit');const n=Array.from(host.querySelectorAll('[data-offset]')).at(-1);host.focus();getSelection().setBaseAndExtent(n.firstChild,n.textContent.length,n.firstChild,n.textContent.length);});
 await focusEnd();await page.keyboard.press('ArrowRight');if(await page.evaluate(()=>getSelection().focusNode.parentElement.closest('.page-edit').getAttribute('aria-label'))!=='手紙の本文 2ページ')throw Error('Right boundary blocked');
 await focusEnd();await page.keyboard.press('ArrowDown');if(await page.evaluate(()=>getSelection().focusNode.parentElement.closest('.page-edit').getAttribute('aria-label'))!=='手紙の本文 2ページ')throw Error('Down boundary blocked');
 await page.keyboard.press('Control+a');await page.keyboard.insertText('ABCDE');
 await page.evaluate(()=>{let t=document.querySelector('[data-offset="2"]');getSelection().setBaseAndExtent(t.firstChild,0,t.firstChild,0);const d=new DataTransfer();d.setData('text/plain','X\r\nY');document.querySelector('.page-edit').dispatchEvent(new ClipboardEvent('paste',{clipboardData:d,bubbles:true,cancelable:true}));});
 await page.keyboard.insertText('!');if(await page.locator('.page-edit').textContent()!=='ABX\nY!CDE')throw Error('CRLF caret mismatch '+await page.locator('.page-edit').textContent());
 await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const first=page.locator('.page-edit').first();await first.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('甲乙');await page.keyboard.press('Enter');
 const newlineCaret=await page.evaluate(()=>{const s=getSelection(),n=s.anchorNode,p=n?.nodeType===3?n.parentElement:n;return {offset:s.anchorOffset,empty:p instanceof HTMLElement&&p.hasAttribute('data-empty'),lineStart:p instanceof HTMLElement?p.dataset.offset:null};});
 if(!newlineCaret.empty||newlineCaret.lineStart!=='3'||newlineCaret.offset!==0)throw Error('newline caret restored to wrong node '+JSON.stringify(newlineCaret));
 await page.keyboard.insertText('丙');await page.keyboard.press('Enter');await page.keyboard.insertText('丁');
 if(!(await first.textContent()).startsWith('甲乙\n丙\n丁'))throw Error('vertical newline input returned to an earlier line');
}
