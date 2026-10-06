async(page)=>{
 if(page.url()!=='http://127.0.0.1:1437/tests/browser/modal-contract.html')throw Error('Isolated Modal harness required');
 await page.setViewportSize({width:1280,height:720});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const outside=async()=>{await page.mouse.click(8,8);await page.evaluate(()=>new Promise(requestAnimationFrame));};
 const requireOpen=async(dialog)=>{
  if(!await dialog.isVisible())throw Error('Protected/inside-start dialog was dismissed');
  if(await dialog.getByLabel('合成入力').inputValue()!=='入力は保持されます')throw Error('Dialog input was lost');
 };
 await page.getByRole('button',{name:'通常の画面を開く',exact:true}).click();
 const normal=page.getByRole('dialog',{name:'合成通常画面',exact:true});await normal.waitFor();
 const box=await normal.boundingBox();if(!box)throw Error('Missing dialog geometry');
 await page.mouse.move(box.x+35,box.y+35);await page.mouse.down();await page.mouse.move(8,8);await page.mouse.up();
 await requireOpen(normal);
 await page.screenshot({path:'output/playwright/modal-contract-normal-2.0.0.png'});
 await outside();await normal.waitFor({state:'detached'});
 await page.getByRole('button',{name:'通常の画面を開く',exact:true}).click();await normal.waitFor();
 await page.keyboard.press('Escape');await normal.waitFor({state:'detached'});
 await page.getByRole('button',{name:'必須確認を開く',exact:true}).click();
 const mandatory=page.getByRole('dialog',{name:'合成必須確認',exact:true});await mandatory.waitFor();
 if(await mandatory.getByRole('button',{name:'閉じる',exact:true}).count())throw Error('Mandatory dialog has a close button');
 await outside();await requireOpen(mandatory);await page.keyboard.press('Escape');await requireOpen(mandatory);
 await page.screenshot({path:'output/playwright/modal-contract-mandatory-2.0.0.png'});
 await mandatory.getByRole('button',{name:'明示的に続行する',exact:true}).click();await mandatory.waitFor({state:'detached'});
 await page.getByRole('button',{name:'処理中画面を開く',exact:true}).click();
 const busy=page.getByRole('dialog',{name:'合成処理中',exact:true});await busy.waitFor();
 if(await busy.getByRole('button',{name:'閉じる',exact:true}).count())throw Error('Busy dialog has a close button');
 await outside();await requireOpen(busy);await page.keyboard.press('Escape');await requireOpen(busy);
 await page.screenshot({path:'output/playwright/modal-contract-busy-2.0.0.png'});
 await busy.getByRole('button',{name:'合成処理を完了する',exact:true}).click();
 await busy.getByRole('button',{name:'閉じる',exact:true}).waitFor();
 await outside();await busy.waitFor({state:'detached'});
 if(errors.length)throw Error(errors.join(';'));
 return {result:'PASS',realModal:true,insideDragPreserved:true,outsideDismissed:true,escapeDismissed:true,mandatoryPreserved:true,busyPreserved:true,afterBusyDismissed:true,pageErrors:errors,nativeOperations:false};
}
