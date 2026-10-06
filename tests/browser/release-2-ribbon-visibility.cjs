async(page)=>{
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 const result=await page.getByRole('checkbox',{name:'段落の最初・最後の1行を別ページに分けない',exact:true}).evaluate(el=>{
  const label=el.closest('label').getBoundingClientRect(),panel=el.closest('.ribbon-panel').getBoundingClientRect();
  return {bottom:label.bottom,panelBottom:panel.bottom,top:label.top,panelTop:panel.top};
 });
 if(result.bottom>result.panelBottom||result.top<result.panelTop)throw Error('Paragraph control is clipped: '+JSON.stringify(result));
 await page.screenshot({path:'output/playwright/release-2-layout-visible.png'});
 return result;
}
