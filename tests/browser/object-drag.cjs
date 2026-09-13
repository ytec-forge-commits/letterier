async(page)=>{
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).click();await page.getByRole('button',{name:'白の和紙 和風 · 通年',exact:true}).click();await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
 await page.locator('.toolbar input[type=file]').setInputFiles('output/fixtures/日本語素材.png');
 const hit=page.getByRole('button',{name:'画像を選択 日本語素材.png',exact:true});await hit.waitFor();await page.getByRole('button',{name:'末尾にページを追加',exact:true}).click();
 const rect=await hit.boundingBox();if(!rect)throw Error('image drag handle not visible');
 await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();
 if(await page.locator('body > .object-drag-ghost').count()!==1)throw Error('drag ghost is not rendered above paper clipping');
 const scroll=page.locator('.paper-scroll'),viewport=await scroll.boundingBox();if(!viewport)throw Error('paper scroll not visible');
 await page.mouse.move(viewport.x+viewport.width/2,viewport.y+viewport.height-5,{steps:6});await page.waitForTimeout(250);
 if(await scroll.evaluate(el=>el.scrollTop)<=0)throw Error('cross-page drag did not auto-scroll');
 if(!await page.locator('body > .object-drag-ghost').isVisible())throw Error('drag ghost disappeared while crossing pages');
 await page.mouse.up();await page.getByRole('button',{name:/2ページ ／ 固定 日本語素材\.png/}).waitFor();
}
