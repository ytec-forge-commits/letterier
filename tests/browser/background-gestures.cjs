async(page)=>{
  await page.setViewportSize({width:1280,height:720});
  if(!await page.getByRole('dialog').count())await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
  if(!await page.getByRole('dialog').count())await page.getByRole('button',{name:'背景・罫線・余白…',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:/ページの背景・罫線/});
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#dce8ef"/><circle cx="50" cy="50" r="30" fill="#315a45"/></svg>';
  await dialog.locator('input[type=file]').setInputFiles({name:'synthetic-background.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
  await dialog.locator('.paper-background').waitFor();
  if(await dialog.getByRole('button',{name:'背景画像を移動',exact:true}).count()!==1)throw Error('背景画像をマウスで直接移動する操作がありません。');
  const move=dialog.getByRole('button',{name:'背景画像を移動',exact:true}),box=await move.boundingBox();
  if(!box)throw Error('背景移動の操作面が表示されません。');
  const before=await dialog.locator('.paper-background').evaluate(image=>image.style.transform);
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);
  await page.mouse.down();await page.mouse.move(box.x+box.width*.5+18,box.y+box.height*.5+12,{steps:6});await page.mouse.up();
  const moved=await dialog.locator('.paper-background').evaluate(image=>image.style.transform);
  if(moved===before)throw Error('ドラッグしても背景位置が変わりません。');
  const handle=dialog.getByRole('button',{name:'背景画像を右下から拡縮',exact:true}),rect=await handle.boundingBox();
  if(!rect)throw Error('拡縮ハンドルが表示されません。');
  await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();
  await page.mouse.move(rect.x+rect.width/2-12,rect.y+rect.height/2-12,{steps:6});await page.mouse.up();
  const resized=await dialog.locator('.paper-background').evaluate(image=>image.style.transform);
  if(resized===moved)throw Error('拡縮ハンドルが機能しません。');
  await dialog.getByRole('button',{name:'全体を収める',exact:true}).click();
  const reset=await dialog.locator('.paper-background').evaluate(image=>({fit:image.style.objectFit,transform:image.style.transform}));
  if(reset.fit!=='contain'||!reset.transform.includes('scale(1)'))throw Error('全体を収める操作が位置・倍率をリセットしません。');
  await dialog.getByRole('button',{name:'この設定を適用',exact:true}).click();
  if(!await page.locator('.paper-scroll .paper-background').count())throw Error('背景画像の編集結果が手紙へ適用されません。');
  return {drag:true,resize:true,fit:true,apply:true,before,moved,resized};
}
