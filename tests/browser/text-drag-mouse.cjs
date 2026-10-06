async(page)=>{
 const edit=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('ABCDEF');
 await edit.locator('[data-token]').nth(1).scrollIntoViewIfNeeded();
 const vertical=await edit.getAttribute('data-writing-mode')==='vertical';
 const endPoint=box=>({x:vertical?box.x+box.width/2:box.x+box.width-1,y:vertical?box.y+box.height-1:box.y+box.height/2});
 const select=()=>page.evaluate(()=>{const t=[...document.querySelectorAll('.paper-scroll [data-token]')],r=document.createRange();r.setStart(t[1].firstChild,0);r.setEnd(t[3].firstChild,1);const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));});
 await select();
 const first=await edit.locator('[data-token]').nth(1).boundingBox(),last=await edit.locator('[data-token]').last().boundingBox();
 await page.mouse.move(first.x+first.width/2,first.y+first.height/2);await page.mouse.down();
 await page.mouse.move(endPoint(last).x,endPoint(last).y,{steps:20});await page.mouse.up();
 let text=await edit.locator('[data-token]').evaluateAll(xs=>xs.map(x=>x.textContent).join(''));
 if(text!=='AEFBCD')throw Error('Native mouse drag did not move selected text: '+text);
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();await select();
 const source=await edit.locator('[data-token]').nth(1).boundingBox(),target=await edit.locator('[data-token]').last().boundingBox();
 await page.keyboard.down('Control');
 await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(endPoint(target).x,endPoint(target).y,{steps:20});await page.mouse.up();await page.keyboard.up('Control');
 text=await edit.locator('[data-token]').evaluateAll(xs=>xs.map(x=>x.textContent).join(''));
 if(text!=='ABCDEFBCD')throw Error('Native Ctrl mouse drag did not copy: '+text);
 return {nativeMouseMove:true,nativeMouseCtrlCopy:true,vertical};
}
