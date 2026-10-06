import {expect,test} from 'vitest';
import {translateUiText} from '../src/i18n';
import {parsePageRange} from '../src/core/output';

test.each([
 ['自由配置の要素は200個までです。','You can add up to 200 positioned items.'],
 ['Error: 自由配置の要素は200個までです。','Error: You can add up to 200 positioned items.'],
 ['クリップボードを利用できません。本文を選んでCtrl+C・Ctrl+X・Ctrl+Vを使用してください。','Clipboard access is unavailable. Select body text and use Ctrl+C, Ctrl+X, or Ctrl+V.'],
])('操作失敗の警告「%s」が英語でも読め、日本語へ戻せる',(source,expected)=>{
 expect(translateUiText(source,'en')).toBe(expected);
 expect(translateUiText(source,'ja')).toBe(source);
});

test.each(['未導入フォント','白の和紙、保存履歴','Synthetic Font\n第二書体'])('不足フォント警告を翻訳しても元の指定名「%s」は変えない',names=>{
 const source=`このPCにないフォント：${names}。代替フォントで表示・出力します。元のフォント名は保持しています。`;
 expect(translateUiText(source,'en')).toBe(`Fonts missing on this PC: ${names}. A substitute font is used for display and output. The original font names are preserved.`);
 expect(translateUiText(source,'ja')).toBe(source);
});

test.each([
 ['チェックしない場合、本文と文字箱を除き、画像・背景・罫線を登録します。','When unchecked, save images, background, and rules without body text or text boxes.'],
 ['登録した便箋から、新しい手紙を作れます。','Create a new letter from your saved stationery.'],
 ['上の「ホーム」から「新規作成」を押します。','Choose New letter on the Home tab above.'],
 ['プリンター一覧を取得できません。Windowsの接続設定を確認してください。PDF出力は利用できます。','Could not load printers. Check the Windows connection settings. PDF export is still available.'],
 ['文字箱の本文が枠からはみ出しています。文字箱の幅・高さを広げるか、文字を小さくしてから出力してください。','Text overflows a text box. Increase its width or height, or reduce the text size before output.'],
 ['ブラウザの印刷画面を開きました。倍率100%・余白なし・ヘッダーとフッターなしで確認してください。','Opened the browser print dialog. Check 100% scale, no margins, and no headers or footers.'],
 ['PDFを保存しました。','PDF saved.'],
 ['先にプリンターの印刷可能範囲を確認してください。','Check the printer printable area first.'],
 ['プリンターへ送信しました。用紙の出力結果をご確認ください。','Sent to the printer. Check the printed result.'],
 ['プリンターへ送信しています…','Sending to the printer…'],
 ['PDFを作成しています…','Creating PDF…'],
 ['ページ範囲が長すぎます。','The page range is too long.'],
 ['ページは「1-3,5」のように指定してください。','Enter pages in a format such as 1-3,5.'],
 ['印刷可能範囲を確認できません。','Could not determine the printable area.'],
 ['点線の内側が印刷できる範囲です。外側の白い部分と点線は印刷されません。','The area inside the dotted line is printable. The white area outside and the dotted line are not printed.'],
])('テンプレートと出力の案内「%s」を英語で読める',(source,expected)=>{
 expect(translateUiText(source,'en')).toBe(expected);
 expect(translateUiText(source,'ja')).toBe(source);
});

test('実際のページ範囲エラーをページ数を保持して翻訳する',()=>{
 let message='';try{parsePageRange('99',2);}catch(error){message=(error as Error).message;}
 expect(translateUiText(message,'en')).toBe('Enter page numbers from 1 to 2.');
});

test('登録削除の確認でも利用者が付けた日本語名を変更しない',()=>{
 expect(translateUiText('「保存履歴・白の和紙」の登録を削除します。','en')).toBe('Delete the saved template “保存履歴・白の和紙”.');
});

test.each([
 ['印刷可能範囲：','Printable area:'],['左 ','Left '],[' mm ／ 上 ',' mm / Top '],['上端 ','Top edge '],
 [' mm など、用紙の端には印刷できない部分があります。実寸ではその範囲の背景・飾りが切れます。紙面全体を残すには「縮小」を選んでください。',' mm and other paper edges cannot be printed. At actual size, backgrounds and decorations in those areas are clipped. Choose Fit to keep the whole sheet.'],
 ['印刷倍率：','Print scale:'],['%（PDFは100%）','% (PDF is 100%)'],
 ['このPCにないフォントは代替フォントで出力されます：','Fonts missing on this PC are replaced for output:'],
])('Reactが分割した出力説明の断片「%s」も英語で読める',(source,expected)=>{
 expect(translateUiText(source,'en')).toBe(expected);
});

test.each([
 ['▣ 保存','▣ Save'],
 ['✂ 切り取り','✂ Cut'],
 ['▱ コピー','▱ Copy'],
 ['保存（Ctrl+S）','Save (Ctrl+S)'],
])('アイコン付きの短いリボン操作「%s」も英語で案内する',(source,expected)=>{
 expect(translateUiText(source,'en')).toBe(expected);
 expect(translateUiText(source,'ja')).toBe(source);
});

test.each([
 ['保護版の名前','Protected version name'],
 ['現在を保護版にする','Protect the current version'],
 ['この状態へ復元する','Restore this version'],
 ['プレビューの大きさ','Preview size'],
 ['例：送る前の完成版','Example: final version before sending'],
 ['本文のない手紙','Letter with no body text'],
 ['まだ保存履歴がありません。','There are no saved revisions yet.'],
 ['履歴を選ぶと、便箋の見た目を確認できます。','Select a revision to preview its stationery.'],
 ['復元前の状態','Before restoration'],
 ['通常の履歴は直近50世代。名前を付けた保護版は別に残ります。復元前の状態も履歴に保存します。','History keeps the latest 50 ordinary revisions plus named protected versions. The state before restoration is also saved.'],
])('保存履歴の操作「%s」を英語で案内する',(source,expected)=>{expect(translateUiText(source,'en')).toBe(expected);});

test('フォントライセンスの遅延読込失敗を英語でも案内する',()=>{
 expect(translateUiText('フォントのライセンスを読み込めませんでした。アプリを再起動して再度開いてください。','en')).toBe('Could not load the font licenses. Restart the app and open this screen again.');
});

test('図案選択・巡回を英語でも説明する',()=>{
 expect(translateUiText('図案','en')).toBe('Design');
 expect(translateUiText('続きのページで5図案を順番に使う','en')).toBe('Cycle through five designs on following pages');
});

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
test('リボン・新規作成・罫線自動調整・未保存確認の主要操作を英語で案内する',()=>{
 expect(translateUiText('ホーム','en')).toBe('Home');expect(translateUiText('新規作成','en')).toBe('New letter');
 expect(translateUiText('便箋変更','en')).toBe('Change stationery');expect(translateUiText('保存しない','en')).toBe("Don't save");
 expect(translateUiText('罫線の間隔をフォントに合わせる','en')).toBe('Adjust rule spacing to the font');
 expect(translateUiText('1行の目安文字数（全角）','en')).toBe('Target full-width characters per line');
 expect(translateUiText('本文の書式を一括変更…','en')).toBe('Change body formatting…');
 expect(translateUiText('2ページへ移動','en')).toBe('Go to page 2');
});

test('便箋変更が保持する内容と保存確認を英語でも説明する',()=>{
 expect(translateUiText('便箋変更では、本文・書式・自分で追加した写真を保持し、選択した範囲の背景・罫線・余白と便箋の飾りを変更します。「元に戻す」で戻せます。新規作成の前には、未保存の変更を保存するか確認します。','en')).toBe('Changing stationery keeps your body text, formatting, and added photos, and replaces the background, rules, margins, and stationery decorations in the selected scope. Undo restores the previous design. Before creating a new letter, you are asked whether to save unsaved changes.');
});
