async page=>{
 const identifier=await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('plugin:app|identifier'));
 if(identifier!=='jp.ytec.binsen-kobo.ime-qa-20261028')throw Error('Isolated synthetic profile required');
 const mode=await page.evaluate(()=>window.__numberWritingMode??'horizontal');if(!['horizontal','vertical'].includes(mode))throw Error('Invalid writing mode');
 const open=page.locator('dialog[open]');if(await open.count())await open.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByLabel('ページ番号を印刷',{exact:true}).check();
 const body=page.locator('.page-edit').first();await body.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('アラビア数字の印刷確認、一枚目。\fアラビア数字の印刷確認、二枚目。');
 if(mode==='vertical'){await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption(mode);}
 await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();const dialog=page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true});
 await dialog.getByRole('button',{name:'PDFとして保存…',exact:true}).click();await page.locator('.print-output .print-sheet').first().waitFor({state:'attached'});
 return await page.evaluate(async mode=>{
  await document.fonts.ready;const numbers=[...document.querySelectorAll('.print-output .paper-page-number')].map(el=>({text:el.textContent,writingMode:getComputedStyle(el).writingMode,align:getComputedStyle(el).textAlign}));
  if(JSON.stringify(numbers.map(n=>n.text))!=='["1","2"]'||numbers.some(n=>n.writingMode!=='horizontal-tb'||n.align!=='center'))throw Error('Arabic page numbers missing in actual print output');
  const path=await window.__TAURI_INTERNALS__.invoke('qa_export_pdf',{width:210,height:297,name:`arabic-page-numbers-${mode}`});return {numbers,path};
 },mode);
}
