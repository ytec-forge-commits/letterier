async(page)=>{
 if(new URL(page.url()).origin!=='http://127.0.0.1:1421')throw Error('Synthetic local browser required');
 const dialog=page.locator('dialog[open]');
 await dialog.getByRole('button',{name:'Save current stationery…',exact:true}).click();
 await dialog.getByLabel('Name',{exact:true}).fill('保存履歴・白の和紙');
 await dialog.getByRole('button',{name:'Save template',exact:true}).click();
 await dialog.locator('.template-register').waitFor({state:'hidden'});
 const actual=await dialog.locator('.template-grid strong').allTextContents();
 if(!actual.includes('保存履歴・白の和紙'))throw Error('User template name was translated: '+JSON.stringify(actual));
 if(await dialog.locator('.template-detail strong').first().innerText()!=='保存履歴・白の和紙')throw Error('Preview name was translated');
 await dialog.getByRole('button',{name:'Delete saved template…',exact:true}).click();
 const confirm=await dialog.locator('p.warning').innerText();
 if(!confirm.includes('Delete the saved template “保存履歴・白の和紙”.'))throw Error('Deletion confirmation: '+confirm);
 await dialog.getByRole('button',{name:'Back',exact:true}).click();
 return {namePreserved:true,deleteConfirmationTranslated:true,deletionCancelled:true};
}
