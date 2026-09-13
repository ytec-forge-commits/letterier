async(page)=>{
 await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();
 await page.getByRole('dialog',{name:'PDF・印刷の確認'}).waitFor();
 await page.emulateMedia({media:'print'});
 try{
  const colors=await page.evaluate(()=>({canvas:getComputedStyle(document.documentElement).backgroundColor,body:getComputedStyle(document.body).backgroundColor,paper:getComputedStyle(document.querySelector('.print-output .paper-art')).backgroundColor}));
  // Printer margins and the space exposed by uniform shrinking must be unpainted white,
  // while the letter's own selected paper color must remain in the page artwork.
  if(colors.canvas!=='rgb(255, 255, 255)'||colors.body!=='rgb(255, 255, 255)')throw Error('印刷用紙の外側へ操作画面の背景色が混入します: '+JSON.stringify(colors));
  await page.pdf({path:'output/playwright/print-line-after.pdf',printBackground:true,preferCSSPageSize:true});
  return colors;
 }finally{
  await page.emulateMedia({media:'screen'});
  await page.getByRole('dialog',{name:'PDF・印刷の確認'}).getByRole('button',{name:'閉じる',exact:true}).click();
 }
}
