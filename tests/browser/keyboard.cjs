async(page)=>{
 await page.getByRole('button',{name:'便箋を選ぶ',exact:true}).waitFor();
 await page.getByLabel('書字方向',{exact:true}).selectOption('horizontal');
 const editor=page.locator('.page-edit').first();await editor.click();await page.keyboard.press('Control+a');await page.keyboard.insertText('入力試験');
 await page.keyboard.press('Control+b');await page.keyboard.press('Control+b');await page.keyboard.insertText('末尾');
 const bold=await page.locator('.page-edit [data-token]').evaluateAll(ns=>ns.filter(n=>getComputedStyle(n).fontWeight==='700').map(n=>n.textContent).join(''));
 if(bold)throw Error('Ctrl+B twice still bold: '+bold);
 const before=await editor.textContent();await page.keyboard.press('Tab');if(await editor.textContent()!==before)throw Error('Tab changed document');
}
