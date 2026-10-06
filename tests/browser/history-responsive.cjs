async(page)=>{
 const modal=page.getByRole('dialog',{name:'保存履歴',exact:true});await modal.waitFor();await page.setViewportSize({width:375,height:720});
 const dimensions=await modal.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));if(dimensions.scroll>dimensions.client+1)throw Error('History modal horizontal overflow: '+JSON.stringify(dimensions));
 await modal.getByLabel('保護版の名前',{exact:true}).fill('合成375保護');await modal.getByRole('button',{name:'現在を保護版にする',exact:true}).click();const protectedEntry=modal.getByRole('button').filter({hasText:'★ 合成375保護'});await protectedEntry.waitFor();await protectedEntry.click();await modal.getByRole('button',{name:'この状態へ復元する',exact:true}).waitFor({state:'visible'});await page.screenshot({path:'output/playwright/save-recovery-history-375.png'});await modal.getByRole('button',{name:'閉じる',exact:true}).first().click();
 return {history375NoOverflow:true,protectAndPreview:true,dimensions};
}
