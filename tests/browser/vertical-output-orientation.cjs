async(page)=>{
 const id=await page.evaluate(()=>window.__TAURI_INTERNALS__?.invoke('plugin:app|identifier'));
 if(id!=='jp.ytec.binsen-kobo.qa-save-20261002')throw Error('Dedicated native synthetic QA required');
 const body=(await page.locator('.page-edit [data-token]').allTextContents()).join('');
 if(!body.startsWith('あいうえおかきくけさしすせそたちつてとABCDEFG123「便箋」（確認）'))throw Error('Known synthetic mixed fixture required');
 const d=page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true});if(await d.count())await d.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();await d.waitFor();await d.getByLabel('プレビューの内容',{exact:true}).selectOption('pdf');await page.evaluate(()=>document.fonts.ready);
 const result=await page.evaluate(()=>{
  const inspect=selector=>[...document.querySelectorAll(selector)].filter(t=>/^[A-G0-9]$/.test(t.textContent)).map(t=>({text:t.textContent,offset:t.dataset.offset,orientation:getComputedStyle(t).textOrientation,mode:getComputedStyle(t).writingMode,combine:getComputedStyle(t).textCombineUpright}));
  const editor=inspect('.page-edit [data-token]'),preview=inspect('dialog .page-text [data-token]');
  if(editor.length!==10||preview.length!==10)throw Error('All seven letters and three digits must be inspected');
  if(editor.some(t=>t.orientation!=='upright'||t.mode!=='vertical-rl'))throw Error('Editor upright fixture missing');
  if(preview.some(t=>t.orientation!=='upright'||t.mode!=='vertical-rl'))throw Error('Vertical output preview rotates ASCII that the editor keeps upright: '+JSON.stringify(preview));
  if(JSON.stringify(editor)!==JSON.stringify(preview))throw Error('Editor and output orientation disagree');
  return {editor,preview};
 });
 await page.screenshot({path:'output/playwright/native-vertical-output-orientation.png'});await d.getByRole('button',{name:'閉じる',exact:true}).click();return result;
}
