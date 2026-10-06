async(page)=>{
 await page.getByRole('button',{name:'表示倍率を100%に戻す',exact:true}).click();
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 await page.getByLabel('本文の標準サイズ（pt）',{exact:true}).fill('18');
 const body=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});
 await body.fill('あいう12（あ）');
 await body.focus();await page.keyboard.press('Control+a');
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 await page.getByLabel('文字間隔（pt）',{exact:true}).fill('3');
 const measure=()=>page.locator('[data-token]').evaluateAll(els=>els.filter(e=>e.closest('[role=textbox]')).map(e=>{
  const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {text:e.textContent,x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontSize,margin:s.marginInlineEnd};
 }));
 const horizontal=await measure();
 if(horizontal.length!==8||horizontal.some(t=>t.margin!=='4px'||t.font!=='24px'))throw Error('Wrong inherited size or tracking: '+JSON.stringify(horizontal));
 for(let i=1;i<horizontal.length;i++)if(Math.abs(horizontal[i].x-horizontal[i-1].x-horizontal[i-1].w-4)>0.6)throw Error('Horizontal tracking geometry diverges');
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 const vertical=await measure();
 if(!vertical.some(t=>t.text==='12'))throw Error('Automatic TCY missing');
 for(let i=1;i<vertical.length;i++)if(Math.abs(vertical[i].y-vertical[i-1].y-vertical[i-1].h-4)>0.6)throw Error('Vertical tracking geometry diverges: '+JSON.stringify(vertical));
 await page.screenshot({path:'output/playwright/release-2-spacing-vertical.png'});
 await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
 return {horizontal,vertical};
}
