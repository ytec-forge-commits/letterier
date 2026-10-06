async(page)=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});
 if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.setViewportSize({width:1280,height:720});
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 await page.getByRole('button',{name:'背景・罫線・余白…',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:/ページの背景・罫線/});
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#315a45"/></svg>';
 await dialog.locator('input[type=file]').setInputFiles({name:'synthetic-escape.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
 const results=[];
 // A pointer gesture must receive Escape even after a different form button had focus.
 for(const name of ['背景画像を移動','背景画像を左上から拡縮','背景画像を右上から拡縮','背景画像を左下から拡縮','背景画像を右下から拡縮']){
  await dialog.getByRole('button',{name:'全体を収める',exact:true}).click();
  const before=await dialog.locator('.paper-background').evaluate(el=>el.style.transform);
  const target=dialog.getByRole('button',{name,exact:true}),box=await target.boundingBox();
  if(!box)throw Error('Missing gesture surface');
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+12,box.y+box.height/2+8,{steps:6});
  const changed=await dialog.locator('.paper-background').evaluate(el=>el.style.transform);
  if(changed===before)throw Error('Gesture never changed background: '+name);
  await page.keyboard.press('Escape');await page.mouse.up();
  if(!await dialog.count())throw Error('Escape closed the entire editor during gesture: '+name);
  if(await dialog.locator('.paper-background').evaluate(el=>el.style.transform)!==before)throw Error('Escape did not restore gesture start: '+name);
  if(!await target.evaluate(el=>document.activeElement===el))throw Error('Gesture surface lost keyboard focus: '+name);
  results.push({name,changed,restored:before});
 }
 // Idle Escape still closes normally, with no pending edit applied.
 await page.keyboard.press('Escape');if(await dialog.count())throw Error('Idle Escape did not close dialog');
 return {mouseGestures:5,escapeRestoresGesture:true,idleEscapeClosesDialog:true,results};
}
