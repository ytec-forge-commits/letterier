async(page)=>{
 const errors=[];const onError=error=>errors.push(error.message);page.on('pageerror',onError);
 const results=[];
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 try {
  for(const language of ['en','ja']){
   await page.setViewportSize({width:1280,height:720});
   const currentEnglish=await page.getByRole('tab',{name:'Help',exact:true}).count()>0;
   await page.getByRole('tab',{name:currentEnglish?'Help':'ヘルプ',exact:true}).click();
   await page.getByRole('button',{name:currentEnglish?'Settings & Help':'設定・使い方',exact:true}).click();
   await page.getByLabel(currentEnglish?'Display language':'表示言語',{exact:true}).selectOption(language);
   await page.getByRole('dialog',{name:language==='en'?'Settings & Help':'設定・使い方',exact:true}).getByRole('button',{name:language==='en'?'Close':'閉じる',exact:true}).click();
   for(const width of [375,1280])for(const purpose of ['change','new']){
    await page.setViewportSize({width,height:720});await page.getByRole('tab',{name:language==='en'?'Home':'ホーム',exact:true}).click();
    const title=purpose==='change'?(language==='en'?'Change stationery':'便箋変更'):(language==='en'?'New letter':'新規作成');
    await page.getByRole('tabpanel',{name:language==='en'?'Home':'ホーム',exact:true}).getByRole('button',{name:title,exact:true}).click();const dialog=page.getByRole('dialog',{name:title,exact:true});
    await dialog.getByRole('button',{name:language==='en'?'Moon & Pampas Grass Japanese · Autumn':'月とすすき 和風 · 秋',exact:true}).click();
    await page.evaluate(()=>document.fonts.ready);
    const cards=await dialog.locator('.template-grid button').evaluateAll(nodes=>nodes.map(node=>{
     const box=node.getBoundingClientRect();const labels=[...node.querySelectorAll('strong,small')];
     const outside=labels.some(label=>{const r=label.getBoundingClientRect();return r.left<box.left||r.right>box.right||r.top<box.top||r.bottom>box.bottom;});
     return {name:labels.map(n=>n.textContent).join(' '),height:box.height,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,outside};
    }));
    const required=language==='en'?['Cherry Blossom Letter','Morning Glory & Wind Chime','Moon & Pampas Grass']:['桜の便り','朝顔と風鈴','月とすすき'];
    if(cards.length!==20||required.some(name=>!cards.some(card=>card.name.startsWith(name+' '))))throw Error('Expected all twenty stationery cards including long labels');
    const invalid=cards.filter(c=>c.outside||c.scrollHeight>c.clientHeight+1||c.scrollWidth>c.clientWidth+1);
    if(invalid.length)throw Error('Stationery card clips labels: '+JSON.stringify({language,width,purpose,invalid}));
    const overflow=await dialog.evaluate(el=>el.scrollWidth>el.clientWidth+1);if(overflow)throw Error('Dialog horizontal overflow');
    await page.screenshot({path:`output/playwright/stationery-cards-${language}-${width}-${purpose}.png`});results.push({language,width,purpose,cards:cards.length});
    await dialog.getByRole('button',{name:language==='en'?'Close':'閉じる',exact:true}).click();
   }
  }
 } finally {page.off('pageerror',onError);}
 if(errors.length)throw Error(errors.join(';'));if(results.length!==8)throw Error('Eight language/viewport/dialog cases required');return {results,errors};
}
