async(page)=>{
  const consoleErrors=[];
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
  await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();
  await page.getByRole('button',{name:'白の和紙 和風 · 通年',exact:true}).click();
  await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
  await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
  const body=page.getByRole('textbox',{name:'手紙の本文 1ページ'});
  await body.click({position:{x:500,y:80}});
  await page.keyboard.insertText('文字を選択するための長い文章です。文字箱をまたいでも選択が解除されないことを確認します。これは再現テスト用の文章です。');
  await page.getByRole('button',{name:'文字箱',exact:true}).click();
  await page.getByLabel('配置方法').selectOption('page');
  await page.getByLabel('横位置（mm）').fill('165');
  await page.getByLabel('縦位置（mm）').fill('55');
  await page.getByLabel('幅（mm）').fill('20');
  await page.getByLabel('高さ（mm）').fill('70');

  const hit=page.getByRole('button',{name:/文字箱を選択/}),box=await hit.boundingBox();
  if(!box)throw Error('文字箱が表示されていません');
  await page.mouse.move(876,250);await page.mouse.down();await page.mouse.move(876,560,{steps:20});await page.mouse.up();
  const selected=await page.evaluate(()=>getSelection()?.toString()??'');
  if(!selected.includes('ため'))throw Error(`文字箱をまたぐ本文選択が解除されました: ${JSON.stringify(selected)}`);

  await hit.click();
  const direction=page.getByLabel('文字箱の書字方向');
  await direction.selectOption('horizontal');
  if(await direction.inputValue()!=='horizontal')throw Error('文字箱を横書きへ変更できません');
  const artwork=page.locator('.object-art .floating-text').first();
  if(await artwork.evaluate(element=>getComputedStyle(element).writingMode)!=='horizontal-tb')throw Error('文字箱の横書き表示が反映されません');
  await direction.selectOption('vertical');
  if(await direction.inputValue()!=='vertical')throw Error('文字箱を縦書きへ変更できません');
  if(await artwork.evaluate(element=>getComputedStyle(element).writingMode)!=='vertical-rl')throw Error('文字箱の縦書き表示が反映されません');

  await page.evaluate(()=>{
    window.__objectDragRectReads=0;
    const original=Element.prototype.getBoundingClientRect;
    window.__objectDragOriginalRect=original;
    Element.prototype.getBoundingClientRect=function(){
      if(this.classList?.contains('paper')||this.classList?.contains('paper-scroll'))window.__objectDragRectReads++;
      return original.call(this);
    };
  });
  const moved=await hit.boundingBox();if(!moved)throw Error('文字箱が見つかりません');
  await page.mouse.move(moved.x+moved.width/2,moved.y+moved.height/2);await page.mouse.down();
  await page.mouse.move(moved.x+moved.width/2-100,moved.y+moved.height/2+100,{steps:80});await page.waitForTimeout(200);await page.mouse.up();
  const rectReads=await page.evaluate(()=>{
    const count=window.__objectDragRectReads;
    Element.prototype.getBoundingClientRect=window.__objectDragOriginalRect;
    delete window.__objectDragOriginalRect;
    return count;
  });
  if(rectReads>8)throw Error(`ドラッグ中のレイアウト再計測が多すぎます: ${rectReads}`);
  const xValue=await page.getByLabel('横位置（mm）').inputValue();
  const yValue=await page.getByLabel('縦位置（mm）').inputValue();
  const x=Number(xValue),y=Number(yValue);
  if(!xValue.trim()||!yValue.trim()||!Number.isFinite(x)||!Number.isFinite(y))throw Error(`ドラッグ後の座標が不正です: x=${JSON.stringify(xValue)}, y=${JSON.stringify(yValue)}`);
  if(await page.getByRole('alert').filter({hasText:'破損しているか'}).count())throw Error('ドラッグ後に便箋データの破損警告が表示されました');
  if(consoleErrors.some(message=>message.includes('NaN')))throw Error(`ドラッグ中にNaNが発生しました: ${consoleErrors.join(' | ')}`);
  return {selection:true,textBoxWritingMode:true,dragRectReads:rectReads,position:{x,y}};
}
