async(page)=>{
  if(!await page.getByRole('dialog').count())await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
  if(!await page.getByRole('dialog').count())await page.getByRole('button',{name:'背景・罫線・余白…',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:/ページの背景・罫線/});
  if(await dialog.getByRole('checkbox',{name:'罫線の間隔をフォントに合わせる',exact:true}).count()!==1)throw Error('罫線間隔の自動調整設定がありません。');
  await dialog.getByRole('checkbox',{name:'罫線の間隔をフォントに合わせる',exact:true}).check();
  await dialog.getByRole('checkbox',{name:'罫線の太さを標準フォントに合わせる',exact:true}).check();
  await dialog.getByLabel('1行の目安文字数（全角）',{exact:true}).fill('3');
  await dialog.getByRole('button',{name:'この設定を適用',exact:true}).click();
  const edit=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
  await edit.click();await page.keyboard.insertText('あいうえおかきくけ');
  const lines=await edit.locator('.body-line').evaluateAll(elements=>elements.map(line=>[...line.querySelectorAll('[data-token]')].map(token=>token.textContent).join('')).filter(Boolean));
  if(JSON.stringify(lines)!==JSON.stringify(['あいう','えおか','きくけ']))throw Error('3文字目安の設定が実際の本文へ反映されません: '+JSON.stringify(lines));
  return {autoSpacing:true,autoWidth:true,charactersPerLine:3,lines};
}
