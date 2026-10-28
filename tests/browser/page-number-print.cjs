async page=>{
 const results=[];
 const open=page.locator('dialog[open]');if(await open.count())await open.getByRole('button',{name:/^(閉じる|Close)$/}).click();
 for(const mode of ['horizontal','vertical']){
  await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption(mode);
  await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByLabel('ページ番号を印刷',{exact:true}).check();await page.getByLabel('行末を揃える',{exact:true}).check();
  const body=page.locator('.page-edit').first();await body.click();await page.keyboard.press('Control+a');
  const first='春の便りをお届けします。お元気でお過ごしでしょうか。'.repeat(6)+'\n最後の短い行';await page.keyboard.insertText(first+'\f二枚目の合成文書。');
  await page.evaluate(()=>{window.__originalPrint=window.print;window.print=()=>{window.__capturedPrint=document.querySelector('.print-output')?.cloneNode(true);};});
  await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();
  const output=page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true});await output.getByRole('button',{name:'PDFとして保存…',exact:true}).click();
  await output.getByRole('status').filter({hasText:'ブラウザの印刷画面を開きました。'}).waitFor();
  const numbers=await page.evaluate(()=>{const capture=window.__capturedPrint;if(!capture)throw Error('Print DOM was not captured');document.body.append(capture);return [...capture.querySelectorAll('.paper-page-number')].map(n=>n.textContent);});
  if(JSON.stringify(numbers)!=='["1","2"]')throw Error('Print portal page numbers missing');
  await page.emulateMedia({media:'print'});await page.pdf({path:`output/playwright/editing-20261027-${mode}-print.pdf`,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.__capturedPrint.remove();delete window.__capturedPrint;window.print=window.__originalPrint;delete window.__originalPrint;});
  await output.getByRole('button',{name:'閉じる',exact:true}).click();results.push({mode,numbers,printedBodyCharacters:first.length});
 }
 return {results,notes:'Chromium PDF from the actual print portal DOM. Does not replace Windows WebView2 PDF or printer validation.'};
}
