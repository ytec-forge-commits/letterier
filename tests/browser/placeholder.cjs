async(page)=>{
 await page.setViewportSize({width:1280,height:720});
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();
 await page.getByRole('button',{name:'月とすすき 和風 · 秋',exact:true}).click();
 await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 await page.getByRole('dialog',{name:'便箋を選ぶ',exact:true}).waitFor({state:'hidden'});
 const results=[];
 for(const mode of ['vertical','horizontal']){
  await page.getByLabel('書字方向',{exact:true}).selectOption(mode);
  const geometry=await page.locator('.sheet-frame').first().evaluate(frame=>{
   const hint=frame.querySelector('.paper-placeholder'),line=frame.querySelector('.body-line');
   const h=hint.getBoundingClientRect(),l=line.getBoundingClientRect(),css=getComputedStyle(hint);
   return {mode:css.writingMode,x:h.x,y:h.y,lineX:l.x,lineY:l.y,width:h.width,height:h.height};
  });
  await page.screenshot({path:`output/playwright/placeholder-${mode}.png`});
  if(geometry.mode!==(mode==='vertical'?'vertical-rl':'horizontal-tb'))throw Error('案内文の書字方向が本文と異なります: '+JSON.stringify(geometry));
  if(Math.abs(geometry.x-geometry.lineX)>1||Math.abs(geometry.y-geometry.lineY)>1)throw Error('案内文が本文の書き始めにありません: '+JSON.stringify(geometry));
  results.push(geometry);
 }
 await page.locator('.page-edit').first().click();await page.keyboard.insertText('検証');
 if(await page.locator('.paper-placeholder').count())throw Error('本文入力後も案内文が残っています');
 return results;
}
