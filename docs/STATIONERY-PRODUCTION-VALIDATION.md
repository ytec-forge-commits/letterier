# 全図案・ページ範囲のproduction再検証

## BKC最新確認（2026-10-02、15:31–15:42 JST）

専用preview1434/PID54368、合成Chromium final-artwork/PID25908。実bundle `index-BKCcvAG_.js`、終了後SHA256 `01B47E40EA7FA45B198561D349FD66586B050C0AEA3C0BFF545FE4128AB9D482` 一致。古い結果を最新版へ昇格せず、実UIを再巡回した。

- PASS: stationery-artwork-qaの20×5×横/縦=200ケース。独立期待素材path、HTTP/decode/幅700px以上、artと罫線矩形の交差0、通年3図案1のvector装飾を検査。result200/errors空、同handle80765の終了0。
- PASS: stationery-new-seriesの40新規作成。図案5/方向/空本文、続き5→1、ページ追加Undo。result40/errors空。
- PASS: production-artwork-scopeの20シリーズ×range/page/all=60ケース。4頁12文字/太字を各段階で完全保持し、他頁非変更とUndoを検査。scope.logを読取してseries20/scopeCases60/全bodyAndBoldPreservedを別確認。
- 200個別PNGのcontact sheet10枚を親がすべて目視。縮小一覧での図案独立性と配置確認であり、200頁の微細glyph等倍精読ではない。scopeの桜/水玉2画像も個別目視。
- `.local/artwork-final-20261002` にログ/10一覧画像/200個別captureを保持。各captureの原本とコピーのSHA256を全200件比較して一致。初回PowerShell Filterの文字クラス指定でコピー0件となり、hash検査が欠損を検出した。resultに列挙された検証済み200名を個別コピーして再検査した。描画自体の失敗ではない。
- console Errors0/Warnings0。CLI close完了と、PID25908/専用preview54368/1434 listenerのHost不在を別確認。旧証跡・既存290差分を保持。

同版の背景四隅/保存再読込、縦mouse、palette、日英リボンは背景記録と受入照合を参照。今回製品コード/依存/保存形式/版番号/権限/確認ZIP/公開先を変更せず、単体358/check/12 Rustは前回結果で今回再実行ではない。本記録は確認ZIPの既存梱包対象外。

The latest BKC production build passed all 200 identified artwork render cases, 40 new-letter/cycle flows and 60 scoped applications. All ten artwork contact sheets and both scoped examples were inspected; all 200 retained captures match their originals. This is parent-operated synthetic-browser evidence, not installation or publication approval.

2026-10-02 11:51–11:57 JST。対象レタリエ、goal継続中。Workspace/business-apps/projectのAGENTSを明示全文読込、DirectorとPlaywrightを使用。前ターンは縦書き修正と保存・回復の証拠追加で進捗あり。今回も現行productionで以下の不足を埋めた。製品ソース、保存形式、依存、版番号、実利用データ、公開先は変更していない。

## 実測した版と環境

専用合成Chromium `letterier-artwork-current-oct2`、PID16020。既存preview1421/PID61860の実行pathを確認して保持。実document.scriptsは `index-yDVezcP9.js`、bundle SHA256 `1C66658B9748C945E7D236C1649B575D1AAE23CE239A44D131997B6F4E4D46A9`（終了後も一致）。dev/module import/mock invokeではない。ブラウザー保存は専用検証profile、native本番保存先は不使用。

## 結果

- PASS: `tests/browser/stationery-artwork-qa.cjs`、20シリーズ × 5図案 × 横/縦 = 200ケース。実UIで図案適用、独立した期待素材pathとの一致、HTTP/decode/幅700px以上、素材配置矩形と罫線の交差0、従来のwashi/classic/dots図案1のvector装飾存在を検査。200紙面を撮影。1280×900、表示倍率0.5。最後の編集画面は1280×720。
- PASS: `stationery-new-series.cjs`、20シリーズ × 横/縦 = 40新規作成。図案5、本文空、方向、続きページの5→1切替、ページ追加Undo。初期本文がないため、非空本文のNew破棄を40回確認したとの意味ではない。
- PASS: `stationery-cycle-ui.cjs`、19追加シリーズの5→1、桜3→4、ページ追加Undo、英語5候補、375pxのdialog横overflowなし、桜5→1のpreview更新。日英往復を実操作。
- PASS: `.local/production-artwork-scope.cjs`、全20シリーズでrange/page/allの60ケース。実本文入力から4ページの「一枚目/二枚目/三枚目/四枚目」を作り、全12文字を太字にした。範囲2–3へ5→1巡回を適用して1/4ページ保持、3ページを実clickして図案3をそのページだけへ適用、Undoで各段階へ戻る、全ページへ図案2を適用、Undoで元図案へ戻る。各段階の全token本文/style属性が元fixtureと完全一致。画像・文字箱を利用者が追加したfixtureや縦方向の範囲指定は今回に含めない。
- PASS: `additional-series-language-alpha.cjs`、19シリーズの追加図案2–5・main/companionの152PNGで透明/描画画素双方あり、四隅alpha≤1。19シリーズの英語5候補と図案5→1preview、375px dialog横overflowなし。桜は上記別scriptで確認。PNGを補正・上書きしていない。
- 専用console取得Errors0/Warnings0。全5 CLI run-codeがResultを返してterminal exit0。CLI close成功、PID16020不在を別のhost process照合で確認。preview PID61860は存在して保持。

## 目視と証跡

200紙面をラベル付き10枚のcontact sheet（各20紙面）にしてすべて目視。各シリーズ内で5つの異なる絵柄、横/縦で異なる配置、絵柄と罫線の回避を確認した。縮小一覧による全体配置の検証であり、200枚の細かい本文glyphを等倍で確認したという意味ではない。

英語375pxの20キャプチャは5枚のcontact sheetですべて目視。縦scrollでdialogの上部やactionが画像外になる場合があるが、select/check/Closeは実操作成功。桜の1280×720/375×720と編集1280×720の3画像、範囲試験の桜・水玉3ページ目の2画像も個別目視。スマートフォン版対応をうたわない。

元キャプチャ224枚を `.local/artwork-current-20261002/screens/` に別コピーして保持。200紙面 + 19追加英語dialog + 桜英語2/編集1/範囲2。contact sheet生成scriptは `.local/artwork-current-contact.py`、範囲QAは `.local/production-artwork-scope.cjs`。通常の利用者文書やWindows profileは変更していない。

今回の確認は親による実測で、新しい独立reviewではない。以前のALL20-WESTERN-20261002-D/30files所見は歴史的証拠として維持し、現在のcompose変更を含む広い版bindingを未確認のまま流用しない。全体344tests/check/buildの成功は前ターンの観測であり、今回再実行したとは称さない。

## 残件

最新版Windows WebView2の保存・再起動・PDF/印刷プレビュー、広い独立review版binding、ローカル確認成果物更新が残る。現行混在サイズ入力の同値UX制約、性能の限定実測、native window-close権限拒否等は既存の検証記録に従い、包括成功へ昇格しない。push/公開/Store提出/実印刷送信/OS設定/権限追加は実行していない。開始時283件の既存Git差分は保持した。

All 200 identified-production artwork render cases, 40 new-letter flows and 60 scoped-application operations passed. All artwork contact sheets and English narrow-dialog captures were inspected. Scope operations preserved synthetic text and bold formatting and supported Undo. This is parent-operated browser evidence, not refreshed native or independent-review evidence; the full goal remains active.
