async(page)=>{
 return await page.evaluate(async()=>{
  const {newProject,bodyText}=await import('/src/core/model.ts');
  const {compose,emMm}=await import('/src/core/compose.ts');
  const {measureText,fontStack}=await import('/src/ui/typography.ts');
  const {bundledFonts}=await import('/src/core/bundled-fonts.ts');
  const fonts=bundledFonts.map(f=>f.name);
  for(const family of fonts)await document.fonts.load(`14pt ${fontStack(family)}`,'便箋ABC');
  await document.fonts.ready;
  let cases=0,pages=0;const failures=[];
  for(const fontFamily of fonts)for(const vertical of [false,true])for(const sizePt of [6,14,24,48,72]){
   const p=newProject();p.baseStyle.fontFamily=fontFamily;p.settings.orphanControl=false;p.settings.writingMode=vertical?'vertical':'horizontal';
   p.pages[0].ruling.charactersPerLine=20;p.continuation=structuredClone(p.pages[0]);
   p.body.runs=[{text:'あいうえお ABC 12「便箋」'.repeat(4),style:{}},{text:'大きな文字 Mixed FONT '.repeat(4),style:{fontFamily,sizePt,bold:true,italic:true}},{text:'小さい文字と続きの文章'.repeat(4),style:{fontFamily:'Klee One',sizePt:6}}];
   try{
    const layout=compose(p,measureText),lines=layout.pages.flatMap(x=>x.lines);
    if(lines.flatMap(l=>l.tokens).map(t=>t.text).join('')!==bodyText(p))throw Error('Text lost during wrapping');
    for(const page of layout.pages)for(const line of page.lines){
     if(line.tokens.reduce((sum,t)=>sum+t.advance,0)>line.extent+.01)throw Error('Inline overflow');
     if(line.tokens.some(t=>emMm(t.style)>line.spacing*.92+.01))throw Error('Cross-axis overflow');
     if(line.x<-.01||line.y<-.01||line.x+(vertical?line.spacing:line.extent)>layout.width+.01||line.y+(vertical?line.extent:line.spacing)>layout.height+.01)throw Error('Outside paper');
    }
    for(const page of layout.pages){const bands=page.rulingTracks;for(let i=1;i<bands.length;i++){const a=bands[i-1],b=bands[i];if(vertical?a.x<b.x+b.spacing-.01:a.y+a.spacing>b.y+.01)throw Error('Overlapping rule bands');}}
    pages+=layout.pages.length;cases++;
   }catch(e){failures.push({fontFamily,vertical,sizePt,message:e.message});}
  }
  if(failures.length)throw Error(JSON.stringify(failures));
  return {fonts:fonts.length,cases,pages,checks:['text preserved','actual measured wrapping','font-size clearance','paper bounds','rule-band separation'],native:false};
 });
}
