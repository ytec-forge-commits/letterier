import {useLayoutEffect} from 'react';

export type UiLanguage='ja'|'en';

const translations:Record<string,string>={
  '文字間隔（pt）':'Character spacing (pt)',
  '本文の標準サイズ（pt）':'Default body size (pt)',
  '段落の最初・最後の1行を別ページに分けない':'Keep first and last paragraph lines together',
  '段落がページをまたぐとき、最初や最後の1行が単独になるのをできるだけ防ぎます。':'When a paragraph spans pages, avoid leaving its first or last line alone where possible.',
  '表示倍率スライダー':'Zoom slider',
  '表示を縮小':'Zoom out','表示を拡大':'Zoom in',
  '表示倍率を100%に戻す':'Reset zoom to 100%',
  '100%表示は画面により実寸と異なります':'100% zoom may differ from physical size',
  '自由配置の要素は200個までです。':'You can add up to 200 positioned items.',
  'クリップボードを利用できません。本文を選んでCtrl+C・Ctrl+X・Ctrl+Vを使用してください。':'Clipboard access is unavailable. Select body text and use Ctrl+C, Ctrl+X, or Ctrl+V.',
  '印刷可能範囲：':'Printable area:','mm ／ 上':'mm / Top','上端':'Top edge','印刷倍率：':'Print scale:','%（PDFは100%）':'% (PDF is 100%)',
  'mm など、用紙の端には印刷できない部分があります。実寸ではその範囲の背景・飾りが切れます。紙面全体を残すには「縮小」を選んでください。':'mm and other paper edges cannot be printed. At actual size, backgrounds and decorations in those areas are clipped. Choose Fit to keep the whole sheet.',
  'このPCにないフォントは代替フォントで出力されます：':'Fonts missing on this PC are replaced for output:',
  'チェックしない場合、本文と文字箱を除き、画像・背景・罫線を登録します。':'When unchecked, save images, background, and rules without body text or text boxes.',
  '登録した便箋から、新しい手紙を作れます。':'Create a new letter from your saved stationery.',
  '上の「ホーム」から「新規作成」を押します。':'Choose New letter on the Home tab above.',
  'プリンター一覧を取得できません。Windowsの接続設定を確認してください。PDF出力は利用できます。':'Could not load printers. Check the Windows connection settings. PDF export is still available.',
  '文字箱の本文が枠からはみ出しています。文字箱の幅・高さを広げるか、文字を小さくしてから出力してください。':'Text overflows a text box. Increase its width or height, or reduce the text size before output.',
  'ブラウザの印刷画面を開きました。倍率100%・余白なし・ヘッダーとフッターなしで確認してください。':'Opened the browser print dialog. Check 100% scale, no margins, and no headers or footers.',
  'PDFを保存しました。':'PDF saved.','先にプリンターの印刷可能範囲を確認してください。':'Check the printer printable area first.',
  'プリンターへ送信しました。用紙の出力結果をご確認ください。':'Sent to the printer. Check the printed result.',
  'プリンターへ送信しています…':'Sending to the printer…','PDFを作成しています…':'Creating PDF…',
  'ページ範囲が長すぎます。':'The page range is too long.','ページは「1-3,5」のように指定してください。':'Enter pages in a format such as 1-3,5.',
  '印刷可能範囲を確認できません。':'Could not determine the printable area.',
  '点線の内側が印刷できる範囲です。外側の白い部分と点線は印刷されません。':'The area inside the dotted line is printable. The white area outside and the dotted line are not printed.',
  '▣ 保存':'▣ Save','▱ コピー':'▱ Copy','保存（Ctrl+S）':'Save (Ctrl+S)',
  '保護版の名前':'Protected version name','現在を保護版にする':'Protect the current version','この状態へ復元する':'Restore this version','プレビューの大きさ':'Preview size',
  '例：送る前の完成版':'Example: final version before sending','本文のない手紙':'Letter with no body text','まだ保存履歴がありません。':'There are no saved revisions yet.',
  '履歴を選ぶと、便箋の見た目を確認できます。':'Select a revision to preview its stationery.','復元前の状態':'Before restoration',
  '通常の履歴は直近50世代。名前を付けた保護版は別に残ります。復元前の状態も履歴に保存します。':'History keeps the latest 50 ordinary revisions plus named protected versions. The state before restoration is also saved.',
  'フォントのライセンスを読み込めませんでした。アプリを再起動して再度開いてください。':'Could not load the font licenses. Restart the app and open this screen again.',
  '図案':'Design','続きのページで5図案を順番に使う':'Cycle through five designs on following pages',
  'この図案はまだ利用できません。':'This design is not available yet.',
  'ホーム':'Home','挿入':'Insert','レイアウト':'Layout','ヘルプ':'Help','編集リボン':'Editing ribbon',
  '新規作成':'New letter','便箋変更':'Change stationery','保存':'Save','保存する':'Save','保存しない':"Don't save",'変更を保存しますか？':'Save changes?',
  'クリップボード':'Clipboard','貼り付け':'Paste','切り取り':'Cut','コピー':'Copy','本文の書式':'Body formatting','便箋':'Stationery',
  '選択した文字／次に入力する文字':'Selected text / next typed text','本文の書式を一括変更…':'Change body formatting…','本文の書式を一括変更':'Change body formatting','一括変更する':'Apply formatting',
  '文字サイズを揃える':'Set text size','フォントを揃える':'Set font','一括変更するフォント':'Font to apply','このページの本文':'Body on this page','すべての本文':'Entire body','対象範囲の文字箱も変更する':'Include text boxes in this scope',
  '色・太字・斜体・下線は維持します。変更後の文字サイズに合わせて、本文の折り返しと自動罫線を計算し直します。':'Color, bold, italic, and underline are preserved. Text wrapping and automatic rules are recalculated for the new size.',
  'ページ一覧':'Pages','ページ一覧を表示':'Show page thumbnails','配置する要素':'Positioned items','文字の流れ':'Text flow','便箋・罫線':'Stationery and rules','操作画面':'Interface','保存と出力':'Saving and output','ファイル保存':'File saving','手紙':'Letter','出力':'Output',
  '図の形式':'Picture format','文字箱の形式':'Text box format','移動・拡縮は用紙上で、細かな設定は右側で調整できます。':'Move and resize on the paper; adjust details in the panel on the right.','段落の1行だけを残さない':'Avoid isolated paragraph lines',
  '任意の色':'Custom color','文字の色（任意の色）':'Text color (custom)','文字の色のパレット':'Text color palette',
  '回復用データ保存済み・ファイルは未保存':'Recovery saved; file has unsaved changes','ファイル保存済み':'File saved','前回の回復用データを保持しています。':'Previous recovery data is available.','前回の回復用データを開く':'Open previous recovery data',
  '回復用データの自動保存は、元のファイルへの保存とは別です。':'Automatic recovery saving is separate from saving the original file.',
  '適用する範囲':'Apply to','すべてのページ':'All pages','指定したページ範囲':'Page range','開始ページ':'First page','終了ページ':'Last page',
  '今の便箋で登録を更新…':'Update registration from this stationery…','更新する':'Update','選択した登録を現在の手紙のデザインで更新します。作成済みの手紙は変更しません。':'Update the selected registration from the current design. Existing letters are not changed.',
  '罫線の間隔をフォントに合わせる':'Adjust rule spacing to the font','罫線の太さを標準フォントに合わせる':'Adjust rule thickness to the default font','1行の目安文字数（全角）':'Target full-width characters per line',
  '標準フォントの全角文字を基準にした目安です。異なるサイズや英数字は実寸で折り返し、大きな文字の行は必要な間隔を確保します。':'A target based on full-width characters in the default font. Mixed sizes and Latin characters wrap by their actual width; larger text gets the spacing it needs.',
  'プレビューをドラッグして移動。四隅のハンドルで拡縮できます。':'Drag the preview to move the image. Resize using its four corner handles.','紙面に合わせる':'Fill the page','全体を収める':'Fit the entire image','位置と大きさをリセット':'Reset position and size','背景画像を移動':'Move background image',
  'レタリエ':'Letterier','想いを、一枚の手紙に。':'Put your thoughts into a letter.',
  '編集操作':'Editing actions','ファイル':'File','便箋を選ぶ':'Choose stationery','保存履歴':'History',
  '元に戻す':'Undo','やり直す':'Redo','写真・画像':'Photo / Image','文字箱':'Text box','設定・使い方':'Settings & Help','PDF・印刷':'PDF / Print',
  '便箋の設定':'Stationery settings','用紙':'Paper','はがき（100 × 148 mm）':'Postcard (100 × 148 mm)','用紙の向き':'Paper orientation',
  '縦向き':'Portrait','横向き':'Landscape','書字方向':'Writing direction','横書き':'Horizontal','縦書き':'Vertical',
  '書き進めると、自動で続きのページが生まれます。':'A new page is added automatically as you continue writing.',
  'ここから次のページ':'Start a new page here','複製・移動・削除…':'Duplicate, move, or delete…','背景・罫線・余白…':'Background, rules, and margins…',
  '配置した要素':'Placed items','追従':'Flows with text','固定':'Fixed','表示':'View','表示倍率':'Zoom level',
  'ページ':'Page','文字':' characters','ページ · 100%表示は画面により実寸と異なります':' pages · 100% zoom may differ from physical size','手紙の本文':'Letter body','ここから、お手紙を。':'Start your letter here.',
  '標準フォント':'Default font','本文の基本フォントです。書き始める前にも選べ、個別に変更していない文字へ反映されます。':'The default font for body text. You can choose it before writing; it applies to text without individual formatting.',
  '本文の標準フォント':'Default body font','選んだフォントを一括適用':'Apply selected font','標準フォントに揃える範囲':'Apply default font to','このページ':'This page','全ページ':'All pages','このページの本文を揃える':'Apply to this page','すべての本文を揃える':'Apply to all pages',
  '選択した文字':'Selected text','文字を選んだときは、その部分だけ変更できます。選択していないときは次に入力する文字へ反映します。':'When text is selected, changes apply only to that selection. Otherwise they apply to the next text you type.','選択部分のフォント':'Selection font','選ぶ…':'Choose…',
  '一部の文字を選ぶと、その部分だけ変更できます。':'Select text to change only that part.','フォント':'Font','文字サイズ（pt）':'Font size (pt)',
  '太字':'Bold','斜体':'Italic','下線':'Underline','文字の色':'Text color','縦中横':'Horizontal-in-vertical',
  '2桁数字を自動で横並び':'Automatically align 2-digit numbers','選んだ文字を横並びに':'Place selected characters horizontally','通常の縦配置':'Normal vertical layout','段落の1行だけを別ページに残さない':'Keep a single paragraph line from being left on another page',
  '閉じる':'Close','末尾にページを追加':'Add a page at the end','素材を読み込んでいます…':'Loading image…','保存データを処理しています…':'Processing saved data…',
  '自由配置の文字箱':'Positioned text box','本文へ':'Back to body','文字箱の本文':'Text box content','文字箱の書字方向':'Text box writing direction','文字箱のフォント':'Text box font','文字箱のサイズ（pt）':'Text box size (pt)','文字箱の色':'Text box color',
  '本文へ追従':'Flow with body','配置ページ':'Page','横位置（mm）':'Horizontal position (mm)','縦位置（mm）':'Vertical position (mm)','幅（mm）':'Width (mm)','高さ（mm）':'Height (mm)','回転（度）':'Rotation (degrees)','要素の不透明度':'Item opacity','本文を周囲へ回り込ませる':'Wrap body text around item','周囲の余白（mm）':'Surrounding margin (mm)','周囲の罫線を隠す':'Hide surrounding rules','最前面':'Bring to front','最背面':'Send to back','前面へ':'Bring forward','背面へ':'Send backward',
  '位置は関連する本文からの距離です。':'Position is measured from its related body text.','位置は用紙の左上からの距離です。配置ページを選ぶと、画像・写真を別のページへ移動できます。':'Position is measured from the top-left of the page. Choose a page to move the image or photo.','画面上ではドラッグ、選択後は矢印キーでも移動できます。':'Drag on the page, or use the arrow keys after selecting the item.',
  '手紙の名前':'Letter name','保存ファイルと「最近使った手紙」に表示する名前です。':'This name appears in the saved file and Recent Letters.',
  'ファイルを開く…':'Open file…','.binsen または履歴付きバックアップ':'.binsen or backup with history','最近使った手紙':'Recent letters',
  '今すぐ保存':'Save now','名前を付けて保存…':'Save as…','現在の状態だけを保存':'Save the current state only',
  '履歴付きバックアップを書き出す…':'Export backup with history…','過去の履歴と保護版を一緒に持ち運ぶ':'Include revision history and protected versions',
  'まだ手紙がありません。':'There are no letters yet.','名前のない手紙':'Untitled letter','新しい手紙':'New letter',
  '名前を付けて保存する前も、このPCに回復用データを自動保存します。最近使った手紙からの再開は回復用データを開きます。元ファイルへ保存を続けるには「ファイルを開く」でそのファイルを選んでください。':'Recovery data is saved on this PC even before you use Save as. Recent Letters opens a recovery copy. To keep saving to the original file, select it again with Open file.',
  '手紙を準備しています':'Preparing your letter','前回の手紙を確認してください':'Please check your previous letter',
  '元のデータは保持しています。保存済みのファイルを開くか、新しい手紙で始められます。':'Your original data is safe. Open a saved file or start a new letter.',
  '新しい手紙で始める':'Start a new letter','PC内の回復用データを確認しています。':'Checking recovery data on this PC.',
  '表示言語':'Display language','日本語':'日本語','英語':'English',
  'まずは、この3つだけで大丈夫です':'Start with these three steps','はじめて使う方へ':'For first-time users',
  '便箋を選ぶ」を押します。':'Choose stationery above.','上の「便箋を選ぶ」を押します。':'Choose stationery above.','紙の上を押して、そのまま文字を入力します。':'Click the paper and start typing.','「ファイル」から保存し、「PDF・印刷」から出力します。':'Save from File, then export from PDF / Print.','手紙を書く':'Write your letter','保存・印刷する':'Save and print','操作を間違えたときは、上の「元に戻す」で直せます。':'If you make a mistake, use Undo at the top.',
  '見やすさの設定':'Accessibility','操作画面の文字とボタンを大きくする':'Make interface text and buttons larger','便箋に印刷する文字の大きさは変わりません。':'This does not change printed text size.',
  '画面の色を選ぶ':'Choose interface colors','色見本を押すと、操作画面の配色だけが変わります。便箋の絵柄や印刷内容には影響しません。':'Choose a swatch to change only the interface colors. Stationery artwork and printing are unaffected.',
  '困ったときは':'If you need help','キーボードでの便利な操作':'Useful keyboard shortcuts','オープンソースライセンス → 本体・ライブラリ':'Open-source licenses → App and libraries',
  '保存されたか不安なときは、画面右上の保存状態を確認します。「ファイル」から今すぐ保存もできます。':'If you are unsure whether the letter is saved, check the status at the top right. You can also choose Save now from File.',
  '写真を別ページへ動かすときは、写真を選んで「配置方法」を「ページの位置へ固定」にすると配置ページを選べます。写真をページの端へドラッグし続けても移動できます。':'To move a photo to another page, select it and choose Fix to page position under Placement, then choose the page. You can also keep dragging it at a page edge.',
  '印刷前に「PDF・印刷」のプレビューで、用紙の端やページを確認します。':'Before printing, check page edges and every page in the PDF / Print preview.',
  'Ctrl + S：保存 ／ Ctrl + Z：元に戻す':'Ctrl + S: Save / Ctrl + Z: Undo','Ctrl + Enter：改ページ ／ Ctrl + A：本文を全選択':'Ctrl + Enter: Page break / Ctrl + A: Select all body text',
  'オープンソースライセンス → 同梱フォント':'Open-source licenses → Bundled fonts',
  'インターネット接続は不要です。画像・手紙はPC内で扱います。':'No internet connection is required. Images and letters stay on your PC.',
  '種類':'Category','すべて':'All','和風':'Japanese','洋風':'Western','自分のテンプレート':'My templates','季節':'Season','通年':'All year','春':'Spring','夏':'Summer','秋':'Autumn','冬':'Winter',
  '今の便箋を登録…':'Save current stationery…','名前':'Name','本文・文字箱も含めて登録':'Include body text and text boxes','登録する':'Save template',
  'まだ登録されていません。':'No templates saved yet.','本文を含む':'Includes text','デザインのみ':'Design only','プレビューの書字方向':'Preview writing direction',
  '最初のページと、続きのページ':'First and continuation pages','登録を削除する':'Delete saved template','戻る':'Back','登録を削除…':'Delete saved template…',
  '今の手紙にデザインを適用':'Apply design to this letter','この便箋で新しい手紙':'Start a new letter with this stationery',
  '便箋変更では、本文・書式・自分で追加した写真を保持し、選択した範囲の背景・罫線・余白と便箋の飾りを変更します。「元に戻す」で戻せます。新規作成の前には、未保存の変更を保存するか確認します。':'Changing stationery keeps your body text, formatting, and added photos, and replaces the background, rules, margins, and stationery decorations in the selected scope. Undo restores the previous design. Before creating a new letter, you are asked whether to save unsaved changes.',
  'デザインを適用すると、全ページの背景・罫線・余白が選んだ便箋に変わります。「元に戻す」で戻せます。新しい手紙を作る前に、今の手紙を自動保存します。':'Applying a design changes the background, rules, and margins on every page. You can restore the previous design with Undo. Your current letter is autosaved before a new letter is created.',
  'キャンセル':'Cancel','この設定を適用':'Apply settings','削除':'Delete','複製':'Duplicate','移動':'Move','配置方法':'Placement','ページの位置へ固定':'Fix to page position',
  'このページにある次の内容を、まとめて操作します。あとから「元に戻す」で操作全体を戻せます。':'The following content on this page will be handled together. You can undo the whole operation afterward.',
  '本文':'Body:','本文の位置':'Body range:','一緒に操作する要素':'Items included:','個':' items','本文はありません。':'There is no body text.','操作':'Operation','このページの次に複製':'Duplicate after this page','別の位置へ移動':'Move to another position','このページを削除':'Delete this page','移動後のページ位置':'Position after moving',
  '操作時点の各ページの区切りを手動改ページとして残します。本文は引き続き編集でき、追記すると次のページへ広がります。':'Current page boundaries are kept as manual page breaks. The body remains editable and added text can flow onto later pages.','複製する':'Duplicate','移動する':'Move','内容を確認して削除する':'Delete after review',
  '変更する範囲を選び、プレビューを確認して適用します。':'Choose the scope, review the preview, then apply it.','変更する範囲':'Scope','このページだけ':'This page only','個別設定のない続きページ':'Continuation pages without individual settings','文書全体（続きページも）':'Whole document, including continuation pages',
  '罫線と本文領域':'Rules and writing area','罫線を表示する':'Show rules','罫線の間隔（mm）':'Rule spacing (mm)','罫線の太さ（mm）':'Rule width (mm)','罫線の色':'Rule color','上余白（mm）':'Top margin (mm)','下余白（mm）':'Bottom margin (mm)','左余白（mm）':'Left margin (mm)','右余白（mm）':'Right margin (mm)','上':'Top','下':'Bottom','左':'Left','右':'Right','余白（mm）':' margin (mm)',
  '背景':'Background','背景の色':'Background color','背景なし':'Remove background','背景画像を選ぶ…':'Choose background image…','背景画像を外す':'Remove background image','画像の収め方':'Image fit','用紙いっぱい（はみ出しをトリミング）':'Fill paper and crop overflow','画像全体を収める':'Fit the whole image','用紙に合わせて伸縮':'Stretch to paper','背景画像の不透明度':'Background image opacity','背景画像の倍率':'Background image scale','画像の横位置':'Horizontal image position','画像の縦位置':'Vertical image position',
  '印刷プレビュー':'Print preview','印刷する':'Print','PDFに保存':'Save as PDF','前へ':'Previous','次へ':'Next','PDF・印刷の確認':'PDF / Print review','この画面を開いた時点の紙面を出力します。続きのページも含めて確認してください。':'This outputs the document as it appeared when this window opened. Review continuation pages too.','出力するページ':'Pages to output','すべて（例：1-3,5）':'All (example: 1-3,5)','PDFとして保存…':'Save as PDF…','文字・罫線・飾りはHTML／SVGのまま出力します。紙面全体を一枚の画像には変換しません。':'Text, rules, and vector elements remain HTML or SVG. The entire sheet is not converted into one image.','プリンター':'Printer','プリンターがありません':'No printers found','Windowsアプリで選択できます':'Available in the Windows app','部数':'Copies','印刷可能範囲を確認しています…':'Checking the printable area…','実寸で印刷（100%）':'Print at actual size (100%)','紙面全体を印刷可能範囲へ縮小':'Fit the whole sheet to the printable area','この設定で印刷する':'Print with these settings','縮小では文字・画像・罫線を同じ倍率で縮小し、改ページは変えません。':'Fit scales text, images, and rules together without changing page breaks.','表示内容':'Preview content','印刷（選択した設定）':'Print, selected settings','PDF（実寸）':'PDF, actual size','プレビュー倍率':'Preview zoom','プリンターを選ぶと、印刷できる範囲と余白を表示します。':'Choose a printer to show its printable area and margins.','PDFは用紙の実寸です。プリンター用の縮小は反映しません。':'PDF uses the physical paper size and does not apply printer scaling.',
  '白の和紙':'White Washi','藍の市松':'Indigo Ichimatsu','桜の便り':'Cherry Blossom Letter','菜の花と蝶':'Rapeseed & Butterfly','朝顔と風鈴':'Morning Glory & Wind Chime',
  '金魚と水紋':'Goldfish & Ripples','紅葉の彩り':'Maple Colors','月とすすき':'Moon & Pampas Grass','雪の庭':'Snow Garden','椿の便り':'Camellia Letter',
  'クラシックレター':'Classic Letter','パステルドット':'Pastel Dots','ミモザのリース':'Mimosa Wreath','チューリップガーデン':'Tulip Garden','シーサイドブルー':'Seaside Blue',
  'レモンの便り':'Lemon Letter','秋色リーフ':'Autumn Leaves','森の実り':'Woodland Harvest','スノークリスタル':'Snow Crystal','クリスマスリース':'Christmas Wreath',
  '無地':'Plain','読み込み中':'Loading','自動保存済み':'Autosaved','このPCに自動保存済み':'Autosaved on this PC','保存に失敗':'Save failed','未保存の変更あり':'Unsaved changes','保存済み':'Saved','ファイルを書き出しました':'File exported',
  '白に近い和紙の質感と、静かな細い罫線。':'A near-white washi texture with quiet, fine rules.','端に添えた藍の市松。すっきりとした和の一枚。':'Indigo ichimatsu accents for a clean Japanese design.',
  '淡い桜の枝と、風に舞う花びら。':'Pale cherry branches and petals drifting in the breeze.','黄色い菜の花に、小さな蝶がひと休み。':'Golden rapeseed flowers with a resting butterfly.',
  '青紫の朝顔と、涼やかな風鈴。':'Blue-violet morning glory and a cooling wind chime.','朱色の金魚が、淡い水紋を泳ぎます。':'A vermilion goldfish swims through pale ripples.',
  '赤と橙のもみじを、用紙の隅へ。':'Red and orange maple leaves at the page edges.','淡い月と細いすすき。余白の美しい秋の夜。':'A pale moon and pampas grass in generous autumn space.',
  '墨色の枝に積もる雪。白を生かした冬の庭。':'Snow on charcoal branches in a quiet winter garden.','赤い椿と深緑の葉が、冬に温もりを添えます。':'Red camellia and deep green leaves bring winter warmth.',
  '細い飾り枠と角飾り。改まったお手紙にも。':'Fine borders and corner ornaments for formal letters.','淡い水玉を端に。軽やかで親しみやすく。':'Light pastel dots along the edges for a friendly look.',
  '黄色い小花と細い葉の、小さなリース。':'A small wreath of yellow flowers and slender leaves.','ピンクと赤の花を、水彩のように重ねて。':'Layered pink and red tulips in watercolor.',
  '淡い波と小さな貝殻。余白に潮風を。':'Pale waves and a small shell bring a coastal breeze.','黄色いレモンと緑の葉。明るく爽やかな一枚。':'Yellow lemons and green leaves for a bright, fresh page.',
  'くすんだ橙と金色の葉を、控えめに。':'Restrained leaves in muted orange and antique gold.','どんぐり、木の実、小さなきのこ。森からのお便り。':'Acorns, berries, and a small mushroom from the woods.',
  '淡い青の結晶がきらめく、静かな冬の便箋。':'Pale blue crystals sparkle on quiet winter stationery.','緑のリースと赤い実。小さなリボンを添えて。':'An evergreen wreath with red berries and a small bow.',
};

const replacements:Array<[RegExp,string|((...args:string[])=>string)]>=[
  [/^このPCにないフォント：([\s\S]*)。代替フォントで表示・出力します。元のフォント名は保持しています。$/,(_all,names)=>`Fonts missing on this PC: ${names}. A substitute font is used for display and output. The original font names are preserved.`],
  [/^ページ番号は1〜(\d+)の範囲で指定してください。$/,(_all,n)=>`Enter page numbers from 1 to ${n}.`],
  [/^「([\s\S]*)」の登録を削除します。$/,(_all,name)=>`Delete the saved template “${name}”.`],
  [/^(\d+)ページへ移動$/,(_all,n)=>`Go to page ${n}`],[/^文字の色 (#[0-9a-fA-F]{6})$/,(_all,color)=>`Text color ${color}`],
  [/^「(.+)」には、ファイルへ保存していない変更があります。$/,(_all,title)=>`“${title}” has changes that have not been saved to the file.`],
  [/^ページ (\d+)$/,(_all,n)=>`Page ${n}`],[/^(\d+)文字$/,(_all,n)=>`${n} characters`],[/^(\d+)ページ · 100%表示は画面により実寸と異なります$/,(_all,n)=>`${n} pages · 100% zoom may differ from physical size`],
  [/^手紙の本文 (\d+)ページ$/,(_all,n)=>`Letter body, page ${n}`],[/^(\d+)ページ$/,(_all,n)=>`Page ${n}`],
  [/^(\d+)ページ ／ 追従$/,(_all,n)=>`Page ${n} / Flows with text`],[/^(\d+)ページ ／ 固定$/,(_all,n)=>`Page ${n} / Fixed`],
  [/^(\d+)ページの操作$/,(_all,n)=>`Page ${n} operation`],[/^(\d+)ページの背景・罫線$/,(_all,n)=>`Page ${n} background and rules`],
  [/^本文 (\d+)文字$/,(_all,n)=>`Body: ${n} characters`],[/^本文の位置 (\d+)〜(\d+)$/,(_all,a,b)=>`Body range: ${a}-${b}`],[/^一緒に操作する要素 (\d+)個$/,(_all,n)=>`Items included: ${n}`],[/^(\d+)ページ目$/,(_all,n)=>`Position ${n}`],
  [/^背景画像の不透明度 (\d+)%$/,(_all,n)=>`Background image opacity: ${n}%`],[/^背景画像の倍率 (\d+)%$/,(_all,n)=>`Background image scale: ${n}%`],
  [/^不透明度 (\d+)%$/,(_all,n)=>`Opacity: ${n}%`],
];

export function translateUiText(value:string,language:UiLanguage):string{
  if(language==='ja'||!value)return value;
  const leading=value.match(/^\s*/)?.[0]??'',trailing=value.match(/\s*$/)?.[0]??'',core=value.slice(leading.length,value.length-trailing.length);
  if(!core)return value;
  const exact=translations[core];if(exact)return leading+exact+trailing;
  for(const [pattern,replacement] of replacements)if(pattern.test(core))return leading+core.replace(pattern,replacement as never)+trailing;
  let translated=core;
  for(const [ja,en] of Object.entries(translations).sort((a,b)=>b[0].length-a[0].length))if(ja.length>=4)translated=translated.replaceAll(ja,en);
  return leading+translated+trailing;
}

const originalText=new WeakMap<Text,string>();
const originalAttributes=new WeakMap<Element,Map<string,string>>();
const skipped=(element:Element|null)=>Boolean(element?.closest('.body-line,.text-object,textarea,input,script,style,[translate="no"]'));

export function localizeDom(root:ParentNode,language:UiLanguage){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node:Text|null;
  while((node=walker.nextNode() as Text|null)){
    if(skipped(node.parentElement))continue;
    const previous=originalText.get(node),previousTranslation=previous===undefined?undefined:translateUiText(previous,'en');
    if(previous===undefined||node.data!==previous&&node.data!==previousTranslation)originalText.set(node,node.data);
    const source=originalText.get(node)??node.data,next=translateUiText(source,language);if(node.data!==next)node.data=next;
  }
  const elements=root instanceof Element?[root,...root.querySelectorAll('*')]:[...root.querySelectorAll('*')];
  for(const element of elements){
    for(const name of ['aria-label','title','placeholder']){
      const current=element.getAttribute(name);if(current===null)continue;
      let originals=originalAttributes.get(element);if(!originals){originals=new Map();originalAttributes.set(element,originals);}
      const previous=originals.get(name),previousTranslation=previous===undefined?undefined:translateUiText(previous,'en');
      if(previous===undefined||current!==previous&&current!==previousTranslation)originals.set(name,current);
      const source=originals.get(name)??current,next=translateUiText(source,language);if(current!==next)element.setAttribute(name,next);
    }
  }
}

export function useDomLocalization(language:UiLanguage){
  useLayoutEffect(()=>{
    document.documentElement.lang=language;
    document.title=language==='ja'?'レタリエ':'Letterier';
    const root=document.getElementById('root');if(!root)return;
    let queued=false;
    const apply=()=>{queued=false;localizeDom(root,language);};
    apply();
    const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(apply);}});observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
    return()=>observer.disconnect();
  },[language]);
}
