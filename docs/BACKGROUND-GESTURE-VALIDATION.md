# 背景画像の操作・保存検証 / Background gesture validation

## BKC四隅・回復・手動ファイル再確認（2026-10-02、15:33–15:42 JST）

専用合成Chromium final-background/PID67668、preview1434/実bundle BKC。`final-background-four-corners.cjs` は実mouseで四隅の比率1.5/反対anchor差0.02mm以内、移動/拡縮Esc、適用、dialog Cancel、手動download、通常reload空→明示IndexedDB回復後の本文/背景bytes/transform一致がPASS。background-escapeも移動と全四隅5gesture/idle Escを実操作PASS。native再起動の証拠とは区別する。

保存した合成 `.binsen` を独立JSON/ZIP読取で検査し、format v2/本文12文字/画像1件の別エントリのSVG bytes/contain/50%位置/scale1.04587/offset19.2652・12.8435mm一致を確認。初回検査は画像なし文書の「project.jsonのみ」を誤って期待して失敗した。archive.tsの既存形式（画像はassets/id）と実ZIPを調べ、画像数/厳密entry一覧/参照path/MIME/元SVG全bytesを検査する形に修正、PASS。製品コードは変更せず、この試験前提失敗を製品RED→GREENとは称さない。

手動再読込scriptはCLIのfilechooser境界でResultなし/chooser待ちとなり、一括成功としなかった。現状態を確認して専用CLI uploadで同じ保存済み合成ファイルを選択し、別verifyで本文/transform/fit/positionの復元PASS。OS native保存ダイアログの成功ではない。

四隅/回復/手動再読込の6画像を親が個別目視。同profileのpalette部分書式保持/外側・Esc・keyboard focus、日英リボン/375横overflowなし、縦mouse move/Ctrl-copy/全token書式保持/UndoもPASS。縦括弧とmouseの初期720px画像は切れていたため、背景を合成試験内で外し1280×1600の全紙面を別撮影、両全文を目視。短い初期画像だけで全文合格としない。

console Errors0/Warnings0。CLI close完了、PID67668/preview54368/1434 listener不在を別Host確認。captureは `.local/artwork-final-20261002/screens`、限定QA script/独立ZIP verifierは `.local/final-background-*` / `.local/verify-final-background.mjs`。旧証跡・既存290差分保護、製品形式/依存/版番号/権限/公開先は未変更。本記録は既存確認ZIPの梱包対象外。

The latest BKC build passed real mouse operations on all four corners, gesture/dialog cancellation, explicit browser recovery and manual file reopening. An independent archive check confirms the exact synthetic image bytes and geometry. Initial verifier and CLI-filechooser assumptions were corrected without modifying production code; browser reload/reopen is not native restart or OS Save As proof.

## 適用範囲のdraft混入修正（2026-10-02、14:16–14:26 JST）

独立READ ONLYレビュー `CURRENT-GOAL-REVIEW-20261002-M` / Galileo `01a0fb05-0a29-7d31-8cc8-ed8c2d490db3` で、PageVisualDialogのscopeをcontinuationからpage/allへ戻した際、continuation値が残るP2を検出。親の実UI回帰 `tests/browser/page-visual-scope-drafts.cjs` でRED: page draft `#aabbcc`/間隔10mm/左余白25mmに対し `#123456`/11mm/33mmを観測した。元のselectScopeはcontinuationに入る場合だけvisualを切り替えていた。

修正はPageVisualDialog内部のみ。page/allは現在ページのdraftを共有、continuationは別draftとし、groupを移る前に現在値を保持、戻るとそのdraftを復元する。初回だけ既存文書からclone。モデル・保存形式・適用関数・権限・依存・版番号は変更していない。

- PASS: 同じ実UI回帰がGREEN。2頁合成本文、色/手動間隔/左余白のscope往復、all適用後のpage/continuation値、本文不変、Cancel、1回Undoで両scopeの元値へ復帰。
- PASS: 開発画面と別のproduction `index-BAgmTATt.js` で再実行。375pxでscope4回切替/Cancel/横overflowなし。1280/375画像を個別目視。dialog内の縦scrollは存在する。
- PASS: productionで異なる合成SVGをpage/continuationに選び、page側を実mouse移動。page/allへ戻った画像名とtransform、continuationの画像名/fit/transformを保持。Cancel後に両scopeの背景画像なし、continuation色/間隔/左余白も元値へ戻ることを別検査 `.local/scope-drafts-assets.cjs` で確認。画像draftを適用して手動ファイル再読込する試験とは分ける。
- PASS: 開発画面で既存background-escape.cjsも再巡回し、移動＋四隅拡縮の5gestureでEscが開始transformへ戻り、idle Escでdialogを閉じることを確認。
- PASS: 修正後の349 JS tests、check/version1.0.4、frontend build。12 Rust testsは修正前に今回実行し、Rust source未変更。production console Errors0/Warnings0、devもErrors0/Warnings0（infoあり）。main540.96kB/gzip178.30kBの500kB警告とprepare時間警告は残る。

限定再レビュー `SCOPE-DRAFT-FIX-20261002-N` は同担当の正規resume/send_input/同ID completed wait/closeを観測し、下記2filesとpages.tsを全文静的確認。旧P2解消、確定的な残存コードバグなし。reviewerの動的試験・モデル/Host実効identityはUNVERIFIED。親で2hash再一致。元Mのmanifest80件中、修正後も他79件はhash一致し、PageVisualだけ変化した。旧Mの全体所見をNによる全行再レビューと呼ばない。

| 対象 | SHA256 |
| --- | --- |
| src/ui/PageVisualDialog.tsx | E6C744FFE41F174181BF37A044828AE1C7368FF803EB1E901B8B904E841EEA89 |
| tests/browser/page-visual-scope-drafts.cjs | 9EF9EC1545A7D86FD64BD030689B7F4191E8B1CD395CD42F2BA25B6B8CAA9CC8 |
| src/core/pages.ts | CA3DDCA54E799F73EA5225E9AC7778A4447F88E7159E76119B9AB94A2D69AA23 |
| .local/frontend/assets/index-BAgmTATt.js | 211F3155A48381B1008F202521D013559EA274A67AF0EE358D08B6AD382E9719 |

新testはJS unit349の件数に含まれないbrowser回帰。自作template・新scope全書式・全図案・native再保存の包括確認へ広げない。UI検証用Chromium PID66728/4232とサーバー1430/PID64208・1431/PID11764は専用として終了し、後段でHost不在を確認する。起動の初案はnpm引数が誤解釈され1430でなく5173に起動、該当sessionだけを終了して正しいVite CLIへ変更。reloadはbeforeunloadで一度停止し、合成文書に対する確認を受諾してから再実行した。これらを初回一括成功やnative終了guard成功としない。

The independently found scope-switching defect was reproduced with a failing real-UI test and fixed by keeping separate uncommitted page/all and continuation drafts. Development and production checks cover value roundtrips, application, cancellation, one-step Undo, narrow viewport operations and synthetic image/transform draft retention. This is bounded browser evidence, not native save/restart proof for the new build.

2026-10-02 11:19–11:29 JST。限定検証PASS、改修goal全体は未完了。合成データ専用Chromium、実mouse、既存production preview1421/PID61860使用。実利用者profile・native保存先・OS設定・依存・版番号は変更していない。

## 不具合と修正

旧production `index-DAkWGDAt.js` で、全体を収めるbuttonを押した後に背景をdrag中、Escがgestureを取り消さずdialog全体を閉じた。診断値: beforeFocus/duringFocusとも「全体を収める」、dialogAfterEscape=0、appliedImages=0。`preventDefault`でpointer由来のfocusを抑止したまま、BackgroundEditorのkeydownを受けられないのが原因。合成画像は適用されず、原本破壊の証拠ではない。

`tests/browser/background-escape.cjs` を追加し、修正前に実行して `Escape closed the entire editor during gesture: 背景画像を移動` のREDを確認。その後 `src/ui/BackgroundEditor.tsx` のpointer開始に `event.currentTarget.focus({preventScroll:true})` のみ追加（説明commentを除く）。TDD/Systematic Debuggingを使用し、製品の修正前失敗と修正後成功を分けた。

## 修正後実測

- `npm run build` exit0、49.28秒。現在frontendは `index-DtF6J3ij.js`、SHA256 `E2673E24EF7F4C5D89C2D7A6B030434EA5B667BDF5EAD75D09519102A3E49DC6`。main540.33kB/gzip178.04kBで500kB超WARN、prepare-out-dir48.2秒WARN。
- `npm test`: 41files/341tests、exit0。`npm run check`: 型/管理対象1.0.4一致、exit0。新browserテストはこの341件には含めず別実行。
- `background-escape.cjs` GREEN: 移動と四隅5種類すべてで、別button focus→実mouse drag→Esc→開始transform復元、dialog維持、対象focusを確認。gestureが無い時のEscは通常close。座標入力や合成PointerEventへの置換なし。
- `.local/production-background-four-corners.cjs`、実document.scriptsでDtF6J3ij確認。120×80px合成SVG、containで210×140mm、y78.5mm。4handleで約219.633×146.422mmへ拡大、比率1.5維持、反対側anchor差0.00041mm以下（DOM表示丸め、許容0.02mm）。移動/拡縮Esc、dialog Cancel、適用後再表示の一致を確認。
- 背景を `translate(19.2652mm, 12.8435mm) scale(1.04587)`、contain、object-position50%50%に編集。手動downloadを保存し、browser reloadで空起動、明示回復後の本文「背景保存試験ABC123」、背景transform/fit/position/asset data完全一致を確認。browser reloadはnative再起動の証拠ではない。
- 手動 `.binsen` 再読込も確認。回復文書には未保存guardが出るため、初案はfilechooser待ちでtimeoutした。snapshotでguardを確認し、専用合成文書だけ「保存しない」を実click、CLIのfilechooser/uploadで上記downloadを読み込んだ。`.local/background-manual-verify.cjs` で本文と背景の独立literal期待値に一致、Result取得。初案のtimeoutを保存障害とは称さず、modalを無視して成功とも称さない。
- 1280×720の四隅/回復/手動読込6画像を親が目視。左右formの局所scrollはあるが、全紙面preview/handles/適用/Cancelは操作可能。375pxの全背景操作は今回未実施。
- console Errors0/Warnings0、pageErrors[]。専用session `letterier-background-final-oct2` PID57436はCLI close成功後PID不在を別確認。既存previewは保持。

旧4画像は `.local/background-esc-20261002/pre-fix-screens`、修正後6画像とdownloadは `post-fix-screens` に分離。旧成果物/証跡は削除していない。

## 独立レビュー

Native spawn Halley `01a0fa6c-e466-7492-9a43-aa43ce02d3f2`、assignment `BG-ESC-20261002-H`。同ID targeted waitのcompleted本文とnative close応答のprevious_status completedを取得。対象2filesのread-only静的レビューで指摘なし。親実測を独立実ブラウザー検証に読み替えない。実効model/Host・Host不在はUNVERIFIED。

| 対象 | reviewerと親のSHA256一致 |
| --- | --- |
| src/ui/BackgroundEditor.tsx | 4B6EDA37287D7C122CCCC6FF257C4640576309EDAC56F7781E59C9D1B4A990A1 |
| tests/browser/background-escape.cjs | 1924352062DAA8CFA57B51560B2BFD2E2C709C476DCC1EAD997568FE66703CD7 |

## 残件・版の区別

親の限定ローカル修正/検証、writerは親のみ。開始時既存差分279件を保護。commit/push/公開/installer起動なし。Rust保存処理変更なし、native testは今回未再実行。旧native保存/PDF検証と確認ZIPはDAkWGDAtであり、今回修正を含む完成物とは扱わない。新frontendに結合したWindows操作確認/再梱包、文字数指定下の途中font・size変更、自動罫線手動復帰、全図案巡回、全体受入照合は残る。

An actual mouse-gesture Escape defect was reproduced before the one-line focus fix. The regression passed for move and all four resize handles; idle Escape still closes the dialog. Aspect ratio, opposite anchors, cancel, explicit IndexedDB recovery and manual document readback passed with synthetic data. Six screenshots were inspected. The independent review is static and limited to two bound files. Earlier native binaries and review ZIP do not include this fix; the full goal remains incomplete.
