async(page)=>{
 await page.getByRole('tab',{name:'表示',exact:true}).click();
 const slider=page.getByRole('slider',{name:'表示倍率スライダー',exact:true});
 await slider.focus();
 await page.keyboard.press('Home');
 for(let i=0;i<7;i++)await page.keyboard.press('ArrowRight');
 const values={slider:await slider.inputValue(),view:await page.getByLabel('表示倍率',{exact:true}).inputValue()};
 if(values.slider!=='85'||values.view!=='0.85')throw Error('Zoom controls disagree: '+JSON.stringify(values));
 await page.getByRole('button',{name:'表示倍率を100%に戻す',exact:true}).click();
 if(await slider.inputValue()!=='100')throw Error('Reset failed');
 return values;
}
