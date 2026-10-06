async(page)=>{
 if(new URL(page.url()).origin!=='http://127.0.0.1:1421')throw Error('Synthetic local browser required');
 const d=page.locator('dialog[open]');
 await d.getByLabel('Category',{exact:true}).selectOption({label:'My templates'});
 const value=await d.getByLabel('Category',{exact:true}).inputValue();
 if(value!=='自分のテンプレート')throw Error('Translated label changed the internal category value: '+value);
 if(!await d.locator('.template-grid button').count())throw Error('Saved synthetic templates missing');
 await d.getByLabel('Category',{exact:true}).selectOption({label:'Western'});
 if(await d.locator('.template-grid button').count()!==10)throw Error('Western filter does not show 10 series');
 await d.getByLabel('Season',{exact:true}).selectOption({label:'Spring'});
 if(await d.locator('.template-grid button').count()!==2)throw Error('Western spring filter does not show 2 series');
 return {internalValuesStable:true,savedTemplatesShown:true,western:10,westernSpring:2};
}
