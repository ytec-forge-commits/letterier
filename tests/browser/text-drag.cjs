async(page)=>{
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 const edit=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('ABCDEF');
 await page.evaluate(()=>{const t=[...document.querySelectorAll('.paper-scroll [data-token]')],r=document.createRange();r.setStart(t[1].firstChild,0);r.setEnd(t[3].firstChild,1);const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));});
 await page.getByRole('button',{name:'太字',exact:true}).click();
 const before=await edit.locator('[data-token]').evaluateAll(xs=>xs.map(x=>({text:x.textContent,weight:x.style.fontWeight})));
 const data=await page.evaluateHandle(()=>new DataTransfer());
 await edit.locator('[data-token]').nth(1).dispatchEvent('dragstart',{dataTransfer:data});
 const last=await edit.locator('[data-token]').last().boundingBox();
 await edit.dispatchEvent('dragover',{dataTransfer:data,clientX:last.x+last.width-1,clientY:last.y+last.height/2});
 await edit.dispatchEvent('drop',{dataTransfer:data,clientX:last.x+last.width-1,clientY:last.y+last.height/2});
 let tokens=await edit.locator('[data-token]').evaluateAll(xs=>xs.map(x=>({text:x.textContent,weight:x.style.fontWeight})));
 if(tokens.map(t=>t.text).join('')!=='AEFBCD')throw Error('Selected text was not moved: '+JSON.stringify(tokens));
 if(tokens.slice(3).some(t=>t.weight!=='700'))throw Error('Formatting lost on move');
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();
 tokens=await edit.locator('[data-token]').evaluateAll(xs=>xs.map(x=>({text:x.textContent,weight:x.style.fontWeight})));
 if(JSON.stringify(tokens)!==JSON.stringify(before))throw Error('Undo did not restore text and formatting');
 await page.evaluate(()=>{const t=[...document.querySelectorAll('.paper-scroll [data-token]')],r=document.createRange();r.setStart(t[1].firstChild,0);r.setEnd(t[3].firstChild,1);const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));});
 await edit.locator('[data-token]').nth(1).dispatchEvent('dragstart',{dataTransfer:data});
 const finish=await edit.locator('[data-token]').last().boundingBox();
 await edit.dispatchEvent('dragover',{dataTransfer:data,ctrlKey:true,clientX:finish.x+finish.width-1,clientY:finish.y+finish.height/2});
 await edit.dispatchEvent('drop',{dataTransfer:data,ctrlKey:true,clientX:finish.x+finish.width-1,clientY:finish.y+finish.height/2});
 const copied=await edit.locator('[data-token]').evaluateAll(xs=>xs.map(x=>({text:x.textContent,weight:x.style.fontWeight})));
 if(copied.map(t=>t.text).join('')!=='ABCDEFBCD'||copied.slice(6).some(t=>t.weight!=='700'))throw Error('Ctrl copy failed: '+JSON.stringify(copied));
 await data.dispose();return {move:true,copy:true,formatting:true,undo:true,eventBoundary:true};
}
