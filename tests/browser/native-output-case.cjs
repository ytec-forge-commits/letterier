async(page)=>{
 const identifier=await page.evaluate(()=>window.__TAURI_INTERNALS__?.invoke('plugin:app|identifier'));
 if(identifier!=='jp.ytec.binsen-kobo.qa-output-20261002')throw Error('Dedicated synthetic output application required');
 const input=await page.evaluate(()=>window.__letterierOutputCase);
 if(!input||!['A4','B5','POSTCARD'].includes(input.paper)||!['portrait','landscape'].includes(input.orientation)||!['horizontal','vertical'].includes(input.mode)||!['','2'].includes(input.range))throw Error('Invalid synthetic output case');
 if(!await page.evaluate(()=>Boolean(window.__letterierOutputQA)))throw Error('Synthetic preparation required');
 const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();
 await page.getByLabel('用紙',{exact:true}).selectOption(input.paper);
 await page.getByLabel('用紙の向き',{exact:true}).selectOption(input.orientation);
 await page.getByLabel('書字方向',{exact:true}).selectOption(input.mode);
 await page.getByRole('button',{name:'PDF・印刷',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'PDF・印刷の確認',exact:true});await dialog.waitFor();
 await dialog.getByLabel('プレビューの内容',{exact:true}).selectOption('pdf');
 if(input.range)await dialog.getByLabel('出力するページ',{exact:true}).fill(input.range);
 const count=await dialog.locator('.output-preview-frame').count();if(count!==(input.range?1:2))throw Error('Unexpected output page count: '+count);
 const name=`ui-${input.paper.toLowerCase()}-${input.orientation}-${input.mode}${input.range?'-range2':''}`;
 let result;
 try {
  // The immutable Tauri invoke function is never replaced. The genuine UI opens
  // its save dialog; while that dialog is waiting, inspect the prepared output
  // and export via the existing debug-only command to a dedicated QA directory.
  // The caller must cancel this exact QA native save dialog afterwards.
  await dialog.getByRole('button',{name:'PDFとして保存…',exact:true}).click();
  await page.locator('.print-output .print-sheet').first().waitFor({state:'attached'});
  result=await page.evaluate(async({name,count})=>{
   await document.fonts.ready;
   const sheets=[...document.querySelectorAll('.print-output .print-sheet')];
   if(!sheets.length)throw Error('UI output preparation missing');
   const transforms=sheets.map(s=>s.querySelector('.print-transform').style.transform);
   if(transforms.some(t=>t!=='translate(0mm, 0mm) scale(1)'))throw Error('PDF must use actual size');
   const bodies=sheets.map(s=>s.querySelector('.page-text').textContent);
   const expected=window.__letterierOutputQA.expected.split('\f');
   const selected=count===1?[expected[1]]:expected;
   if(JSON.stringify(bodies.map(body=>body.replaceAll('\f','')))!==JSON.stringify(selected))throw Error('Prepared output body differs from the synthetic fixture');
   const art=sheets.map(s=>[...s.querySelectorAll('.paper-decoration image')].map(n=>n.getAttribute('href')));
   if(art.some(a=>!a.some(p=>p.includes('/momiji-v5.png'))))throw Error('Expected original artwork missing');
   if(sheets.length!==count)throw Error('Unexpected prepared page count');
   const overlaps=sheets.reduce((total,sheet)=>{
    const boxes=[...sheet.querySelectorAll('.paper-decoration image')].map(n=>n.getBoundingClientRect());
    return total+[...sheet.querySelectorAll('.page-text [data-token]')].filter(n=>{const r=n.getBoundingClientRect();return boxes.some(b=>r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top);}).length;
   },0);
   if(overlaps)throw Error('Rendered output glyphs overlap artwork: '+overlaps);
   const canvas=sheets[0].querySelector('.print-canvas');
   const width=parseFloat(canvas.style.width),height=parseFloat(canvas.style.height);
   const path=await window.__TAURI_INTERNALS__.invoke('qa_export_pdf',{width,height,name});
   return {name,width,height,sheets:sheets.length,bodies,art,transforms,overlaps,path};
  },{name,count});
  if(!result||result.name!==name||result.sheets!==count)throw Error('Actual native PDF invocation not captured');
  if(input.range&&(!result.bodies[0].includes('第二頁')||result.bodies[0].includes('第一頁')))throw Error('Range filter leaked another page');
  await page.screenshot({path:`output/playwright/native-${name}.png`});
 } finally {
  page.off('pageerror',onError);
 }
 if(errors.length)throw Error(errors.join(';'));
 result={...input,...result,pageErrors:errors};await page.evaluate(result=>window.__letterierOutputQA.results.push(result),result);
 return result;
}
