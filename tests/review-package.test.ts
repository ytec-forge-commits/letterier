import {afterEach, expect, test} from 'vitest';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {zipSync, strToU8} from 'fflate';

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, {recursive: true, force: true}); });

function fixture(version = '2.0.0') {
  const required = ['レタリエ.exe', 'REVIEW-STATUS.txt', 'README.md', 'README.en.md', 'LICENSE', 'NOTICE',
    'THIRD_PARTY_NOTICES.md', 'ASSETS_LICENSE.md', 'ASSET_PROVENANCE.md', 'CODE_SIGNING_POLICY.md', 'IMAGE-FORMATS.md',
    'BRAND_POLICY.md', 'LICENSE_EXCEPTIONS.md', 'PRIVACY.md', 'distribution/README-VECTOR.txt',
    'docs/manual/ja/README.md', 'docs/manual/en/README.md', 'docs/SAVE-RECOVERY-VALIDATION.md',
    'docs/NATIVE-OUTPUT-VALIDATION.md', 'docs/PERFORMANCE-VALIDATION.md', 'docs/PALETTE-VALIDATION.md',
    'docs/SECURITY-REVIEW.md', 'legal/MPL-Corresponding-Source.zip'];
  const root = `LetterAtelier-${version}-windows-x64-review/`;
  const entries: Record<string, Uint8Array> = {};
  for (const file of required) entries[root + file] = strToU8('Synthetic review fixture');
  const screens = {ja: ['horizontal', 'vertical', 'stationery', 'textbox'], en: ['horizontal', 'settings', 'stationery', 'textbox']};
  for (const [language, kinds] of Object.entries(screens)) for (const screen of kinds) {
    const legacyName = screen === 'horizontal' || screen === 'vertical' ? `${screen}-writing` : screen === 'textbox' ? 'text-box' : screen;
    entries[`${root}docs/manual/images/${language}-${version === '1.0.4' ? legacyName : screen}-${version === '1.0.4' ? 'all20' : version}.png`] = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  }
  return {root, entries};
}

function run(entries: Record<string, Uint8Array>, expectedVersion?: string) {
  mkdirSync('.local', {recursive: true});
  const dir = mkdtempSync(resolve('.local/review-package-test-')); roots.push(dir);
  const file = join(dir, 'synthetic.zip'); writeFileSync(file, zipSync(entries));
  const before = readFileSync(file);
  const result = spawnSync('pwsh', ['-NoProfile', '-File', 'scripts/verify-review-package.ps1', '-ZipPath', file,
    ...(expectedVersion ? ['-ExpectedVersion', expectedVersion] : [])], {encoding: 'utf8', timeout: 15000});
  expect(result.error).toBeUndefined();
  expect(readFileSync(file)).toEqual(before);
  return result;
}

test('現在版の完全なレビューZIPを読み取り専用で受け入れる', () => {
  const {entries} = fixture(); const result = run(entries);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('PASS');
}, 20000);

test('旧版は明示した期待バージョンの場合だけ受け入れる', () => {
  const {entries} = fixture('1.0.4');
  expect(run(entries).status).not.toBe(0);
  const result = run(entries, '1.0.4'); expect(result.status, result.stderr).toBe(0);
}, 40000);

test('必須のライセンスファイルが欠落したレビューZIPを拒否する', () => {
  const {root, entries} = fixture(); delete entries[root + 'LICENSE'];
  const result = run(entries); expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Missing review files: LICENSE');
}, 20000);

test('旧画面が同梱されていても現在版の画面欠落を成功扱いしない', () => {
  const {root, entries} = fixture(); delete entries[root + 'docs/manual/images/ja-vertical-2.0.0.png'];
  for (const [name, bytes] of Object.entries(fixture('1.0.4').entries)) {
    if (name.endsWith('.png')) entries[root + name.split('/').slice(1).join('/')] = bytes;
  }
  const result = run(entries); expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Expected eight latest manual screenshots');
}, 20000);

test('同梱説明書のリンク切れを拒否する', () => {
  const {root, entries} = fixture();
  entries[root + 'docs/manual/ja/README.md'] = strToU8('![Screen](../images/missing.png)');
  const result = run(entries); expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Broken packaged manual/README link');
}, 20000);

test('同梱説明書の正しい相対画像リンクを受け入れる', () => {
  const {root, entries} = fixture();
  entries[root + 'docs/manual/ja/README.md'] = strToU8('![Screen](../images/ja-horizontal-2.0.0.png)');
  const result = run(entries); expect(result.status, result.stderr).toBe(0);
}, 20000);

test('秘密鍵ファイル名を含むレビューZIPを拒否する', () => {
  const {root, entries} = fixture(); entries[root + 'synthetic.key'] = strToU8('not a real key');
  const result = run(entries); expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Unexpected sensitive or synthetic-save filename');
}, 20000);

test('現在版の画面が八枚あっても必要な画面種類の欠落を拒否する', () => {
  const {root, entries} = fixture();
  const name = root + 'docs/manual/images/ja-vertical-2.0.0.png';
  entries[root + 'docs/manual/images/ja-unrelated-2.0.0.png'] = entries[name]; delete entries[name];
  const result = run(entries); expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Expected eight latest manual screenshots');
}, 20000);

test('画面ファイルのPNGヘッダーが不正なら拒否する', () => {
  const {root, entries} = fixture(); entries[root + 'docs/manual/images/ja-vertical-2.0.0.png'] = new Uint8Array([0]);
  const result = run(entries); expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Invalid manual PNG signature');
}, 20000);

test.each(['private.pem', 'secrets.jks', 'Cookies.sqlite', 'id_rsa', 'draft.binsen', 'real.binsenbak'])(
  '検査用ZIPに不要な秘密・保存ファイル名 %s を拒否する', (name) => {
    const {root, entries} = fixture(); entries[root + name] = strToU8('Synthetic name check only');
    const result = run(entries); expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Unexpected sensitive or synthetic-save filename');
  }, 20000);

test.each(['BRAND_POLICY.md', 'LICENSE_EXCEPTIONS.md', 'PRIVACY.md', 'distribution/README-VECTOR.txt'])(
  'producerが同梱する必須文書 %s の欠落を拒否する', (name) => {
    const {root, entries} = fixture(); delete entries[root + name];
    const result = run(entries); expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Missing review files');
  }, 20000);

test.each(['../outside.txt', '/absolute.txt', 'C:/drive.txt', 'nested/../../outside.txt'])(
  'ZIPの危険なエントリ名 %s を拒否する', (name) => {
    const {root, entries} = fixture(); entries[root + name] = strToU8('Synthetic path check only');
    const result = run(entries); expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Invalid review entry path');
  }, 20000);
