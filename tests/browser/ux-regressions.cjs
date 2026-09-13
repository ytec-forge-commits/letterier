async (page) => {
  await page.setViewportSize({width:1280,height:720});
  await page.goto('http://127.0.0.1:1420/');
  await page.getByRole('button',{name:'PDF・印刷',exact:true}).waitFor();
  if(await page.locator('[name=document-title]').count())throw new Error('上部に不要な手紙名入力欄が残っています。');
  const header=await page.locator('.app-header').evaluate(element=>({scrollWidth:element.scrollWidth,clientWidth:element.clientWidth}));
  if(header.scrollWidth>header.clientWidth)throw new Error('上部メニューが横にはみ出しています。');
  const pdfLines=await page.getByRole('button',{name:'PDF・印刷',exact:true}).evaluate(element=>Math.round(element.getBoundingClientRect().height/parseFloat(getComputedStyle(element).lineHeight)));
  if(pdfLines>3)throw new Error('PDF・印刷ボタンが二行になっています。');
  if(!await page.getByText('標準フォント',{exact:true}).count())throw new Error('標準フォント設定がありません。');
  if(!await page.getByRole('button',{name:'このページの本文を揃える',exact:true}).count())throw new Error('ページ単位の一括フォント変更がありません。');
  await page.getByRole('button',{name:'ファイル',exact:true}).click();
  if(!await page.getByLabel('手紙の名前').count())throw new Error('手紙名を変更する導線がありません。');
  await page.getByRole('button',{name:'閉じる',exact:true}).click();
  await page.getByRole('button',{name:'設定・使い方',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'設定・使い方'});
  if(await dialog.locator('.paper-decoration').count())throw new Error('画面テーマに便箋画像が表示されています。');
  return {header:true,fontScopes:true,colorOnlyThemes:true};
}
