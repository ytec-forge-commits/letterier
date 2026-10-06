# 文字数・混在書式・罫線の検証 / Font and ruling validation

## 最新native確認と縦書き出力の修正（2026-10-02、13時台）

混在サイズ逐次入力を含むnative実UIの横/縦・2書体・14/24pt・太字・目安10文字/自動2設定、glyphの行帯四辺、手動保存と回復分離、再起動空→明示回復を確認。PDFの目視で編集画面だけupright CSSが当たりreadonlyは横倒しになる差を発見し、共通LineContentへ縦書きuprightを設定。再現browser RED→GREEN、全349 tests/check/build、限定5files独立静的review、修正版nativeの2 A4 PDF全頁目視、括弧/2桁縦中横/横書き切替、修正版再起動・明示回復がPASS。[native出力の記録](NATIVE-OUTPUT-VALIDATION.md) と [保存回復の記録](SAVE-RECOVERY-VALIDATION.md) を参照。

現在bundleは `index-DLcqMv88.js`。下記9MY版のnative未実施記載は当時の履歴。このPaper変更を含む広い複数用紙/複数頁出力巡回、全変更review版binding、確認成果物更新はまだ残る。

## 再開後の混在サイズ入力修正（2026-10-02）

ユーザーの再開指示後、中断時に未解決だった実キーボード入力を再現した。14を1文字ずつ入力すると先頭1が6pt未満でcontrolled空欄へ戻った。`EditorRibbon.tsx` に入力途中のdraftを保持し、6–72ptだけ書式へ反映、props更新・blurで解除する限定修正を行った。混在判定は `text-format.ts`、配線は `App.tsx`。保存処理・形式・版番号・依存関係は変更していない。

- 親の実測: 逐次入力browser回帰RED→GREEN。横/縦で14/24pt混在を実キー1→4で14ptへ統一、他のfamily/color/bold/italic/underline保持、Undo1回で混在へ戻る、手動download、通常reload空起動、明示browser回復後のtoken書式一致がPASS。
- 全43 files / 349 tests、TypeScript/version 1.0.4、production build PASS。最初のbuild結果は出力回収できず、再実行exit 0を観測した。main 540.77kB/gzip178.23kBの500kB警告とprepare時間警告は残る。
- run途中の半開区間テストを追加。実UIで均一2範囲・カーソル2位置・混在1範囲の表示、部分CDだけの変更、invalid atomic fill 1/5/73/空文字のblur復帰、境界6/72ptのatomic変更とUndo1回を確認。均一14ptでのinvalid値入力後も14表示へ戻り、全token書式不変。逐次72のUndo回数、逐次73の途中適用は未検証。
- 375×720でサイズ欄を表示し実キー14入力に成功、document横overflowなし。1280×720横/縦回復、混在空欄、375サイズ操作の4画像を親が目視。100%紙面の375全体縮小表示は未検証。
- 合成download2ファイルをZIP展開しproject.json単独、format binsen/version 2、書字方向、ABCDEF、全14pt、CDのYomogi/太字保持を確認。製品decoderによる手動ファイル再読込、nativeプロセス再起動の証拠ではない。
- 専用browser `letterier-mixed-size-green-oct2` console Errors 0 / Warnings 0。startup未待機とbeforeunloadを伴う試験前提の失敗はPASSへ数えず、fresh profileで再実行した。実データ不使用。

独立READ ONLY静的review `MIXED-SIZE-KEYBOARD-20261002-K` / `01a0facf-194e-7211-8f17-f0b9f8c86bbc` は確定的不具合なし。同IDのwaitで結果取得しclose。6ファイルhashを親で照合、一致。model/host実効identityは未確認、reviewerの動的試験なし。指摘された均一invalid表示と保存形式解析の不足を親の追加確認で補った。

| 対象 | SHA256 |
| --- | --- |
| src/core/text-format.ts | 7001488E150EB7A282AD11EA913F9529BB78F74BB6FD0B560FD36742B8C82D3E |
| src/ui/App.tsx | 4678BAC6BE586212A81E096D3F12839FE35C34493D3F71C159D5EA28A23C2757 |
| src/ui/EditorRibbon.tsx | DF64236A48927392645C148997732BB3905E90DFED60384292A399B520CCAE90 |
| tests/mixed-font-size.test.ts | F0DC97471D8ED7384D5FFD32CC9653CEE209B392669EEEB7405C359548E043FD |
| tests/browser/mixed-font-size.cjs | 54D8846C75F1929AB8367D1785EA88D2D34E88BC6C56B8303DAA2FF300E45BA0 |
| .local/mixed-size-edge.cjs | 834474EBD7CB0ED951C05F85C67F21C679C55ECB4358C9C7808E46B3FCFE5404 |

現在bundle `index-9MYp8P-f.js` SHA256 `841890E2F13A60CF0ED53712C4A4051775CEEE12BB59F4B327881857113FC106`。以下は以前の版の履歴。最新native mixed-format/count/auto-ruling保存再起動・PDF、広いreview binding、確認ZIP/日英説明更新は未完了。native終了権限拒否は迂回しない。

Sequential keyboard entry on mixed-size selections is fixed and verified in both writing directions. All 349 tests, type/version checks and the build passed. Synthetic browser save/recovery and archive manifest checks passed within the stated scope. Refreshed native validation and review packaging remain outstanding; earlier native evidence does not cover this change.

2026-10-02、11:30–11:44 JSTの限定検証。goal全体は未完了。合成データだけを専用Chromium profileで使用した。製品の保存形式、依存関係、版番号、実データ、公開先は変更していない。

## 再現した不具合と修正

production `index-DtF6J3ij.js` で縦書き英数字の実表示が指定行長を越えた。CSSはupright表示だが、composeのASCII送り量は横書きのcanvas幅だった。14ptの `BCDEFG123「便箋」` は行高149.325pxに対し実glyphの合計194.1875px。日本語だけの計算やcore上の行長検査ではこの実DOM差を検出できなかった。

`src/core/compose.ts` を、縦書きupright文字は1em、明示的に回転するASCII括弧だけ実測幅、縦中横は1emとした。横書きは従来どおり。`tests/vertical-upright-metrics.test.ts` に独立期待値の3試験を追加し、修正前3件失敗、修正後成功を確認した。

親で観測した確認: `npm test` 42 files / 344 tests PASS、`npm run check` PASS（TypeScript/version 1.0.4）、`npm run build` PASS（12.49秒）。独立lintコマンドなし。main 540.33kB/gzip178.04kBの500kB警告とprepare時間警告は残る。

現在bundleは `index-yDVezcP9.js`、SHA256 `1C66658B9748C945E7D236C1649B575D1AAE23CE239A44D131997B6F4E4D46A9`。従来のnative検証exeと10:51の確認ZIPには今回の修正も背景Esc修正も含まれない。最新版native/PDF/再梱包は未実施。

## 実UIの確認範囲

preview1421/PID61860を保持して、専用browser `letterier-font-ruling-final-oct2` PID10460でproductionを確認。ローカルQA scriptsは `.local/production-font-ruling.cjs`、`production-ruling-safe-recovery.cjs`、`production-ruling-auto-recovery.cjs`。アプリ内部module importやmock invokeは使っていない。部分選択の作成だけはDOM Rangeで、picker/サイズ欄/適用/保存/回復は実UIを操作した。

- 横/縦 × Yomogi/Klee One × 6/24/48/72pt = 16ケースPASS。37文字の日本語・英数字・括弧を途中で変更し、本文保持、実glyphの行内送り量、紙面境界、行帯非重複を検査した。目安10文字、自動間隔・自動太さ、適用範囲「文書全体」を使用。縦72ptの続きページにも設定が適用された。
- 標準fontをKlee OneからYomogiへ変更した両方向も本文とgeometryを確認。実UIで全20fontを巡回した証拠ではない。
- 手動: 自動2項目OFF、間隔15mm/太さ0.35、目安文字数なし、2書体・全14ptのfixture。横/縦各1行でglyphが自分の行帯内に収まることを検査。手動ダウンロード後の通常reloadは空の新規起動、明示回復後の本文/token書式/配置/設定が一致。
- 自動: 2項目ON、目安10文字、2書体・途中5文字24pt。横4行/縦5行。手動ダウンロード後の通常reloadは空の新規起動、明示回復後のtoken書式/行CSS/罫線幅が完全一致し、自動設定2項目と文字数も保持された。
- 保存ファイルを生成したが、この文字数fixtureの手動ファイル再読込やnativeプロセス再起動は今回未実施。上記回復はbrowser IndexedDBの合成profileの証拠。
- viewport1280×1200。72pt全紙面6枚、最初の手動fixture2枚、修正した手動fixture2枚、自動回復fixture2枚、計12枚を目視。今回375px/1280×720のフォント操作は未実施。
- 専用sessionのconsole取得はErrors0/Warnings0。CLI close成功、PID10460不在を別確認。過去のconsoleログのglob読込で表示された他sessionのエラーは、この専用sessionの結果に混ぜない。既存preview/dev serverは停止していない。

## 不成功だったQA前提を保持

最初の手動fixtureでは、混在サイズの選択欄が先頭14ptを表示しているところへ同じ14をfillしたため、Reactの変更が発火せず途中72ptが残った。15mmの手動間隔で大文字が隣の帯へ出て警告も表示された。初期の行帯検査だけではglyph自身の交差を見逃すため、これを安全な手動設定の成功とは数えない。

製品をこの件で変更したとは称さない。実UIの「本文の書式を一括変更」で全文14ptを明示適用し、全token14ptと2書体をassertしたうえで、自分の行帯内のglyph境界も含めて手動保存・回復を再実行した。混在選択で先頭と同じ値を入力する直接サイズ欄のUX制約は残り、任意の手動間隔と巨大文字の無条件な安全を保証しない。

## 独立レビューと版binding

Darwin / `01a0fa78-42c8-7bd3-8e9e-30cee64c6259`、割当 `VERTICAL-METRICS-20261002-I`。限定静的reviewの指摘なし。本人の完了結果を同IDで取得してclose済み。model/hostのidentityは未観測。

親で再確認したSHA256:

| 対象 | SHA256 |
| --- | --- |
| src/core/compose.ts | 47B0495CBA29E6201DCA8DF8A296575D091E87AAC56F29122A874FCCEA69699C |
| tests/vertical-upright-metrics.test.ts | 9BD5E788B891E6E47FFFF9843454AD7C02DA1C3144E008948B3244AB4A4B7B8A |
| src/ui/Paper.tsx | 6B87AF38495FFFFE42FD9DCAA8A2B1CDF53E2EE8D7F6CFB20217DD7CD8F9FF91 |
| src/ui/app.css | 3DF5EC72713121A51A8A03E32DC766BEB88887D4CA4A89160B2F09AAB324943F |
| src/ui/OutputDialog.tsx | DDECC1FBFFDCA2137460D7BFCD40AFA499D70F2D69CFEA9F6A21BF3D7AC420D8 |

reviewerは試験/build実行も報告したが、親がその出力を直接観測したものではなく、read-only依頼に対するbuildの生成物書込可能性もある。その報告を独立実測や厳密な単一artifact writerの証拠へ昇格しない。親の観測値を採用し、完了後にsource/bundle bindingを照合した。保存・全図案・native出力を包括したreviewではない。

## 残件 / Remaining gates

最新版の全図案とページ範囲のproduction巡回、Windows WebView2の保存/再起動/出力の再確認、版bindingとローカル成果物更新が残る。native window-close APIの権限拒否を迂回しない。終了guard、実停電/容量不足、物理印刷は成功扱いしない。

An upright vertical ASCII measurement mismatch was reproduced and fixed test-first. All 344 unit tests, type/version checks and production build passed. Sixteen actual UI font/direction/size cases and synthetic browser recovery checks passed within the stated scope. A failed manual-fixture assumption is retained; equal-value entry on a mixed-size selection is not claimed fixed. Native revalidation and refreshed review artifacts remain outstanding; the overall goal is active.
