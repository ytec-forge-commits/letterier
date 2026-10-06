async(page)=>{
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'便箋変更',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'便箋変更',exact:true});await dialog.getByRole('button',{name:'桜の便り 和風 · 春',exact:true}).click();await dialog.getByRole('button',{name:'今の手紙にデザインを適用',exact:true}).click();
 await page.getByRole('tab',{name:'表示',exact:true}).click();await page.getByLabel('表示倍率',{exact:true}).selectOption('0.5');
 const paper=page.locator('.paper-scroll .sheet-frame').first();await paper.scrollIntoViewIfNeeded();
 await page.screenshot({path:'output/playwright/decoration-ruling-vertical.png'});
 const overlaps=await paper.evaluate(el=>{
  const images=[...el.querySelectorAll('.paper-decoration image')].map(x=>({x:+x.getAttribute('x'),y:+x.getAttribute('y'),w:+x.getAttribute('width'),h:+x.getAttribute('height')}));
  const rules=[...el.querySelectorAll('.ruling line')].map(x=>({x1:+x.getAttribute('x1'),x2:+x.getAttribute('x2'),y1:+x.getAttribute('y1'),y2:+x.getAttribute('y2')}));
  return rules.filter(r=>images.some(b=>r.x1>b.x&&r.x1<b.x+b.w&&r.y2>b.y&&r.y1<b.y+b.h)).length;
 });if(overlaps)throw Error('Rule overlaps motif placement: '+overlaps);
 return {overlaps,vertical:true,zoom:50};
}
