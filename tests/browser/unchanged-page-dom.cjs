async(page)=>{
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).click();await page.keyboard.press('Control+a');
 const text='先頭ページの本文。'.repeat(1000).slice(0,10000);
 await page.keyboard.insertText(text);
 await page.evaluate(()=>{window.__unchangedBody=document.querySelector('.page-edit');window.__unchangedToken=window.__unchangedBody.querySelector('[data-token]');});
 await page.keyboard.insertText('末');
 const state=await page.evaluate(()=>({same:document.querySelector('.page-edit')===window.__unchangedBody,token:window.__unchangedToken.isConnected,text:[...document.querySelectorAll('.page-edit [data-token]')].map(n=>n.textContent).join('')}));
 if(state.text!==text+'末')throw Error('Tail insertion changed body content');
 if(!state.same||!state.token)throw Error('Unchanged first page was remounted on tail insertion');
 await page.keyboard.press('Control+Home');await page.keyboard.insertText('頭');
 const actual=(await page.locator('.page-edit [data-token]').allTextContents()).join('');
 if(actual!=='頭'+text+'末')throw Error('Head insertion/caret failed');
 return {unchangedPagePreserved:true,tailInsertion:true,headInsertion:true};
}
