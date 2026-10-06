async (page) => {
 const name='更新検証-'+Date.now();
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 if(!await page.getByRole('dialog',{name:'便箋変更',exact:true}).count())await page.getByRole('button',{name:'便箋変更',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'便箋変更',exact:true});
 await dialog.getByRole('button',{name:'今の便箋を登録…',exact:true}).click();
 await dialog.getByLabel('名前',{exact:true}).fill(name);
 await dialog.getByRole('button',{name:'登録する',exact:true}).click();
 await dialog.getByRole('button',{name:'✉ '+name+' デザインのみ',exact:true}).click();
 await dialog.getByRole('button',{name:'今の便箋で登録を更新…',exact:true}).click();
 await dialog.getByLabel('名前',{exact:true}).fill(name+'-編集後');
 await dialog.getByRole('button',{name:'更新する',exact:true}).click();
 await dialog.getByRole('button',{name:'✉ '+name+'-編集後 デザインのみ',exact:true}).waitFor();
 if(await dialog.getByRole('button',{name:'✉ '+name+' デザインのみ',exact:true}).count())throw Error('旧登録が別の項目として残りました');
 await dialog.getByRole('button',{name:'閉じる',exact:true}).click();
 return {updateKeepsOneRegistration:true};
}
