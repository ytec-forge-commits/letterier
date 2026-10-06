import {expect, test} from 'vitest';
import {translateUiText} from '../src/i18n';
test.each([
 ['文字間隔（pt）', 'Character spacing (pt)'],
 ['本文の標準サイズ（pt）', 'Default body size (pt)'],
 ['段落の最初・最後の1行を別ページに分けない', 'Keep first and last paragraph lines together'],
 ['段落がページをまたぐとき、最初や最後の1行が単独になるのをできるだけ防ぎます。', 'When a paragraph spans pages, avoid leaving its first or last line alone where possible.'],
 ['表示倍率スライダー', 'Zoom slider'],
 ['表示を縮小', 'Zoom out'],
 ['表示を拡大', 'Zoom in'],
 ['表示倍率を100%に戻す', 'Reset zoom to 100%'],
 ['100%表示は画面により実寸と異なります', '100% zoom may differ from physical size'],
])('new release controls remain readable in English: %s', (source, expected) => {
 expect(translateUiText(source, 'en')).toBe(expected);
 expect(translateUiText(source, 'ja')).toBe(source);
});
