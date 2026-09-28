async (page) => {
  const first=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
  const text=()=>page.locator('[data-token]').allTextContents().then(a=>a.join(''));
  for(const direction of ['horizontal','vertical']) {
    await page.getByLabel('書字方向').selectOption(direction);
    await first.click();await page.keyboard.press('Control+a');
    const long='春の風が便りを運ぶ。'.repeat(160);
    await page.keyboard.insertText(long);
    if(await page.getByRole('textbox',{name:/手紙の本文/}).count()<2 || await text()!==long) throw new Error('自動改ページで本文が失われました: '+direction);
    await page.keyboard.press('Backspace');
    if(await text()!==long.slice(0,-1))throw new Error('末尾の削除が一致しません。');
    await page.keyboard.press('Control+a');await page.keyboard.insertText('前後');
    await page.keyboard.press(direction==='vertical'?'ArrowUp':'ArrowLeft');
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.imeSetComposition',{text:'にほん',selectionStart:3,selectionEnd:3});
    await cdp.send('Input.insertText',{text:'日本語'});
    await cdp.detach();
    if(await text()!=='前日本語後')throw new Error('変換確定時に重複または欠落: '+direction+' '+await text());
    await page.keyboard.insertText('！');
    if(await text()!=='前日本語！後')throw new Error('変換直後のキャレット不一致: '+await text());
  }
  return {longTextHorizontal:true,longTextVertical:true,compositionCommit:true,caretAfterComposition:true};
}
