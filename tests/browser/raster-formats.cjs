async(page)=>{
 await page.getByRole('alert').getByRole('button',{name:'閉じる',exact:true}).click();
 const results=[];
 for(const file of ['日本語素材.png','日本語素材.jpg','日本語素材.bmp','日本語素材.webp','回転情報付き.jpg','小さな.webp']){
  await page.locator('.toolbar input[type=file]').setInputFiles(`output/fixtures/${file}`);await page.getByRole('button',{name:`画像を選択 ${file}`,exact:true}).waitFor();
  const size=await page.locator('.paper-scroll .object-art img').last().evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight}));if(!size.width)throw Error('empty image '+file);if(file==='回転情報付き.jpg'&&(size.width!==80||size.height!==120))throw Error('EXIF orientation');results.push({file,...size});
 }
 return results;
}
