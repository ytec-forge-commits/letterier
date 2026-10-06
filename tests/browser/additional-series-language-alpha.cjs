async(page)=>{
 const assets=[];
 for(const series of ['nanohana','asagao','goldfish','momiji','moon','snow-garden','camellia','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas','washi','ichimatsu','classic','dots'])for(const number of [2,3,4,5])for(const companion of ['', '-companion'])assets.push(`/template-motifs/${series}-v${number}${companion}.png`);
 const alpha=await page.evaluate(async(paths)=>{
  const rows=[];
  for(const path of paths){
   const response=await fetch(path);if(!response.ok)throw Error('PNG load failed: '+path);
   const bitmap=await createImageBitmap(await response.blob());const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
   const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(bitmap,0,0);bitmap.close();
   const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;let transparent=0,painted=0;
   for(let index=3;index<pixels.length;index+=4){if(pixels[index]===0)transparent++;else painted++;}
   const corners=[0,canvas.width-1,(canvas.height-1)*canvas.width,canvas.width*canvas.height-1].map(index=>pixels[index*4+3]);
   // ImageGen can leave one alpha quantization step at an otherwise clear corner.
   // Accept <=1/255 (not a visibly painted background); preserve the original PNG.
   if(corners.some(value=>value>1)||transparent===0||painted===0)throw Error('Invalid alpha: '+JSON.stringify({path,transparent,painted,corners}));
   rows.push({path,width:canvas.width,height:canvas.height,transparent,painted,corners});
  }
  return rows;
 },assets);
 await page.getByRole('tab',{name:'ヘルプ',exact:true}).click();await page.getByRole('button',{name:'設定・使い方',exact:true}).click();await page.getByLabel('表示言語',{exact:true}).selectOption('en');await page.getByRole('dialog',{name:'Settings & Help',exact:true}).getByRole('button',{name:'Close',exact:true}).click();
 await page.setViewportSize({width:375,height:720});await page.getByRole('tab',{name:'Home',exact:true}).click();await page.getByRole('button',{name:'Change stationery',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Change stationery',exact:true});const choices=[];
 for(const series of [{id:'nanohana',name:'Rapeseed & Butterfly Japanese · Spring',last:'windmill'},{id:'asagao',name:'Morning Glory & Wind Chime Japanese · Summer',last:'pot'},{id:'goldfish',name:'Goldfish & Ripples Japanese · Summer',last:'waterweeds'},{id:'momiji',name:'Maple Colors Japanese · Autumn',last:'basin'},{id:'moon',name:'Moon & Pampas Grass Japanese · Autumn',last:'Lantern'},{id:'snow-garden',name:'Snow Garden Japanese · Winter',last:'Snow-covered bamboo'},{id:'camellia',name:'Camellia Letter Japanese · Winter',last:'Twig with buds'},{id:'mimosa',name:'Mimosa Wreath Western · Spring',last:'Mimosa gift parcel'},{id:'tulip',name:'Tulip Garden Western · Spring',last:'Tulips and songbird'},{id:'seaside',name:'Seaside Blue Western · Summer',last:'Footprints on sand'},{id:'lemon',name:'Lemon Letter Western · Summer',last:'Lemon tart'},{id:'autumn-leaf',name:'Autumn Leaves Western · Autumn',last:'Pressed autumn leaves'},{id:'woodland',name:'Woodland Harvest Western · Autumn',last:'Woodland tree stump'},{id:'snowflake',name:'Snow Crystal Western · Winter',last:'Little snowy house'},{id:'christmas',name:'Christmas Wreath Western · Winter',last:'Bells and holly'},{id:'washi',name:'White Washi Japanese · All year',last:'Hemp-leaf watermark'},{id:'ichimatsu',name:'Indigo Ichimatsu Japanese · All year',last:'Ocean-wave band'},{id:'classic',name:'Classic Letter Western · All year',last:'Books and letter'},{id:'dots',name:'Pastel Dots Western · All year',last:'Buttons and thread'}]){
  await dialog.getByRole('button',{name:series.name,exact:true}).click();
  const options=await dialog.getByLabel('Design',{exact:true}).locator('option').allTextContents();if(options.length!==5||!options[4].includes(series.last))throw Error('English design names missing: '+options);
  await dialog.getByLabel('Design',{exact:true}).selectOption('5');await dialog.getByLabel('Cycle through five designs on following pages',{exact:true}).check();
  const overflow=await dialog.evaluate(el=>el.scrollWidth>el.clientWidth+1);if(overflow)throw Error('Dialog overflow');
  const paths=await dialog.locator('.template-preview .paper-decoration image').evaluateAll(elements=>elements.map(el=>el.getAttribute('href')));
  if(paths.length!==(['washi','classic','dots'].includes(series.id)?2:4)||!paths[0].includes(`${series.id}-v5.png`)||!paths[1].includes(`${series.id}-v5-companion.png`)||(['washi','classic','dots'].includes(series.id)?await dialog.locator('.template-preview .paper-decoration').nth(1).locator('path, circle').count()===0:!paths[2].includes(`/${series.id}.png`)))throw Error('Preview cycle did not update');
  await page.screenshot({path:`output/playwright/${series.id}-choice-375-en.png`});choices.push({series:series.id,options,paths});
 }
 await dialog.getByRole('button',{name:'Close',exact:true}).click();await page.setViewportSize({width:1280,height:720});await page.getByRole('tab',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Settings & Help',exact:true}).click();await page.getByLabel('Display language',{exact:true}).selectOption('ja');await page.getByRole('dialog',{name:'設定・使い方',exact:true}).getByRole('button',{name:'閉じる',exact:true}).click();
 return {alpha,choices};
}
