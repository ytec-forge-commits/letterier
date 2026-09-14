import {expect,test} from 'vitest';
import {translateUiText} from '../src/i18n';

test('主要導線を英語へ切り替えられる',()=>{
  expect(translateUiText('便箋を選ぶ','en')).toBe('Choose stationery');
  expect(translateUiText('設定・使い方','en')).toBe('Settings & Help');
  expect(translateUiText('PDF・印刷','en')).toBe('PDF / Print');
  expect(translateUiText('ページ 2','en')).toBe('Page 2');
  expect(translateUiText('599文字','en')).toBe('599 characters');
  expect(translateUiText('文字箱の書字方向','en')).toBe('Text box writing direction');
  expect(translateUiText('自由配置の文字箱','en')).toBe('Positioned text box');
  expect(translateUiText('文字箱の本文','en')).toBe('Text box content');
  expect(translateUiText('文字箱のフォント','en')).toBe('Text box font');
  expect(translateUiText('文字箱のサイズ（pt）','en')).toBe('Text box size (pt)');
  expect(translateUiText('本文へ','en')).toBe('Back to body');
});

test('日本語表示と利用者の空文字を変更しない',()=>{
  expect(translateUiText('便箋を選ぶ','ja')).toBe('便箋を選ぶ');
  expect(translateUiText('','en')).toBe('');
});
