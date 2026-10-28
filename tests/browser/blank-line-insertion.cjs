async page=>{
 const browser=page.context().browser(),results=[];
 for(const direction of ['vertical','horizontal']){
  const context=await browser.newContext({locale:'ja-JP',viewport:{width:1280,height:900}}),test=await context.newPage();
  try{
   const errors=[];test.on('pageerror',e=>errors.push(e.message));
   await test.goto('http://127.0.0.1:1420/');
   await test.getByRole('dialog',{name:'新規作成',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
   await test.getByRole('tab',{name:'レイアウト',exact:true}).click();await test.getByLabel('書字方向',{exact:true}).selectOption(direction);
   const edit=test.locator('.page-edit').first(),line=edit.locator('.body-line').nth(4);
   const selectLine=async()=>{await line.scrollIntoViewIfNeeded();const box=await line.boundingBox();await test.mouse.click(direction==='vertical'?box.x+box.width/2:box.x+2,direction==='vertical'?box.y+2:box.y+box.height/2);};
   const body=()=>test.locator('.page-edit').evaluateAll(nodes=>nodes.map(n=>n.textContent).join('').replaceAll('\u200b',''));
   await selectLine();
   const cdp=await context.newCDPSession(test);
   await cdp.send('Input.imeSetComposition',{text:'とりけし',selectionStart:4,selectionEnd:4});
   await cdp.send('Input.imeSetComposition',{text:'',selectionStart:0,selectionEnd:0});
   if(await body()!=='')throw Error('Cancelling composition inserted blank lines');
   const cancelledLine=await test.evaluate(()=>Number(getSelection().focusNode?.parentElement?.closest('.body-line')?.dataset.lineIndex));
   if(cancelledLine!==4)throw Error('Cancellation lost the clicked blank line: '+cancelledLine);
   await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
   if(await test.locator('[data-ime-preedit]').count()&&await test.locator('[data-ime-preedit]').evaluate(n=>Number(n.closest('.body-line').dataset.lineIndex))!==4)throw Error('Preedit moved away from fifth blank line');
   await cdp.send('Input.insertText',{text:'日本'});
   const actual=await body();
   if(actual!=='\n\n\n\n日本')throw Error(direction+': fifth-line confirmation produced '+JSON.stringify(actual));
   const row=await test.locator('[data-token]').first().evaluate(n=>Number(n.closest('.body-line').dataset.lineIndex));
   if(row!==4)throw Error('Confirmed text did not stay on fifth line: '+row);
   await test.getByRole('button',{name:'元に戻す',exact:true}).click();if(await body()!=='')throw Error('One Undo did not remove the insertion and its blank lines');
   await test.getByRole('button',{name:'やり直す',exact:true}).click();if(await body()!=='\n\n\n\n日本')throw Error('Redo lost the fifth-line placement');
   await test.getByRole('button',{name:'元に戻す',exact:true}).click();await selectLine();await test.keyboard.insertText('ABC');
   if(await body()!=='\n\n\n\nABC')throw Error('Direct insertion ignored the clicked blank line');
   await test.keyboard.press('Control+Home');await test.keyboard.press('Control+End');await test.keyboard.insertText('D');
   if(await body()!=='\n\n\n\nABCD')throw Error('Ctrl+End inserted an unwanted blank line');
   await test.keyboard.press('Control+a');await test.keyboard.press(direction==='vertical'?'ArrowDown':'ArrowRight');await test.keyboard.insertText('E');
   if(await body()!=='\n\n\n\nABCDE')throw Error('Collapsing selection to the text end inserted a blank line');
   await cdp.detach();if(errors.length)throw Error(errors.join(';'));results.push({direction,cancellation:true,confirmation:true,undo:true,redo:true,directInsertion:true});
  }finally{await context.close();}
 }
 return results;
}
