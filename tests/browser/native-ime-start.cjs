async page => {
  const identifier=await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('plugin:app|identifier'));
  if(identifier!=='jp.ytec.binsen-kobo.ime-qa-20261028')throw Error('Isolated QA profile required');
  return await page.evaluate(async()=>{
    const invoke=window.__TAURI_INTERNALS__.invoke;
    try {
      const result=await invoke('native_ime',{request:{op:'start',session:900001,text:'前😀後',start:1,end:3}});
      if(!result.available)throw Error('Native connection unavailable');
      return result;
    } finally {await invoke('native_ime',{request:{op:'stop',session:900001}});}
  });
}
