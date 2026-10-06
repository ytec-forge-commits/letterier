async (page) => {
  const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
  await page.setViewportSize({width:375,height:720});
  await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();
  await page.keyboard.insertText('未保存の合成文書');
  const body=()=>page.locator('.page-edit [data-token]').allTextContents().then(parts=>parts.join(''));
  await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'新規作成',exact:true}).click();
  await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
  const prompt=page.getByRole('dialog',{name:'変更を保存しますか？'});
  await prompt.waitFor();
  if(await prompt.evaluate(el=>el.scrollWidth>el.clientWidth+1))throw Error('Unsaved dialog overflow at 375px');
  await prompt.getByRole('button',{name:'保存する',exact:true}).waitFor();
  await page.screenshot({path:'output/playwright/unsaved-prompt-375.png'});
  await prompt.getByRole('button',{name:'キャンセル',exact:true}).click();
  if(await body()!=='未保存の合成文書')throw Error('キャンセルで本文が失われました');
  await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
  await prompt.getByRole('button',{name:'保存しない',exact:true}).click();
  await startup.waitFor({state:'hidden'});
  if(await body()!=='')throw Error('新規作成されていません');
  page.off('pageerror',onError);if(errors.length)throw Error(errors.join(';'));
  return {cancelPreservesText:true,discardCreatesNew:true,dialog375NoOverflow:true,pageErrors:errors};
}
