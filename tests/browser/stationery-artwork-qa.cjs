async(page)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewportSize({width:1280,height:900});
 const results=[];
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 for(const series of [{id:'sakura',name:'桜の便り 和風 · 春'},{id:'nanohana',name:'菜の花と蝶 和風 · 春'},{id:'asagao',name:'朝顔と風鈴 和風 · 夏'},{id:'goldfish',name:'金魚と水紋 和風 · 夏'},{id:'momiji',name:'紅葉の彩り 和風 · 秋'},{id:'moon',name:'月とすすき 和風 · 秋'},{id:'snow-garden',name:'雪の庭 和風 · 冬'},{id:'camellia',name:'椿の便り 和風 · 冬'},{id:'mimosa',name:'ミモザのリース 洋風 · 春'},{id:'tulip',name:'チューリップガーデン 洋風 · 春'},{id:'seaside',name:'シーサイドブルー 洋風 · 夏'},{id:'lemon',name:'レモンの便り 洋風 · 夏'},{id:'autumn-leaf',name:'秋色リーフ 洋風 · 秋'},{id:'woodland',name:'森の実り 洋風 · 秋'},{id:'snowflake',name:'スノークリスタル 洋風 · 冬'},{id:'christmas',name:'クリスマスリース 洋風 · 冬'},{id:'washi',name:'白の和紙 和風 · 通年'},{id:'ichimatsu',name:'藍の市松 和風 · 通年'},{id:'classic',name:'クラシックレター 洋風 · 通年'},{id:'dots',name:'パステルドット 洋風 · 通年'}])for(const mode of ['horizontal','vertical']){
  await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption(mode);
  await page.getByRole('tab',{name:'表示',exact:true}).click();await page.getByLabel('表示倍率',{exact:true}).selectOption('0.5');
  for(const number of [1,2,3,4,5]){
   await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'便箋変更',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'便箋変更',exact:true});await dialog.getByRole('button',{name:series.name,exact:true}).click();
   await dialog.getByLabel('図案',{exact:true}).selectOption(String(number));await dialog.getByLabel('続きのページで5図案を順番に使う',{exact:true}).uncheck();
   await dialog.getByRole('button',{name:'今の手紙にデザインを適用',exact:true}).click();
   const frame=page.locator('.paper-scroll .sheet-frame').first();await frame.scrollIntoViewIfNeeded();
   const info=await frame.evaluate(async(el,mode)=>{
    const images=[...el.querySelectorAll('.paper-decoration image')];
    for(const image of images){const response=await fetch(image.getAttribute('href'));if(!response.ok)throw Error('Artwork HTTP error');const bitmap=await createImageBitmap(await response.blob());if(bitmap.width<700)throw Error('Artwork resolution too low');bitmap.close();}
    const boxes=images.map(el=>({x:+el.getAttribute('x'),y:+el.getAttribute('y'),w:+el.getAttribute('width'),h:+el.getAttribute('height')}));
    const overlaps=[...el.querySelectorAll('.ruling line')].filter(el=>{const r={x1:+el.getAttribute('x1'),x2:+el.getAttribute('x2'),y1:+el.getAttribute('y1'),y2:+el.getAttribute('y2')};return boxes.some(b=>mode==='vertical'?r.x1>b.x&&r.x1<b.x+b.w&&r.y2>b.y&&r.y1<b.y+b.h:r.y1>b.y&&r.y1<b.y+b.h&&r.x2>b.x&&r.x1<b.x+b.w);}).length;
    return {paths:images.map(el=>el.getAttribute('href')),overlaps,fibers:el.querySelectorAll('.paper-decoration path, .paper-decoration circle').length};
   },mode);
   const expected=['washi','classic','dots'].includes(series.id)&&number===1?[]:number===1?[`/template-motifs/${series.id}.png`,`/template-motifs/${series.id}-companion.png`]:[`/template-motifs/${series.id}-v${number}.png`,`/template-motifs/${series.id}-v${number}-companion.png`];
   if((['washi','classic','dots'].includes(series.id)&&number===1&&info.fibers===0)||info.overlaps||JSON.stringify(info.paths.map(path=>new URL(path,page.url()).pathname))!==JSON.stringify(expected))throw Error('Decoration/ruling failure: '+JSON.stringify(info));
   await frame.screenshot({path:`output/playwright/${series.id}-v${number}-${mode}.png`});results.push({series:series.id,mode,number,...info});
  }
 }
 await page.setViewportSize({width:1280,height:720});await page.screenshot({path:'output/playwright/stationery-choice-editor-1280.png'});
 if(errors.length)throw Error('Page errors: '+errors.join(';'));return {cases:results.length,results,errors};
}
