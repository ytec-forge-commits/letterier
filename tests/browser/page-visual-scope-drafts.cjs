async(page)=>{
 // Catch continuation values leaking into the page/all draft, or scope changes
 // discarding edits. Exercise the real dialog, not a mock of its state.
 if(new URL(page.url()).hostname!=='127.0.0.1')throw Error('Synthetic local browser only');
 await page.setViewportSize({width:1280,height:720});
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});
 if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 if((await page.locator('.page-edit [data-token]').allTextContents()).join(''))throw Error('Fresh synthetic body required');
 await page.locator('.page-edit').first().click();await page.keyboard.insertText('範囲設定の合成試験');
 await page.keyboard.press('Control+Enter');await page.keyboard.insertText('続きの合成試験');
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 const open=async()=>{await page.getByRole('button',{name:'背景・罫線・余白…',exact:true}).click();const d=page.getByRole('dialog',{name:/ページの背景・罫線/});await d.waitFor();return d;};
 const configure=async(d,color,spacing,left)=>{
  await d.getByLabel('背景の色',{exact:true}).fill(color);
  await d.getByRole('checkbox',{name:'罫線の間隔をフォントに合わせる',exact:true}).uncheck();
  await d.getByLabel('罫線の間隔（mm）',{exact:true}).fill(String(spacing));
  await d.getByLabel('左余白（mm）',{exact:true}).fill(String(left));
 };
 const check=async(d,color,spacing,left)=>{
  const got={color:await d.getByLabel('背景の色',{exact:true}).inputValue(),spacing:await d.getByLabel('罫線の間隔（mm）',{exact:true}).inputValue(),left:await d.getByLabel('左余白（mm）',{exact:true}).inputValue()};
  if(got.color!==color||Number(got.spacing)!==spacing||Number(got.left)!==left)throw Error('Scope draft mixed or lost: '+JSON.stringify({got,want:{color,spacing,left}}));
 };
 let d=await open();const selectedPage=Number((await d.getByRole('heading').textContent()).match(/\d+/)[0]);
 await d.getByLabel('変更する範囲',{exact:true}).selectOption('continuation');await configure(d,'#ccddee',9,31);
 await d.getByRole('button',{name:'この設定を適用',exact:true}).click();
 d=await open();await configure(d,'#ffeedd',8,23);await d.getByRole('button',{name:'この設定を適用',exact:true}).click();
 const before=(await page.locator('.page-edit [data-token]').allTextContents()).join('');
 d=await open();await check(d,'#ffeedd',8,23);await configure(d,'#aabbcc',10,25);
 const range=d.getByLabel('変更する範囲',{exact:true});await range.selectOption('continuation');await check(d,'#ccddee',9,31);
 await configure(d,'#123456',11,33);
 await range.selectOption('page');await check(d,'#aabbcc',10,25);
 await range.selectOption('all');await check(d,'#aabbcc',10,25);
 await range.selectOption('continuation');await check(d,'#123456',11,33);
 await range.selectOption('all');await check(d,'#aabbcc',10,25);
 await page.screenshot({path:'output/playwright/page-visual-scope-drafts-1280.png'});
 await d.getByRole('button',{name:'この設定を適用',exact:true}).click();
 if((await page.locator('.page-edit [data-token]').allTextContents()).join('')!==before)throw Error('Scope application changed body');
 d=await open();await check(d,'#aabbcc',10,25);await d.getByLabel('変更する範囲',{exact:true}).selectOption('continuation');await check(d,'#aabbcc',10,25);
 await configure(d,'#778899',12,35);await d.getByRole('button',{name:'キャンセル',exact:true}).click();
 d=await open();await check(d,'#aabbcc',10,25);await d.getByRole('button',{name:'キャンセル',exact:true}).click();
 await page.getByRole('button',{name:'元に戻す',exact:true}).first().click();
 d=await open();await check(d,'#ffeedd',8,23);await d.getByLabel('変更する範囲',{exact:true}).selectOption('continuation');await check(d,'#ccddee',9,31);await d.getByRole('button',{name:'キャンセル',exact:true}).click();
 return {selectedPage,scopeDraftsKept:true,allApplied:true,cancelUnchanged:true,oneUndoRestored:true,bodyUnchanged:true};
}
