async (page) => {
  const editor=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
  if(await editor.count()!==1) throw new Error('RED: 紙面本文の編集ホストがありません。');
  await editor.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('あいうえお');
  const text=()=>page.locator('[data-token]').allTextContents().then(a=>a.join(''));
  if(await text()!=='あいうえお') throw new Error('本文入力が一致しません。');
  await page.keyboard.press('Shift+ArrowLeft');
  await page.keyboard.press('Shift+ArrowLeft');
  await page.getByRole('button',{name:'太字',exact:true}).click();
  const bold=await page.locator('[data-token]').evaluateAll(els=>els.filter(el=>Number(getComputedStyle(el).fontWeight)>=600).map(el=>el.textContent).join(''));
  if(bold!=='えお') throw new Error('部分書式が選択範囲と一致しません: '+bold);
  await page.getByRole('button',{name:'元に戻す',exact:true}).click();
  const remainingBold=await page.locator('[data-token]').evaluateAll(els=>els.some(el=>Number(getComputedStyle(el).fontWeight)>=600));
  if(remainingBold || await text()!=='あいうえお') throw new Error('書式のUndoで本文または書式を破損しました。');
  await page.getByRole('button',{name:'やり直す',exact:true}).click();
  await page.getByLabel('書字方向').selectOption('vertical');
  const direction=await editor.evaluate(el=>el.dataset.writingMode);
  if(direction!=='vertical' || await text()!=='あいうえお') throw new Error('縦横変更で本文が失われました。');
  await page.screenshot({path:'output/playwright/editor-contract.png'});
  return {input:true,selectionFormatting:true,undo:true,redo:true,vertical:true};
}
