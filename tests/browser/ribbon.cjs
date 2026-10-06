async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const startup=page.getByRole('dialog',{name:'新規作成',exact:true});if(await startup.count())await startup.getByRole('button',{name:'閉じる',exact:true}).click();
 if(await page.getByRole('tab',{name:'ホーム',exact:true}).count()!==1)throw Error('ホームタブから本文書式を操作できません');
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 await page.locator('.page-edit').first().click();await page.keyboard.press('Control+a');await page.keyboard.insertText('リボンの書式確認');await page.keyboard.press('Control+a');
 await page.getByLabel('文字サイズ（pt）',{exact:true}).fill('20');
 await page.getByRole('button',{name:'太字',exact:true}).click();
 await page.getByRole('button',{name:'文字の色',exact:true}).click();
 await page.getByRole('button',{name:'文字の色 #b23b42',exact:true}).click();
 const styles=await page.locator('.page-edit [data-token]').evaluateAll(ns=>ns.map(n=>({size:getComputedStyle(n).fontSize,weight:getComputedStyle(n).fontWeight,color:getComputedStyle(n).color})));
 if(styles.some(s=>s.size!=='26.6667px'||s.weight!=='700'||s.color!=='rgb(178, 59, 66)'))throw Error('文字のリボン操作が反映されません: '+JSON.stringify(styles));
 await page.getByRole('tab',{name:'レイアウト',exact:true}).click();await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
 if(await page.locator('.body-line').first().evaluate(el=>getComputedStyle(el).writingMode)!=='vertical-rl')throw Error('縦書きへ切り替わりません');
 await page.getByRole('tab',{name:'表示',exact:true}).click();await page.getByRole('checkbox',{name:'ページ一覧を表示',exact:true}).uncheck();
 if(await page.getByRole('navigation',{name:'ページ一覧',exact:true}).count())throw Error('ページ一覧を隠せません');
 await page.getByRole('checkbox',{name:'ページ一覧を表示',exact:true}).check();
 await page.getByRole('tab',{name:'ホーム',exact:true}).click();
 await page.screenshot({path:'output/playwright/ribbon-1280.png'});
 if(errors.length)throw Error(errors.join('\n'));
 return {format:true,layout:true,thumbnailToggle:true};
}
