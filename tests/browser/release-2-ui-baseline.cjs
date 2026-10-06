async(page)=>{
 const missing=[];
 await page.setViewportSize({width:1280,height:720});
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});
 if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 if(!await page.getByLabel('文字間隔（pt）',{exact:true}).count())missing.push('tracking control');
 if(!await page.locator('.statusbar input[type=range]').count())missing.push('status-bar zoom');
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 if(!await page.getByLabel('本文の標準サイズ（pt）',{exact:true}).count())missing.push('default font size');
 if(!await page.getByRole('checkbox',{name:'段落の最初・最後の1行を別ページに分けない',exact:true}).count())missing.push('orphan explanation');
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();
 await page.getByRole('button',{name:'設定・使い方',exact:true}).click();
 await page.mouse.click(4,4);
 if(await page.getByRole('dialog',{name:'設定・使い方',exact:true}).isVisible()){
  missing.push('outside-click dismissal');
  await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 }
 await page.locator('.ribbon-titlebar').getByRole('button',{name:'PDF・印刷',exact:true}).click();
 const order=await page.locator('.output-settings').evaluate(el=>{
  const fields=[...el.querySelectorAll('label.field')].map(n=>n.textContent);
  const buttons=[...el.querySelectorAll('button')].map(n=>n.textContent);
  return {fields,buttons};
 });
 if(!/部数/.test(order.fields[1]??'')||!/出力するページ/.test(order.fields[2]??''))missing.push('page range below copies');
 if(order.buttons.at(-1)!=='PDFとして保存…')missing.push('PDF button at bottom');
 await page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 if(missing.length)throw Error('Missing requested UI: '+missing.join(', '));
 return {allRequestedControlsPresent:true};
}
