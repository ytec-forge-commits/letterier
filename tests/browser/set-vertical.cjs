async(page)=>{
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 return {vertical:await page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true}).getAttribute('data-writing-mode')==='vertical'};
}
