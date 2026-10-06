async(page)=>{
 const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 const series=[['sakura','桜の便り 和風 · 春'],['nanohana','菜の花と蝶 和風 · 春'],['asagao','朝顔と風鈴 和風 · 夏'],['goldfish','金魚と水紋 和風 · 夏'],['momiji','紅葉の彩り 和風 · 秋'],['moon','月とすすき 和風 · 秋'],['snow-garden','雪の庭 和風 · 冬'],['camellia','椿の便り 和風 · 冬'],['mimosa','ミモザのリース 洋風 · 春'],['tulip','チューリップガーデン 洋風 · 春'],['seaside','シーサイドブルー 洋風 · 夏'],['lemon','レモンの便り 洋風 · 夏'],['autumn-leaf','秋色リーフ 洋風 · 秋'],['woodland','森の実り 洋風 · 秋'],['snowflake','スノークリスタル 洋風 · 冬'],['christmas','クリスマスリース 洋風 · 冬'],['washi','白の和紙 和風 · 通年'],['ichimatsu','藍の市松 和風 · 通年'],['classic','クラシックレター 洋風 · 通年'],['dots','パステルドット 洋風 · 通年']];
 const results=[];
 for(const [id,name] of series)for(const mode of ['horizontal','vertical']){
  await page.getByRole('tab',{name:'ホーム',exact:true}).click();await page.getByRole('button',{name:'新規作成',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'新規作成',exact:true});await dialog.getByRole('button',{name,exact:true}).click();
  await dialog.getByRole('combobox',{name:'プレビューの書字方向',exact:true}).selectOption(mode);await dialog.getByLabel('図案',{exact:true}).selectOption('5');
  await dialog.getByLabel('続きのページで5図案を順番に使う',{exact:true}).check();await dialog.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
  const discard=page.getByRole('button',{name:'保存しない',exact:true});if(await discard.count())await discard.click();
  await dialog.waitFor({state:'hidden'});
  const body=page.locator('.paper-scroll .page-edit').first();if(await body.getAttribute('data-writing-mode')!==mode)throw Error('New direction mismatch');
  if((await page.locator('.page-edit [data-token]').allTextContents()).join('')!=='')throw Error('New letter retained old body');
  const art=await page.locator('.paper-scroll .paper-decoration image').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  if(art.length!==2||!art[0].includes(`/${id}-v5.png`)||!art[1].includes(`/${id}-v5-companion.png`))throw Error('New artwork mismatch: '+art);
  await page.getByRole('button',{name:'末尾にページを追加',exact:true}).click();
  const continuation=await page.locator('.paper-scroll .sheet-frame').nth(1).locator('.paper-decoration image').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  if(['washi','classic','dots'].includes(id)?(continuation.length!==0||await page.locator('.paper-scroll .sheet-frame').nth(1).locator('.paper-decoration path, .paper-decoration circle').count()===0):(continuation.length!==2||!continuation[0].includes(`/${id}.png`)))throw Error('New cycle wrap mismatch: '+continuation);
  await page.getByRole('button',{name:'元に戻す',exact:true}).click();if(await page.locator('.paper-scroll .sheet-frame').count()!==1)throw Error('New page-add undo mismatch');
  results.push({id,mode,art,continuation});
 }
 page.off('pageerror',onError);if(errors.length)throw Error(errors.join(';'));return {newLetters:results.length,results,errors};
}
