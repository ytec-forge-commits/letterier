async(page)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:1280,height:720});
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});
 if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 const trigger=page.getByRole('button',{name:'文字の色',exact:true}),popover=page.locator('.color-popover');
 const failures=[];
 await trigger.click();await popover.waitFor();
 await page.getByRole('banner').getByText('レタリエ',{exact:true}).click();
 try{await popover.waitFor({state:'hidden',timeout:1500});}catch{failures.push('outside pointer did not dismiss');await popover.getByRole('button',{name:'閉じる',exact:true}).click();}
 await trigger.click();await popover.waitFor();
 await page.keyboard.press('Escape');
 try{await popover.waitFor({state:'hidden',timeout:1500});}catch{failures.push('Escape did not dismiss');await popover.getByRole('button',{name:'閉じる',exact:true}).click();}
 if(failures.length)throw Error(failures.join('; '));
 const body=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
 await body.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('ABCDEF');
 await page.keyboard.press('Control+a');await trigger.click();await page.getByRole('button',{name:'文字の色 #273b35',exact:true}).click();
 await body.click();await page.keyboard.press('Control+Home');await page.keyboard.down('Shift');for(let i=0;i<3;i++)await page.keyboard.press('ArrowRight');await page.keyboard.up('Shift');
 if(await page.evaluate(()=>window.getSelection()?.toString())!=='ABC')throw Error('Synthetic partial selection not established');
 await page.getByLabel('文字サイズ（pt）',{exact:true}).fill('20');await page.getByRole('button',{name:'太字',exact:true}).click();
 await trigger.click();
 if(await page.evaluate(()=>window.getSelection()?.toString())!=='ABC')throw Error('Opening palette cleared partial selection');
 await page.getByRole('button',{name:'文字の色 #b23b42',exact:true}).click();await popover.waitFor({state:'hidden'});
 const tokens=await page.locator('.page-edit [data-token]').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent,color:getComputedStyle(node).color})));
 if(tokens.map(token=>token.text).join('')!=='ABCDEF'||tokens.filter(token=>token.color==='rgb(178, 59, 66)').map(token=>token.text).join('')!=='ABC'||tokens.filter(token=>token.color==='rgb(39, 59, 53)').map(token=>token.text).join('')!=='DEF')throw Error('Color changed outside the selection: '+JSON.stringify(tokens));
 const formatting=await page.locator('.page-edit [data-token]').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent,size:getComputedStyle(node).fontSize,weight:getComputedStyle(node).fontWeight})));
 if(formatting.filter(token=>token.size==='26.6667px'&&token.weight==='700').map(token=>token.text).join('')!=='ABC'||formatting.filter(token=>token.size==='18.6667px'&&token.weight==='400').map(token=>token.text).join('')!=='DEF')throw Error('Color operation changed size/bold formatting: '+JSON.stringify(formatting));
 await trigger.click();await popover.getByRole('button',{name:'閉じる',exact:true}).focus();await page.keyboard.press('Escape');await popover.waitFor({state:'hidden'});
 if(!await trigger.evaluate(element=>document.activeElement===element))throw Error('Keyboard dismissal did not return focus to its trigger');
 await trigger.click();await popover.getByLabel('文字の色（任意の色）',{exact:true}).focus();
 await page.keyboard.press('Tab');await page.keyboard.press('Enter');await popover.waitFor({state:'hidden'});
 if(!await trigger.evaluate(element=>document.activeElement===element))throw Error('Explicit close did not return focus');
 await trigger.click();await page.getByRole('button',{name:'文字の色 #315a45',exact:true}).focus();await page.keyboard.press('Enter');await popover.waitFor({state:'hidden'});
 if(!await trigger.evaluate(element=>document.activeElement===element))throw Error('Keyboard color choice did not return focus');
 await page.screenshot({path:'output/playwright/palette-dismiss-1280.png'});
 if(errors.length)throw Error(errors.join(';'));
 const result={outsideDismiss:true,escapeDismiss:true,selectedColorOnly:true,mixedSizeBoldPreserved:true,keyboardFocusReturn:true,closeFocusReturn:true,keyboardColorFocusReturn:true,pageErrors:errors};
 await page.evaluate(value=>{window.__letterierPaletteDismissQA=value;},result);return result;
}
