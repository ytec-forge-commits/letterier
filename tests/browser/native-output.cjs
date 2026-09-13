async(page)=>{
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).waitFor();
 const fonts=await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('installed_fonts'));if(fonts.length<10)throw Error('font enumeration');
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();await page.getByRole('button',{name:'桜の便り 和風 · 春'}).click();await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 await page.locator('.page-edit').first().click();await page.keyboard.insertText('いつも、ありがとう。\nレタリエで綴る季節のお便り。');await page.keyboard.press('Control+a');await page.locator('#font').click();await page.getByRole('dialog',{name:'フォントを選択'}).getByRole('button',{name:'Klee One',exact:true}).last().click();await page.getByRole('button',{name:'このフォントを使う'}).click();
 await page.keyboard.press('Control+End');await page.keyboard.press('Control+Enter');await page.keyboard.insertText('二枚目の手紙です。\nDear my friend, thank you.');
 for(const paper of ['A4','B5','POSTCARD'])for(const orientation of ['portrait','landscape']){
  await page.getByLabel('用紙',{exact:true}).selectOption(paper);await page.getByLabel('用紙の向き',{exact:true}).selectOption(orientation);
  await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();await page.getByRole('dialog',{name:'PDF・印刷の確認'}).waitFor();
  const [a,b]=paper==='A4'?[210,297]:paper==='B5'?[182,257]:[100,148];const width=orientation==='portrait'?a:b,height=orientation==='portrait'?b:a;
  await page.evaluate(async({width,height,name})=>{await document.fonts.ready;await window.__TAURI_INTERNALS__.invoke('qa_export_pdf',{width,height,name});},{width,height,name:`letters-${paper.toLowerCase()}-${orientation}`});
  if(paper==='A4'&&orientation==='portrait')await page.screenshot({path:'output/playwright/native-output.png'});
  await page.getByRole('dialog',{name:'PDF・印刷の確認'}).getByRole('button',{name:'閉じる',exact:true}).click();
 }
 return {fontCount:fonts.length,pdfFiles:6};
}
