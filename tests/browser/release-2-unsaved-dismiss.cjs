async(page)=>{
 const file=page.getByRole('dialog',{name:'ファイル',exact:true});if(await file.count())await file.getByRole('button',{name:'閉じる',exact:true}).click();
 const body=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});const before=await body.textContent();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'新規作成',exact:true}).click();
 await page.getByRole('dialog',{name:'新規作成',exact:true}).getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 const prompt=page.getByRole('dialog',{name:'変更を保存しますか？',exact:true});await prompt.waitFor();
 await page.mouse.click(4,4);await prompt.waitFor({state:'hidden'});
 if(await body.textContent()!==before)throw Error('Dismissing unsaved prompt discarded the letter');
 return {outsideCancelsSwitch:true,originalBodyPreserved:true};
}
