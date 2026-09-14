async(page)=>{
  await page.setViewportSize({width:1280,height:800});
  await page.evaluate(()=>document.fonts.ready);
  const shot=async name=>{
    await page.waitForTimeout(250);
    await page.screenshot({path:`docs/manual/images/${name}.png`,fullPage:false});
  };
  const chooseCherry=async(buttonName,newLetterName)=>{
    await page.getByRole('button',{name:buttonName,exact:true}).click();
    await page.getByRole('button',{name:/桜の便り|Cherry Blossom Letter/}).click();
    await page.getByLabel(/プレビューの書字方向|Preview writing direction/).selectOption('horizontal');
    await page.getByRole('button',{name:newLetterName,exact:true}).waitFor();
  };

  await chooseCherry('便箋を選ぶ','この便箋で新しい手紙');
  await shot('ja-stationery');
  await page.getByRole('button',{name:'この便箋で新しい手紙',exact:true}).click();
  await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
  let body=page.getByRole('textbox',{name:'手紙の本文 1ページ'});
  await body.click({position:{x:80,y:65}});
  await page.keyboard.insertText('拝啓\n秋の気配を感じる頃となりました。\n先日は温かいお心遣いをいただき、ありがとうございました。\nまたお会いできる日を楽しみにしております。\n敬具');
  await shot('ja-horizontal-writing');

  await page.getByLabel('書字方向',{exact:true}).selectOption('vertical');
  await shot('ja-vertical-writing');
  await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
  await page.getByRole('button',{name:'文字箱',exact:true}).click();
  await page.getByLabel('文字箱の本文').fill('追伸\n季節の変わり目ですので、どうぞご自愛ください。');
  await page.getByLabel('文字箱の書字方向').selectOption('vertical');
  await page.getByLabel('配置方法').selectOption('page');
  await page.getByLabel('横位置（mm）').fill('158');
  await page.getByLabel('縦位置（mm）').fill('55');
  await page.getByLabel('幅（mm）').fill('25');
  await page.getByLabel('高さ（mm）').fill('95');
  await shot('ja-text-box');

  await page.getByRole('button',{name:'設定・使い方',exact:true}).click();
  await page.getByLabel('表示言語').selectOption('en');
  await page.getByRole('dialog',{name:'Settings & Help'}).waitFor();
  await shot('en-settings');
  await page.getByRole('button',{name:'Close',exact:true}).click();

  await chooseCherry('Choose stationery','Start a new letter with this stationery');
  await shot('en-stationery');
  await page.getByRole('button',{name:'Start a new letter with this stationery',exact:true}).click();
  await page.getByLabel('Writing direction',{exact:true}).selectOption('horizontal');
  body=page.getByRole('textbox',{name:'Letter body, page 1'});
  await body.click({position:{x:80,y:65}});
  await page.keyboard.insertText('Dear my friend,\n\nThank you for your thoughtful letter. The first signs of autumn have arrived, and I hope you are doing well.\n\nI look forward to seeing you again soon.\n\nWarm regards,\nY-TEC');
  await shot('en-horizontal-writing');

  await page.getByRole('button',{name:'Text box',exact:true}).click();
  await page.getByLabel('Text box content').fill('A small note\nWritten independently from the body.');
  await page.getByLabel('Text box writing direction').selectOption('horizontal');
  await page.getByLabel('Placement').selectOption('page');
  await page.getByLabel('Horizontal position (mm)').fill('132');
  await page.getByLabel('Vertical position (mm)').fill('128');
  await page.getByLabel('Width (mm)').fill('55');
  await page.getByLabel('Height (mm)').fill('28');
  await shot('en-text-box');
  return {screenshots:8,language:'ja/en',version:'1.0.4'};
}
