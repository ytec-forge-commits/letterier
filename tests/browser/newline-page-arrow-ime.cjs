async page => {
  const body = () => page.locator('.page-edit').allTextContents().then(parts => parts.join('').replaceAll('\u200b', ''));
  const selectionOffset = () => page.evaluate(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    const node = selection.focusNode;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    const token = element?.closest('[data-offset]');
    if (!token) return null;
    return Number(token.dataset.offset) + (node?.nodeType === Node.TEXT_NODE ? selection.focusOffset : 0);
  });
  const setCaret = offset => page.evaluate(target => {
    const token = [...document.querySelectorAll('[data-offset]')].find(node =>
      Number(node.dataset.offset) <= target && Number(node.dataset.end) >= target && node.dataset.empty === undefined
    );
    if (!token) throw new Error(`caret token not found: ${target}`);
    const range = document.createRange();
    range.selectNodeContents(token);
    const local = target - Number(token.dataset.offset);
    range.setStart(token.firstChild ?? token, local);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    token.closest('.page-edit').focus({preventScroll: true});
  }, offset);
  const selectedOffsets = () => page.evaluate(() => {
    const selection = window.getSelection();
    const read = (node, local) => {
      const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
      const token = element?.closest('[data-offset]');
      return token ? Number(token.dataset.offset) + (node?.nodeType === Node.TEXT_NODE ? local : 0) : null;
    };
    return {anchor: read(selection.anchorNode, selection.anchorOffset), focus: read(selection.focusNode, selection.focusOffset)};
  });
  const results = [];
  for (const direction of ['horizontal', 'vertical']) {
    await page.getByRole('tab', {name: 'レイアウト', exact: true}).click();
    await page.getByLabel('書字方向', {exact: true}).selectOption(direction);
    await page.getByRole('tab', {name: 'ホーム', exact: true}).click();
    const edit = page.getByRole('textbox', {name: '手紙の本文 1ページ', exact: true});
    for (const fixture of [
      {name: 'combined-break', text: '甲\n\f乙', start: 1, next: 3, committed: '甲\n\f日本乙'},
      {name: 'leading-empty-break', text: '\n\f乙', start: 0, next: 2, committed: '\n\f日本乙'},
    ]) {
      await edit.click();
      await page.keyboard.press('Control+a');
      await page.keyboard.insertText(fixture.text);
      await setCaret(fixture.start);
      await page.keyboard.press(direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown');
      if (await selectionOffset() !== fixture.next) throw new Error(`pair forward was split: ${direction} ${fixture.name}`);
      const before = await page.evaluate(() => {
        const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
        return rect ? {x: rect.x, y: rect.y, width: rect.width, height: rect.height} : null;
      });
      if (!before || (direction === 'horizontal' ? before.height <= 0 : before.width <= 0)) throw new Error(`caret rect is zero after pair move: ${direction} ${fixture.name} ${JSON.stringify(before)}`);
      await page.keyboard.press(direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp');
      if (await selectionOffset() !== fixture.start) throw new Error(`pair backward was split: ${direction} ${fixture.name}`);
      await page.keyboard.press(direction === 'horizontal' ? 'Shift+ArrowRight' : 'Shift+ArrowDown');
      let selected = await selectedOffsets();
      if (selected.anchor !== fixture.start || selected.focus !== fixture.next) throw new Error(`shift selection crossed an internal offset: ${direction} ${fixture.name} ${JSON.stringify(selected)}`);
      await page.keyboard.press(direction === 'horizontal' ? 'Shift+ArrowLeft' : 'Shift+ArrowUp');
      selected = await selectedOffsets();
      if (selected.anchor !== fixture.start || selected.focus !== fixture.start) throw new Error(`reverse shift did not collapse at the pair start: ${direction} ${fixture.name} ${JSON.stringify(selected)}`);
      await setCaret(fixture.start);
      await page.keyboard.press(direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown');
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Input.imeSetComposition', {text: 'にほん', selectionStart: 3, selectionEnd: 3});
      const preedit = await page.evaluate(() => {
        const range = window.getSelection()?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        const token = range?.startContainer.parentElement?.closest('[data-offset]');
        const rendered = token?.getBoundingClientRect();
        return {page: range?.startContainer.parentElement?.closest('.page-edit')?.dataset.pageIndex, rect: rect ? {x: rect.x, y: rect.y, width: rect.width, height: rect.height} : null, rendered: rendered ? {x: rendered.x, y: rendered.y, width: rendered.width, height: rendered.height} : null, text: token?.textContent ?? ''};
      });
      if (preedit.page !== '1' || !preedit.rendered || preedit.rendered.width <= 0 || preedit.rendered.height <= 0 || !preedit.text.includes('にほん')) throw new Error(`IME preedit is not visible on page 1: ${direction} ${fixture.name} ${JSON.stringify(preedit)}`);
      await cdp.send('Input.insertText', {text: '日本'});
      await cdp.detach();
      if ((await body()) !== fixture.committed) throw new Error(`IME committed at the wrong page position: ${direction} ${fixture.name} ${await body()}`);
      await page.getByRole('button', {name: '元に戻す', exact: true}).click();
      if ((await body()) !== fixture.text) throw new Error(`one Undo did not restore the literal body: ${direction} ${fixture.name} ${await body()}`);
      results.push({direction, fixture: fixture.name, before, preedit, committed: true, undone: true});
    }
  }
  await page.getByRole('tab', {name: 'レイアウト', exact: true}).click();
  await page.getByLabel('書字方向', {exact: true}).selectOption('horizontal');
  await page.getByRole('tab', {name: 'ホーム', exact: true}).click();
  await page.getByRole('textbox', {name: '手紙の本文 1ページ', exact: true}).click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('A😀B');
  await setCaret(1);
  await page.keyboard.press('ArrowRight');
  if (await selectionOffset() !== 3) throw new Error('emoji forward navigation split a grapheme');
  await page.keyboard.press('ArrowLeft');
  if (await selectionOffset() !== 1) throw new Error('emoji backward navigation split a grapheme');
  if ((await body()) !== 'A😀B') throw new Error('emoji navigation changed literal body text');
  return {directions: results, emojiLiteralPreserved: true};
}
