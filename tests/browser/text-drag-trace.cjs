async(page)=>{
 const edit=page.getByRole('textbox',{name:'手紙の本文 1ページ',exact:true});await edit.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('ABCDEF');
 await page.evaluate(async()=>{
  const {readSelection}=await import('/src/ui/EditorCanvas.tsx');window.dragTrace=[];
  for(const kind of ['dragstart','dragover','drop','dragend'])document.querySelector('.paper-scroll').addEventListener(kind,e=>{const r=document.caretRangeFromPoint(e.clientX,e.clientY);window.dragTrace.push({kind,range:readSelection(),target:r?{text:r.startContainer.textContent,offset:r.startOffset}:null,default:e.defaultPrevented,x:e.clientX,y:e.clientY});},{capture:true});
  const t=[...document.querySelectorAll('.paper-scroll [data-token]')],r=document.createRange();r.setStart(t[1].firstChild,0);r.setEnd(t[3].firstChild,1);const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));
 });
 const first=await edit.locator('[data-token]').nth(1).boundingBox(),last=await edit.locator('[data-token]').last().boundingBox();
 await page.mouse.move(first.x+first.width/2,first.y+first.height/2);await page.mouse.down();await page.mouse.move(last.x+last.width/2,last.y+last.height-1,{steps:20});await page.mouse.up();
 return {first,last,trace:await page.evaluate(()=>window.dragTrace)};
}
