async(page)=>{
 const addedPages=[];
 for(const series of [{id:'nanohana',name:'菜の花と蝶 和風 · 春'},{id:'asagao',name:'朝顔と風鈴 和風 · 夏'},{id:'goldfish',name:'金魚と水紋 和風 · 夏'},{id:'momiji',name:'紅葉の彩り 和風 · 秋'},{id:'moon',name:'月とすすき 和風 · 秋'},{id:'snow-garden',name:'雪の庭 和風 · 冬'},{id:'camellia',name:'椿の便り 和風 · 冬'},{id:'mimosa',name:'ミモザのリース 洋風 · 春'},{id:'tulip',name:'チューリップガーデン 洋風 · 春'},{id:'seaside',name:'シーサイドブルー 洋風 · 夏'},{id:'lemon',name:'レモンの便り 洋風 · 夏'},{id:'autumn-leaf',name:'秋色リーフ 洋風 · 秋'},{id:'woodland',name:'森の実り 洋風 · 秋'},{id:'snowflake',name:'スノークリスタル 洋風 · 冬'},{id:'christmas',name:'クリスマスリース 洋風 · 冬'},{id:'washi',name:'白の和紙 和風 · 通年'},{id:'ichimatsu',name:'藍の市松 和風 · 通年'},{id:'classic',name:'クラシックレター 洋風 · 通年'},{id:'dots',name:'パステルドット 洋風 · 通年'}]){
  await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'便箋変更',exact:true}).click();
  const selection=page.getByRole('dialog',{name:'便箋変更',exact:true});await selection.getByRole('button',{name:series.name,exact:true}).click();
  await selection.getByLabel('図案',{exact:true}).selectOption('5');await selection.getByLabel('続きのページで5図案を順番に使う',{exact:true}).check();
  await selection.getByRole('button',{name:'今の手紙にデザインを適用',exact:true}).click();await page.getByRole('button',{name:'末尾にページを追加',exact:true}).click();
  const papers=page.locator('.paper-scroll .sheet-frame');if(await papers.count()!==2)throw Error('Page not added');
  const art=await papers.nth(1).locator('.paper-decoration image').evaluateAll(elements=>elements.map(el=>el.getAttribute('href')));
  if(['washi','classic','dots'].includes(series.id)?(art.length!==0||await papers.nth(1).locator('.paper-decoration path, .paper-decoration circle').count()===0):new URL(art[0],page.url()).pathname!==`/template-motifs/${series.id}.png`)throw Error('Cycle wrap failed: '+art);
  await page.getByRole('button',{name:'元に戻す',exact:true}).click();if(await papers.count()!==1)throw Error('Undo page add failed');addedPages.push({series:series.id,art});
 }
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'便箋変更',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'便箋変更',exact:true});await dialog.getByRole('button',{name:'桜の便り 和風 · 春',exact:true}).click();
 await dialog.getByLabel('図案',{exact:true}).selectOption('3');await dialog.getByLabel('続きのページで5図案を順番に使う',{exact:true}).check();
 await dialog.getByRole('button',{name:'今の手紙にデザインを適用',exact:true}).click();
 await page.getByRole('button',{name:'末尾にページを追加',exact:true}).click();
 const frames=page.locator('.paper-scroll .sheet-frame');if(await frames.count()!==2)throw Error('Page not added');
 const second=await frames.nth(1).locator('.paper-decoration image').evaluateAll(elements=>elements.map(el=>el.getAttribute('href')));
 if(second.length!==2||!second[0].includes('sakura-v4.png'))throw Error('Added page lost cycled art: '+second);
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();if(await frames.count()!==1)throw Error('Undo page add failed');
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'設定・使い方',exact:true}).click();await page.getByLabel('表示言語',{exact:true}).selectOption('en');
 await page.getByRole('dialog',{name:'Settings & Help',exact:true}).getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('tab',{name:'Home',exact:true}).click();await page.getByRole('button',{name:'Change stationery',exact:true}).click();
 const english=page.getByRole('dialog',{name:'Change stationery',exact:true});await english.getByRole('button',{name:'Cherry Blossom Letter Japanese · Spring',exact:true}).click();
 const names=await english.getByLabel('Design',{exact:true}).locator('option').allTextContents();if(!names[4].includes('paper umbrella'))throw Error('English design names missing');
 await english.getByLabel('Cycle through five designs on following pages',{exact:true}).waitFor();
 await page.screenshot({path:'output/playwright/stationery-choice-1280-en.png'});
 await page.setViewportSize({width:375,height:720});
 const overflow=await english.evaluate(el=>el.scrollWidth>el.clientWidth+1);if(overflow)throw Error('Stationery dialog horizontal overflow at 375');
 await english.getByLabel('Design',{exact:true}).selectOption('5');await english.getByLabel('Cycle through five designs on following pages',{exact:true}).check();
 const previewPaths=await english.locator('.template-preview .paper-decoration image').evaluateAll(elements=>elements.map(el=>el.getAttribute('href')));
 if(!previewPaths[0].includes('sakura-v5.png')||!previewPaths[2].includes('/sakura.png'))throw Error('Narrow-screen preview did not update and cycle: '+previewPaths);
 await page.screenshot({path:'output/playwright/stationery-choice-375-en.png'});
 await english.getByRole('button',{name:'Close',exact:true}).click();await page.setViewportSize({width:1280,height:720});
 await page.getByRole('tab',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Settings & Help',exact:true}).click();await page.getByLabel('Display language',{exact:true}).selectOption('ja');await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 return {additionalSeries:addedPages,addedPageArt:second,undo:true,englishOptions:names,dialog375NoOverflow:true,narrowPreviewPaths:previewPaths};
}
