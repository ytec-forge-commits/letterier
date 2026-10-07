async(page)=>{
 const edit=page.locator('.page-edit').first();
 const results=[];
 for(const direction of ['vertical','horizontal']){
  await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
  await page.getByLabel('書字方向',{exact:true}).selectOption(direction);
  await page.getByRole('tab',{name:'ホーム',exact:true}).click();
  for(const fixture of [
   {name:'paragraph',text:'前の行\n\n次の行',line:1,want:'前の行\n日本\n次の行'},
   {name:'paragraph-page',text:'前の行\n\n\f次の行',line:1,want:'前の行\n日本\n\f次の行'},
   {name:'empty-page',text:'\f次の行',line:0,want:'日本\f次の行'},
   {name:'empty-paragraph-page',text:'\n\f次の行',line:0,want:'日本\n\f次の行'},
  ]){
  await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText(fixture.text);
  const line=edit.locator('.body-line').nth(fixture.line);await line.scrollIntoViewIfNeeded();const box=await line.boundingBox();
  await page.mouse.click(direction==='vertical'?box.x+box.width/2:box.x+1,direction==='vertical'?box.y+1:box.y+box.height/2);
  const caret=await page.evaluate(()=>{const r=getSelection().getRangeAt(0).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});
  if(direction==='vertical'?caret.width<5:caret.height<5)throw Error('改行済み空行の行頭キャレットが不可視: '+direction+' '+fixture.name+' '+JSON.stringify(caret));
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
  const preedit=await page.evaluate(()=>{const r=getSelection().getRangeAt(0).getBoundingClientRect();return {x:r.x,y:r.y};});
  if(direction==='vertical'?Math.abs(preedit.x-caret.x)>3:Math.abs(preedit.y-caret.y)>3)throw Error('IME未確定文字が別行へ移動: '+JSON.stringify({direction,caret,preedit}));
  await cdp.send('Input.insertText',{text:'日本'});await cdp.detach();
  const text=(await page.locator('.page-edit').allTextContents()).join('').replaceAll('\u200b','');
  if(text!==fixture.want)throw Error('空行IME確定位置が違う: '+text);
  await page.getByRole('button',{name:'元に戻す',exact:true}).click();
  if((await page.locator('.page-edit').allTextContents()).join('').replaceAll('\u200b','')!==fixture.text)throw Error('空行IMEのUndoが不一致');
  results.push({direction,fixture:fixture.name,caret,preedit});
  }
 }
 return results;
}
