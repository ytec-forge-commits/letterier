import { describe, expect, test } from 'vitest';
import { layoutText } from '../src/core/layout';

describe('技術ゲート：本文を失わず行・ページへ流す', () => {
  test.each([false, true])('縦横%sとも用紙末尾で続きを生成する', vertical => {
    // Missing automatic pagination must fail this hand-counted 3×2 fixture.
    expect(layoutText('あいうえおかきくけ', { vertical, columns: 3, rows: 2 }).pages)
      .toEqual([['あいう', 'えおか'], ['きくけ']]);
  });
  test('句読点を次の行の先頭へ残さない', () => {
    expect(layoutText('あいう、えお', { vertical: false, columns: 3, rows: 3 }).pages)
      .toEqual([['あい', 'う、え', 'お']]);
  });
  test('開き括弧を行末へ残さない', () => {
    expect(layoutText('あい「うえ」', { vertical: true, columns: 3, rows: 3 }).pages)
      .toEqual([['あい', '「う', 'え」']]);
  });
  test('手動改ページは空きがあっても維持する', () => {
    expect(layoutText('あ\fい', { vertical: false, columns: 3, rows: 2 }).pages)
      .toEqual([['あ'], ['い']]);
  });
  test('サロゲートペアと結合文字を分断しない', () => {
    expect(layoutText('あ👨‍👩‍👦がい', { vertical: false, columns: 2, rows: 2 }).pages)
      .toEqual([['あ👨‍👩‍👦', 'がい']]);
  });
});
