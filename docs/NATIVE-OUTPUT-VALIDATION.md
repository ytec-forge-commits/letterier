# Windows PDF・印刷経路の検証 / Native output validation

## BKC現行版の複数用紙・複数頁（2026-10-02、15:13–15:20 JST）

前節と同じ最新QA EXE SHA256 `464E46FD27C08DACC7AD7B16B2D6468AC37A31AFE8B7BF65DCDDC1C348B7C2A2`、実document.scripts `index-BKCcvAG_.js`。隔離root `.local/native-current-matrix-20261002`、App51208/WebView2 68812（親51208）、既存QA identifier/loopback9228/Runtime154.0.4258.53。通常release/installerは変更していない。

- PASS: 実UIで紅葉v5の合成2頁を作成。A4/B5/はがき × 用紙縦横 × 書字横縦の12条件、およびA4縦用紙・縦書きの第二頁だけを出力。13 PDF/25頁。UI本文、実寸transform、glyph/art矩形非重複、縦ASCII upright、pageErrors空を確認。同一実行session45071の終了0を観測し、重複起動していない。
- PASS: 実PDF保存buttonの準備portalを既存debug-only QA PrintToPdf経路へ通した。専用exe完全パス/PID/Save As class・caption/Cancel control照合後、13ダイアログをキャンセル。OS保存先選択成功の証拠ではない。
- PASS: `verify-native-upright-matrix.py --root native-current-matrix-20261002` 終了0。13ファイル/25頁、各用紙寸法許容0.25mm内、Rotate0、全文NFKC一致・頁分離、各頁2画像、font resourcesを独立読取検査。Poppler72dpiで全25頁を個別PNG化し、親が25枚全て目視。文字欠け、装飾/本文の重なり、縦英数字の横倒しは認めなかった。はがきの短い行での折返しも確認。PDF/renderはroot/pdfへ保持。
- PASS: 2頁のMicrosoft Print to PDFプレビューで実printer_area、fit範囲内、actual scale1、範囲99の出力禁止/alert、dialog終了時portal0を確認。3画像を親が個別目視。ほぼ全面のprinter_areaのためfit scale1で、非全面プリンターの実縮小確認ではない。jobSubmitted false。
- PASS: console Errors0/Warnings0、UI画像をroot/screensへ保存。既存guard付きclose_appはcleanupのみに使用。CLIのTarget closedは成功判定にせず、別Host観測でApp51208/WebView2 68812/9228 listenerの不在を確認。専用CLI sessionはnot attached。OS-close guardの拒否を迂回していない。

The current BKC Windows/WebView2 build passed thirteen PDF conditions (25 individually inspected pages), including A4/B5/postcard, both paper and writing orientations, and page-two-only output. Two-page printer-area/100% previews and invalid-range guards passed without submitting a job. Save As destination completion, physical printing and OS-close guard remain outside this evidence.

## BKC現行版の復元後混在PDF・印刷プレビュー（2026-10-02、15:06–15:09 JST）

最新QA EXE SHA256 `464E46FD27C08DACC7AD7B16B2D6468AC37A31AFE8B7BF65DCDDC1C348B7C2A2`、frontend `index-BKCcvAG_.js` / `01B47E40EA7FA45B198561D349FD66586B050C0AEA3C0BFF545FE4128AB9D482`。App30212/専用WebView2 57276（親30212、Runtime154.0.4258.53）、127.0.0.1:9228、既存QA identifierをHost/WebView2で確認。隔離root `.local/native-current-save-20261002` の再試行保存41文字を、空起動から明示回復して使用。

- PASS: 実UIのPDF保存ボタンで生成されるprint-outputを実WebView2 QA出力へ通し、横/縦のA4各1ページを出力。本文41文字、2書体/14・24pt/部分太字、実寸transform、glyph四辺帯外0、縦ASCII uprightを実DOMで確認。OS保存ダイアログは専用PID/完全exe path/Save As caption/Cancel controlを検査して2回キャンセル。OS保存先指定での成功ではない。
- PASS: read-only pypdf検査で両PDFの全文NFKC一致、1ページずつ、Rotate0、font resources2、A4寸法209.88865×297.01066mm（許容0.25mm内）。PDF SHA256は縦 `61E1C0269019C5C2E4CAA754F7500786CDCCCEEC88C2A65ED8B7221E7661D461`、横 `344F8856EC24F8D19FF0EBD353367629CB36A1FC75EE68793A64FBC92C1E4B00`。
- PASS: Poppler96dpiで両PDF全頁を個別PNG化し親が全2頁を目視。縦英字uprightと括弧、全文、混在サイズ、罫線との非重なりを確認。検証出力はroot/pdf内に保持。これらは合成QA出力であり利用者向け納品PDFではない。
- PASS: Microsoft Print to PDFの実printer_areaを読取、A4のfitが印刷可能範囲内、actualがtranslate(0mm,0mm) scale(1)を確認。プリンターの範囲がほぼ全面なのでfitのscaleも1で、実縮小の代表試験とは称さない。範囲99でPDF/印刷button無効とalert、dialog終了時のportal0を確認。印刷buttonを押さず、jobSubmitted false。fit/actual/範囲拒否の3画像を全て親が目視。
- PASS: 出力のための一時横書き設定を縦へ戻し、自動保存完了待機→別ZIP解析で元ファイル37文字/回復41文字と混在書式/count10/自動罫線維持を確認。console Errors0/Warnings0。5UI画像をroot/screensへ保持し、実PDF2枚の目視を別に数える。
- PASS: 既存close_appを専用cleanupにのみ使い、App30212/WebView2 57276/9228 listenerのHost不在を確認。OS-close API拒否の権限を追加・迂回していない。

今回製品コード・依存・版番号・保存形式・権限・通常release/installerを変更していない。全358 JS/check/12 Rustは同製品版の前回結果であり今回再実行ではない。旧DLcqの13 PDF/25頁/複数用紙証拠をBKCへ自動昇格せず、今回の範囲はA4・各方向1頁と印刷プレビュー。現版複数用紙/複数頁、OS保存先成功、印刷job/実プリンター、正式配布受入は別gate。

The latest BKC Windows/WebView2 build produced two one-page A4 PDFs from the explicitly recovered mixed-format letter. Independent structural/text checks and all-page rendering inspection passed. Actual printer-area fit/100% preview and invalid-range guards also passed without submitting a job. The OS Save As dialogs were cancelled; this is not destination-save success or broad current-revision multipage approval.

## 共通upright修正後の複数用紙・複数頁再確認（2026-10-02、13:54–14:01 JST）

前節の修正版debug exeを再利用し、SHA256 `8A8D054C964212B64AB49E4880C67ECCC78CC215F33D2EF5D659958E8CC49DD7` の一致を確認。新root `.local/native-output-upright-matrix-20261002` のstore/profile/pdfへ完全分離。実document.scriptsは `index-DLcqMv88.js`。QA識別子は既存の `jp.ytec.binsen-kobo.qa-save-20261002`、実app PID15016、loopback9228のWebView2 PID40120、親PID15016、Runtime154.0.4258.53を別host観測した。通常配布版のbuildや識別子変更は行っていない。

- PASS: 実UIから紅葉v5の合成2頁を作成。A4/B5/はがき × 用紙縦横 × 書字横縦の12条件と、A4縦用紙/縦書きの第二頁だけの1条件を再巡回。13 PDF / 25頁、準備本文一致・実寸transform・glyph/art矩形重なり0・pageErrors空。縦書き出力のASCII英数字がuprightであることも追加assertした。
- PASS: 各回、実UIのPDF保存が作ったprint-outputを既存debug-only qa_export_pdf（同じwrite_pdf/PrintToPdf経路）で出力。専用exe完全パス・PID・Save As class/caption・Cancel ID/captionを照合して13ダイアログをキャンセルし、次条件前にportal消滅を確認。OS保存先選択成功の証拠ではない。
- PASS: 専用read-only `.local/verify-native-upright-matrix.py` で13ファイル全件のPDF header、ページ数、文字、範囲漏れ、Rotate0、各頁2画像とfont resources、SHA256を検査。MediaBoxは最大偏差約0.217334mmで全件許容0.25mm以内。Poppler72dpiの全25ページを親が1枚ずつ目視し、この合成本文では文字欠落/切れ・装飾との重なり・縦英数字の横倒しを認めなかった。はがきの狭い帯での折返しも保持された。全フォント/長文の包括試験とは扱わない。
- PASS: Microsoft Print to PDFの実printer_areaは210.015667×297.010667mm、左上0。2頁のfitは各translate(0.00783333mm,0.00533333mm) scale(1)、actualは原点scale1。範囲99でalertとPDF/印刷双方disabled、閉じた後portal0。3プレビュー画像を目視。実印刷ジョブ未送信、非ゼロ余白プリンターでの実縮小は未検証。
- PASS: runtime-results.logは13条件/25頁と現行bundleを記録、console.logはErrors0/Warnings0。専用rootに13 UI captures＋3 print captures（16枚）と25頁renderを保持。全13 UI capturesを個別目視したとは称さず、PDF renderとprint3枚は個別目視した。
- PASS: 既存guard付きclose_appで制御cleanup。CLIはTarget closedを返したが、別host観測でapp15016/WebView2 40120と9228 listenerの不在を確認し、専用CLI sessionをdetachした。OS終了guard成功へ読み替えない。

QA起動の初回はWindows PowerShellのscript policy拒否、次は同shellのUTF-8日本語パス解釈でDedicated binary missingとなった。アプリは起動せず、既存同梱PowerShell7で同一スクリプトを実行して成功。OS policy/設定は変更していない。QAスクリプトは `.local/native-upright-matrix-{launch,prepare,next,case,cancel,print,result}`、過去の試験guardや証跡を改変していない。

今回の製品コード変更・再build・依存/版番号/保存形式変更なし。前工程の349 JS tests/check/build・12 Rust testsの結果は履歴として保持し、今回再実行したとは称さない。既存287件の差分を保護。全変更の広い独立review版binding、現行通常確認成果物/日英説明更新、OS保存先選択成功/OS終了guard、実IME、電源断・容量不足・多重起動、375pxの今回出力確認、他Windows/Clean VM/物理印刷は別gate。権限拒否を迂回しない。goalは未完了。

The fixed shared renderer passed a fresh native thirteen-case, twenty-five-page paper/orientation/writing-mode matrix. Every PDF was structurally checked and every rendered page visually inspected. Print-preview guards passed without submitting jobs. Native Save As dialogs were cancelled; destination-selection success and OS-close guards are not claimed. Current packaging and broader review gates remain open.

## 混在書式と縦書き出力向きの修正（2026-10-02、13:20–13:45 JST）

前ターンの混在サイズ入力修正後、実WebView2の混在2書体・14/24pt・部分太字・目安10文字・自動罫線文書を検証した。`index-9MYp8P-f.js` のPDF目視で、縦書きASCII英数字が編集画面ではupright、PDF/readonly previewではmixed（横倒し）になる不具合を発見。upright CSSが `.page-edit` だけに当たっていた。`tests/browser/vertical-output-orientation.cjs` は英字7＋数字3のcomputed style比較でREDを確認。`src/ui/Paper.tsx` の共通LineContentへ縦書きuprightを追加し、ASCII括弧のmixed例外を保持した。保存処理・形式・依存・版番号・権限は変更していない。

修正版 `index-DLcqMv88.js` SHA256 `45ECBCA6160E281FDE3DB7775B07B3895D8D80125ED07C9AA2939D9C238FD26A`。debug/no-bundle/no-sign native build PASS（5m03s）、専用copy SHA256 `8A8D054C964212B64AB49E4880C67ECCC78CC215F33D2EF5D659958E8CC49DD7`。QA識別子 `jp.ytec.binsen-kobo.qa-save-20261002`、新root `.local/native-font-upright-20261002`、store/profile/pdfを分離。通常exe/installer/確認ZIPは更新していない。修正前root `.local/native-font-mixed-20261002` の不成功PDFも保持し、合格成果へ流用しない。

- PASS: 修正版nativeの再現browser試験GREEN。編集とpreviewの英数字10文字が全てupright/vertical-rl、offset/combine一致。
- PASS: 実UIでPDF保存を開始し、準備されたprint-outputの本文39文字・14/24pt・A4/実寸transform・全方向glyph帯内をassert。保存先ダイアログが待機している間、既存debug-only qa_export_pdf（実export_pdfと同じwrite_pdf/PrintToPdf経路）で横/縦各1 PDFを専用先へ生成。毎回exact app PID/path・#32770・Save As caption・Cancel ID/captionを確認してキャンセル。invoke差替えやmockなし。OS保存先選択成功の証拠ではない。
- PASS: 2 PDF / 2頁をpypdfで別解析。全文NFKC/空白正規化一致、2font resources、rotation0、A4 209.888653×297.010660mm（許容差0.25mm以内）。SHA256 vertical `a802a72ec00b07ed09f497fd4e45cc8c9c1e757eb66406705942d16281c72ca2`、horizontal `c06dbe2970177f3e200a62c121e7850cafd570599658610c244294ed6b93c3ad`。Poppler96dpi全2頁を親が目視し、縦英数字の正立・括弧・混在サイズ・罫線を確認。構造検査だけで向きの合格を判断していない。
- PASS: `(AB)12` を実キー追加し、横/縦で編集とpreviewの全token orientation/combine/size/offset/end一致。ASCII括弧mixed、通常縦文字upright、2桁12は縦中横all、横書きはnone。全角括弧・14/24ptも対象に含む。追加部分を実Backspaceで除去し元39文字へ復帰。任意記号・全書体・複数ページを包括した試験ではない。
- PASS: Microsoft Print to PDFの実printer_area 210.015667×297.010667mm、余白0。fitはtranslate(0.00783333mm,0.00533333mm) scale(1)で印刷可能範囲内、actualはtranslate(0mm,0mm) scale(1)。範囲99ではPDF/印刷ボタン両方disabledとalert。print-output漏れなし、ジョブ未送信。
- PASS: 修正版exe2回の起動で実document.scriptsがDLcq版。初回app26512/WebView2 49020、再起動app69680/WebView2 21260、loopback9228/親PID/Runtime154.0.4258.53を別host観測。空の通常起動→明示回復で39文字・混在書式・縦方向・文字数10/自動2設定保持。別file比較もPASS。終了は既存close_appによる制御cleanup、全4PID/9228不在確認。OS閉じるguard試験とは数えない。
- PASS: 全349 JS tests/check/version1.0.4、frontend build、12 Rust tests（Paper修正前に実行、Rust source変更なし）。main540.80kB/gzip178.24kBの500kB警告とprepare時間警告は残る。修正版2起動console Errors0/Warnings0。2PDF render、再現preview、再起動回復、横/縦variant、print fit/actual/invalidを目視。

限定独立READ ONLY静的review `VERTICAL-OUTPUT-UPRIGHT-20261002-L` / `01a0fae3-70bd-76d2-8844-2a88e7af2eb8` は明確な残存コードバグなし。正規同IDwait/close応答、親による再hash照合一致。model/host実効identityとreviewer動的確認はUNVERIFIED。

| 対象 | SHA256 |
| --- | --- |
| src/ui/Paper.tsx | BA332245E236578373F0523858A73CC41B83257672581A615A9B421945A69D1D |
| tests/browser/vertical-output-orientation.cjs | FD7F26368A7DFAB8AEA396A7E0EDC3C49C81D8EFD469B7CE366FE8DE1FB010E1 |
| src/ui/ReadonlyPages.tsx | 2C4EEEA1E05DC1BB655BC00E983817E88A0AB49A64EF385F6CCC47A14FF1D798 |
| src/ui/typography.ts | D66814390B3899BA217DDB544DB611AC89BA4C23F2E3CF9DF09CD9AD8C018814 |
| src/core/compose.ts | 47B0495CBA29E6201DCA8DF8A296575D091E87AAC56F29122A874FCCEA69699C |

QA前提の失敗も保持: 最初のgeometry検査はpage-editのinline writingModeを見ており方向証拠が弱かったため、各lineのcomputed modeと四辺を確認して再実行。保存statusの誤名称による待機timeout、編集後にmanual段階のverifierを呼んだ期待値違い、通常Pythonのpypdf欠落、cp932へのvertical presentation form出力エラーを成功へ数えず、正しい段階/同梱Python/ASCII-safe出力で確認。variant削除後の隣接同書式runの圧縮はraw境界比較で検出、本文と全有効style属性が同一であることを別検査した。元ファイルは未変更。busy中の保存captureも完了画面証拠ではない。

残件: このPaper修正を含むA4/B5/はがき×用紙向き×書字方向の広い複数頁出力再巡回、全変更の独立review版binding、通常確認成果物・日英説明更新。以前の13PDF/25頁は旧版の限定証拠。375pxの今回出力確認、OS保存先選択成功、OS終了guard、実IME、停電/容量不足/多重起動、Windows10/Clean VM/物理印刷は未実施で、拒否経路は迂回しない。

An actual WebView2 PDF mismatch was reproduced: vertical ASCII was upright in the editor but sideways in readonly output. The shared renderer was fixed test-first. Current native preview checks, two A4 mixed-format PDFs with full-page visual inspection, explicit recovery after restart, bracket/two-digit variants and print-preview guards passed. Broader current-version paper/multipage replay and refreshed review packaging remain outstanding; no printer job, publication or production data change occurred.

2026-10-02 JST。合成文書だけを使用。本番インストール・公開・プリンターへのジョブ送信なし。

Synthetic documents only. No production installation, publication or printer-job submission.

## 背景Esc・縦書き送り量修正後の現行再検証 / Current metrics-build replay

2026-10-02 12:10–12:26 JST。`index-yDVezcP9.js`（SHA-256 `1C66658B9748C945E7D236C1649B575D1AAE23CE239A44D131997B6F4E4D46A9`）を同梱したdebug/no-bundle/no-signビルドが完了。専用QA識別子は従来と同じ、保存先・PDF・WebView2 profileは新しい `.local/native-output-metrics-20261002/` に分離した。QA EXE SHA-256 `742E974171FFF7EA390D5CD93CECF3A0106B4F6690A203B12FA94D87FDC7C654`。親が実EXE完全パス、app PID22996、9229のWebView2 PID21900と親PID22996、WebView2 154.0.4258.53、実document.scriptsを確認した。独立担当の実機再検証ではない。

- PASS: 変更していない `native-output-prepare.cjs` / `native-output-case.cjs` を実UIで実行。紅葉v5の合成2ページをA4/B5/はがき × 縦横用紙 × 横/縦書き12条件とA4縦書き範囲2の1条件で生成。13 PDF / 25ページ、全件の本文一致・実寸transform・glyph/artwork矩形重なり0・pageErrors空を確認。
- PASS: 毎回、専用EXE完全パス・PID・Windowsダイアログclass `#32770`・「名前を付けて保存」タイトル・IDCANCELの文言を確認し、そのダイアログだけをキャンセルした。次条件へ移る前に出力portal消滅を確認。ファイル選択成功の証拠ではない。診断PDFは実UIの出力紙面に対して既存debug専用commandを呼び、共通write_pdf/WebView2 PrintToPdf/atomic-save経路を利用する。
- PASS: read-only `.local/verify-native-output-metrics.py`（既存検査器の許可rootだけ変更）でPDF header、ページ数、MediaBox（許容0.25mm、最大偏差約0.217334mm）、Rotate0、本文、範囲漏れなし、各頁2画像、font resource、SHA-256を検査。全25ページをPoppler 72dpi PNGへ変換して1枚ずつ目視し、この合成本文では文字切れ・欠落・装飾との重なりを認めなかった。25 rendersと13 UI画像を専用rootに保持。
- PASS: Microsoft Print to PDFの実印刷範囲は左/上0mm、幅210.0156667mm・高さ297.0106667mm。fitはscale1と微小中央寄せ、actualはscale1/原点。範囲2は第二頁だけ、99は警告とPDF/印刷両ボタン無効。閉じた後portal0。4プレビュー画像を目視。印刷ジョブは送信していない。非ゼロ余白や実プリンターの縮小成功は未検証。
- PASS: 最終結果count13/overlaps0/pageErrors空、CLI console Errors0/Warnings0。専用guard付き `close_app` で制御終了し、app/WebView2両PIDと9229 listener不在を別途確認。Target closed応答だけで終了成功とみなしていない。OS終了の未保存ガード確認ではない。
- 初回のready待機は存在しない `.app` selectorでtimeout。実snapshotの「新しい手紙」ボタンへQA待機を修正して成功した。初回PDF診断は専用pdfフォルダー未作成により「保存先に書き込めません。」で失敗。write_pdfのtempdir_inと実フォルダー不在を照合し、専用出力フォルダーを作成した同一版で再実行した。初回印刷QAは直前の範囲2を維持したまま2枚を期待して失敗。QAで範囲を明示的に空へ戻して同一版で再試験した。いずれも初回失敗をPASSへ読み替えず、製品コードは変更していない。
- 変更はローカルQAスクリプト・証跡・本記録と受入照合のみ。保存形式・依存・版番号・権限・OS/プリンター設定、通常配布物は変更しない。既存差分と旧証跡は保持。混在フォント/サイズ/目安文字数/自動罫線を使うnative PDF、OS保存先選択成功、実紙出力、実IME、電源断・強制終了、他Windows/VM、現行確認成果物の再梱包と広い独立review版照合は別途残る。

The current metrics build passed thirteen native PDF cases (twenty-five pages), structural checks, individual render inspection and printer-preview range guards. Native Save As dialogs were cancelled; successful destination selection and submitted print jobs are not claimed. Three initial QA setup/selector/state mistakes were corrected without product changes. The isolated app and debugger stopped, while mixed-format native output and broader completion gates remain open.

## 日英UI最終修正後の旧版証跡 / Earlier bilingual-build evidence

2026-10-02 10:32–10:42 JST。現行frontend `index-DAkWGDAt.js` を埋め込むdebug/no-bundle/no-sign buildが完了。通常識別子は変更せず、既存QA識別子 `jp.ytec.binsen-kobo.qa-output-20261002` と新規 `.local/native-output-final-20261002/` のPDF/store/WebView2 profileを使用。QA EXE SHA-256 `8B98493254B2CAF47A1C759E81D09B7B1455F12ABBAD82FDA1CFA4E3063178E1`。実EXEパス、app PID1984、9229 WebView2 PID13964と親PID1984を別途確認。実document.scriptsでも最新bundle一致。親の実測であり、過去の独立担当による新たな実機再検証ではない。

- PASS: 実UIで紅葉v5の合成2ページを作成。変更していない `native-output-prepare.cjs` / `native-output-case.cjs` の専用識別子guardを維持し、A4/B5/はがき × 縦横向き × 横/縦書き12件とA4縦書き範囲2の1件、13 PDF / 25ページを生成。全件本文一致・実寸transform・glyph/artwork矩形重なり0・pageErrors空を確認。
- PASS: 全13回とも専用PID・EXE完全一致・「名前を付けて保存」タイトルを確認して保存ダイアログをキャンセル。UIがbusyを解除し、出力portalが消えてから次条件へ移動。OS保存先選択成功の証明ではない。既存debug専用commandは本来のUIで準備した紙面に対し、共通write_pdf/WebView2 PrintToPdf/atomic-save経路を使用する。
- PASS: 既存read-only Python検査器の限定rootだけを新しいQA rootへ変更した `.local/verify-native-output-final.py` で、全13ファイルのPDF header・頁数・MediaBox寸法（許容0.25mm）・本文・範囲漏れ・各頁2画像・font resource・SHA-256を確認。最大寸法偏差は0.2173333333mm。数学的な寸法完全一致とは報告しない。
- PASS: 全25ページをPoppler 72dpi PNGへレンダーし全枚を目視。本文・罫線・装飾の重なり、文字切れ、文字欠落を認めない。小さいはがきでは飾りを避けて途中改行することを確認。25 rendersと13 UI画像を新QA rootへ保持。
- PASS: 同版のWindows印刷プレビューでMicrosoft Print to PDFの実範囲を取得。左/上0mm、幅210.0156667mm・高さ297.0106667mm。fit/actualともscale1で、fitだけ小さな中央寄せ。範囲2は第二頁だけ、99は警告とPDF/印刷両ボタン無効。閉じた後portal0。4画像を目視。非ゼロ余白への実機縮小、ジョブ送信の成功ではない。
- PASS: 最終UI結果count13/errors0/overlaps0、console Errors0/Warnings0。`close_app` による制御終了後にapp/WebView2 PIDと9229 listener不在を確認。応答切断のTarget closedだけで終了成功と判断していない。
- 今回の変更はローカルQAコピー3files・証跡・本記録。製品ソース、保存形式、依存関係、版番号、OS/プリンター設定、権限は変更していない。旧証跡・既存差分・tmpを保持。OS保存先選択、実プリンター紙出力、全フォント混在のnative PDF、IME、別Windows/VM等の未実施範囲は下記を維持。

The current frontend produced thirteen native PDFs with twenty-five pages. File structure/text/dimensions/resources and all twenty-five rendered pages passed inspection. Printer preview and invalid-range checks passed; no printer job was submitted. All native save dialogs were cancelled, so successful OS destination selection is not claimed. Exact process/path/parent/listener and bundle observations identify the isolated runtime. Product code and permissions remained unchanged, and the dedicated app/debugger stopped. Final documentation repackaging and a requirement-by-requirement completion audit remain separate gates.

## 最新20シリーズ完成版の再検証 / Latest all-20 build recheck

2026-10-02 JST。以前の証跡を保持したまま、最新frontend `index-OvbCngb2.js` で専用debug版を再ビルド。出力先・store・WebView2 profileは `.local/native-output-all20-20261002` に分離した。EXE SHA-256は `87DB2392576A003E5715C29D1DA54AD0E8A9B2BE9B66383758371068D0FD2F0C`。親が実EXEパス、アプリPID66252、9229のWebView2 PID13020（親66252）を確認した。これは親の観測であり、独立担当の実機再検証ではない。

The latest all-20 build was rebuilt and tested in an isolated local QA directory; earlier evidence was preserved. Process identity was observed by the parent, not independently reproduced by a reviewer.

- 実UIで紅葉v5の合成2ページを作成し、A4/B5/はがき × 縦横向き × 横/縦書き12件と範囲2の1件を再出力。13 PDF / 25ページすべてPASS。全件の本文一致・glyph/image矩形重なり0・実寸transform・各保存ダイアログのキャンセル後portal消滅を確認した。OSダイアログで保存先を選んで成功した証拠ではない。
- `.local/verify-native-output-all20.py` は既存read-only検査器の出力先だけを最新QA rootに限定したもの。全13ファイルのheader・頁数・寸法許容0.25mm・本文・範囲漏れ・各頁2画像・font resource・hashを検査しPASS。最大寸法偏差は約0.2174mm。`-O`によるassert無効化は意図どおり拒否した。
- Poppler 72dpiで25ページをPNG化し、全25ページを目視確認。本文・罫線・図案の重なりや文字切れを認めなかった。レンダーは同QA rootの `renders` に保持した。
- 最新版の実印刷プレビューでMicrosoft Print to PDFを選択し、実寸/fit・範囲2・範囲99を操作。2ページ目だけの本文一致、範囲外でPDF/印刷両ボタン無効と警告、閉じた後portal0を確認。実機取得値は左/上0mm、印刷可能幅210.0156667mm・高さ297.0106667mm。fitはscale1と小さな中央寄せ、actualはscale1/原点であり、非ゼロ余白への縮小の実機証明ではない。4画面を同QA rootに保持して目視した。ジョブ送信は行っていない。
- 印刷プレビューの初回QA待機は `[role="dialog"]` を探してtimeout。標準HTML `dialog` は明示role属性なしでもアクセシビリティ上dialogとなるため、テスト側のセレクターが誤っていた。製品は変更せず `dialog[open]` へ修正し、同一版で再実行PASS。失敗を成功扱いしない。
- 全出力ケース・プレビューのpageErrors空、最後のCLI consoleはErrors0 / Warnings0。既存 `close_app` で制御終了し、対象アプリ/WebView2 PIDと9229 listenerの不在を別途確認。CLIのclosed-targetエラーは終了に伴うもので、単独では終了成功の根拠にしない。OS閉じるボタンの未保存ガード試験ではない。

All thirteen native PDFs passed structural checks, and all twenty-five rendered pages were inspected. Latest-build printer preview checks passed without submitting a job. The initial preview timeout was a QA selector error, corrected without changing the product. Destination selection in the native save dialog, physical printing, shrink-to-nonzero printer margins, forced termination and power loss remain untested. Latest Windows save/idle-retry/restart evidence is recorded separately in [SAVE-RECOVERY-VALIDATION.md](SAVE-RECOVERY-VALIDATION.md).

本工程の変更は検証用ローカルlauncher・read-only検査器・印刷プレビューQAと本記録のみ。製品ソース・保存形式・依存関係・版番号は変更しない。旧証跡・既存Git差分を保持し、公開・push・インストール・削除は行わない。

## 境界 / Scope

専用debug識別子 `jp.ytec.binsen-kobo.qa-output-20261002`、別store・WebView2 profile・PDF出力先を使用。修正前証跡は `.local/native-output-qa-20261002`、修正後は `.local/native-output-wrap-qa-20261002` に分離して保持する。通常版や実ユーザーデータへ接続しない。

The dedicated debug identifier, store, WebView2 profile and PDF directory are isolated from the normal app. Pre-fix and post-fix evidence are retained separately.

UI「PDFとして保存…」で本来の `export_pdf` と保存ダイアログを開始し、busy時の実 `print-output` を確認。その間に既存debug専用 `qa_export_pdf` で同じ `write_pdf` / WebView2 `PrintToPdf` / atomic-save経路へ出力する。親が専用PID・EXE完全一致・保存ダイアログのタイトルを確認し、`CloseMainWindow`でキャンセル後、UIを閉じてportal消滅を確認する。これは **OSダイアログで指定先を選んだ保存成功ではない**。

The real UI prepares the output and opens its native save dialog. While that dialog waits, the existing debug-only command exports the prepared paper through the genuine shared WebView2/atomic-write path. The parent verifies the exact QA process and cancels that dialog. This does not prove successful destination selection in the OS dialog.

最初のinvoke置換案はTauriの書換不可プロパティにより効かず、UI保存ダイアログ待機でtimeout。権限・製品コードを緩めず撤回した。旧 `native-output.cjs` の直接呼出しはbusy時のportalを用意しないため、現行画面の正常出力証拠には使わない。

The initial invoke-replacement attempt failed because the property is immutable; it was withdrawn, not treated as success. The legacy direct-command script does not prepare the current UI output portal and is not used as current output proof.

## 発見・修正 / Finding and fix

修正前13PDFは本文・画像・ページ数の機械検査を通ったが、画像化したはがきで本文と図案の重なりを発見。**修正前の目視判定はFAIL**。罫線のみが図案を避け、本文composeにはその領域の回避がなかった。

Pre-fix files passed structural checks but postcard renders failed visual review: body text overlapped artwork. Ruling avoided the artwork, but body composition did not.

`compose.ts`へ図案矩形＋1mmの本文回避を追加。設定余白は変更せず、飾りに隣接する行だけ折り返す。混在文字サイズによりspacingが増す場合は回避領域を再計算する。本文・書式・保存形式は保持されるが、図案に重なっていた旧文書は行折返し・自動改ページが変わり得る。

Body composition now avoids the artwork rectangle plus 1mm, without changing stored margins. The occupied band is reconsidered for mixed font sizes. Stored content/format stays intact; previously overlapping illustrated documents may reflow or paginate differently.

TDD: 新12ケース（3用紙×2向き×2書字方向、14/24pt混在）は全件重なりでRED→修正後GREEN。旧罫線testは「最初の行幅不変」から「保存余白不変・中間行の全幅維持」へ更新。最新41 files / 269 tests、check/version/build PASS。初回全体実行は旧行幅assert2件と実行時間timeout4件で失敗、更新後の全体再実行はPASS。timeout値や依存関係は変更しない。既存500kB超chunk警告は残る。

The regression was reproduced before the fix. All 269 frontend tests and type/version/build checks passed on rerun; initial failures are not counted as success. The existing chunk-size warning remains.

## 観測 / Observations

**修正後の限定結果: PASS。** A4/B5/はがき×縦横向き×横/縦書きの12PDF＋A4縦書きの範囲2、合計13PDF/25ページを実WebView2で生成。全13ケースの実出力DOM本文一致・glyph/image重なり0、pageErrors空、console error/warning 0。各native保存ダイアログを固定QA processでキャンセルし、閉じた後portal0を確認。通常の実ファイル検査も13件PASS。Popplerで全25ページをPNGへ展開し、本文・罫線・図案・空白余白を全頁目視、修正前のはがき重なりの解消を確認した。

The fixed build produced 13 genuine WebView2 PDFs / 25 pages. All UI preparation/body/overlap checks and separate file checks passed. All 25 Poppler renders were inspected. These results retain the save-dialog and printer-job limitations above.

保存ダイアログをキャンセル後に専用アプリを既存 `close_app` で制御終了。PID57348と旧PID21596、9229 listenerの不在を確認。これはOS閉じるボタンの未保存ガード試験ではない。EXE・合成PDF・store/profile・修正前後の証跡は削除せず保持。

The dedicated app stopped through its existing controlled-exit command; app/debugger absence was checked separately. Evidence was retained. This is not a window-close unsaved-guard test.

- 修正前EXE SHA-256: `84B923007349F2C838B099AA5D2C0C618EB06701B2D7D19EB55796D0E99295B4`。QA PID21596、9229 WebView2 PID68556の親21596。制御終了後、旧PIDとlistener不在確認。
- 修正後EXE SHA-256: `32530D5DECA47C42372DF56771CCC7A8784B02613067470C55568237720D372C`。QA PID57348、9229 WebView2 PID51684の親57348。frontend `index-DBpkf2TS.js`。
- 保存関連: Rust12 tests PASS。Windowsの排他lock、外部削除、directory target、既存ファイル保護を含む。保存証跡のread-only再確認で、manualは手動保存時の本文、draftは追加編集時の本文。今回のPDFアプリで手動ファイル保存成功を試したという意味ではない。
- 修正後の専用browser `letterier-save-wrap-oct2` で実IndexedDB保存・明示回復・履歴復元前保護・再読込・壊れたdraftの保持と修復・手動download PASS。downloadのv2本文一致を別decode確認。pageErrors/console errors/warnings 0。profileを閉じた。保存／文字数／自動罫線の近接5 files / 61 tests PASS。
- 印刷プレビュー（修正前版）: WindowsのMicrosoft Print to PDFの実印刷可能範囲を取得し、actual/fit切替、範囲2、範囲99の両出力ボタン無効を確認。全幅プリンターのためscale1であり、非ゼロ余白への縮小の実機証明ではない。

Host/process observations are parent evidence, not claims made by browser scripts. Save/recovery tests are documented separately in [SAVE-RECOVERY-VALIDATION.md](SAVE-RECOVERY-VALIDATION.md). The preview check did not submit a job or demonstrate shrink-to-nonzero-margins.

## 再確認 / Recheck

`native-output-prepare.cjs` は専用識別子と空の合成初期文書を必須にし、紅葉v5の2ページを画面で作成する。`native-output-case.cjs` は3用紙・2向き・2書字方向と範囲2だけを受け付け、実寸transform・本文一致・glyphと図案の矩形重なり0・図案path・pageerrorを検査する。保存先選択とプリンター送信は行わない。

Read-only file recheck (bundled Python with pypdf):

```powershell
python -X utf8 scripts/verify-native-output-pdfs.py
# Pre-fix evidence only; its structural PASS does not override visual FAIL:
python -X utf8 scripts/verify-native-output-pdfs.py --root native-output-qa-20261002
```

実ファイル検査は13PDFのheader、頁数、用紙寸法（明示許容0.25mm）、本文・範囲漏れ、各頁2画像、font resource、SHA-256を検査。Skiaの日本語互換文字は抽出結果だけNFKC正規化する。現在の出力サイズに約0.2174mmまでの偏差があり、寸法が数学的に完全一致したとは報告しない。これだけでWebView2実行・画面操作・目視成功を証明しない。

The verifier checks structure/text/resources and hashes with a stated 0.25mm tolerance. Extraction-only normalization does not modify the document. Exact mathematical size equality, native runtime/UI operation and visual correctness require separate evidence.

Python最適化による`assert`省略は誤成功になり得るとの独立指摘に対し、`__debug__`ガードを追加。修正前の`-O`実行exit0を再現し、修正後exit1拒否、通常実行exit0/13件PASSを分けて確認した。`-O` / `PYTHONOPTIMIZE` で実行しない。

The verifier now rejects optimized Python execution rather than silently skipping assertions. The pre-fix optimized success, post-fix rejection and normal verification success were observed separately.

## 独立確認・未実施 / Independent review and limits

初期QA担当Archimedes `01a0f915-3bbb-73e1-86de-69745820385d` は同版3hashを確認。進行中10PDF時点の不足HOLDは13件存在の再確認後解除。OS保存successとprintjob成功の証明ではない制約付きPASS。同IDcompleted wait後close済み。

本文修正担当Einstein `01a0f91c-8f86-7893-9ddc-c2936029e9fc` は4 files /43関連testsと5 files /40近接tests PASS。compose hash `DFC0740C38414FE3FAF9D21B3405765E0642E75EA4CBDD1C3372525F0408400A`、新test `4C223C727227722E979405C94ECEF52140F48922442F002F891369A6AB3A76D9`、罫線test `870499D1A7480C4A1BFA3C188DAA8870C80CCDB032E23FEFE72258691E3C0A45` に結合、重大所見なし。同IDcompleted wait後close済み。実効model UNKNOWN、親single writer。実ブラウザ／PDF再実行は親の検証。

NOT RUN: OS保存先の選択成功、native printer-job成功、物理プリンター紙出力、非ゼロプリンター余白の実機縮小、全フォント・サイズ混在のnative PDF、実OS IME、別Windows version/VM。未実施項目はPASSへ格上げしない。公開・push・version変更・依存変更なし。既存差分と `tmp/` は保持する。

最終QA script担当Leibniz `01a0f921-2fa4-7701-8a1c-e6028c979ef3` は本文直接一致・矩形重なり検査・root分離を限定静的PASS。Python最適化P2は上記ガード追加と`-O`拒否の分離確認後PASS。case hashの一度の転記誤りは同担当が実ファイルを再実測し訂正、親の値と完全一致した。同IDcompleted wait後close済み。最終3hash:

```text
6A24D1A16442CD4AF6ECF2570345187C2F3F6F2E3779606A1814CA4CD60798A8  tests/browser/native-output-prepare.cjs
CA815D6AB84923F5CCA362C2BE240A5D848A5FAB88554B294193B15A68D460C8  tests/browser/native-output-case.cjs
95644066D36808FA1870866CBBB390C664C548466B99B1DC935F564D78D1853E  scripts/verify-native-output-pdfs.py
```

親が全6code/test hashを再確認し一致。実効model UNKNOWN。通常PDF検査・native UI/PID・画像目視は親の観測で、担当の独立実機再実行ではない。この最終説明追記は親の文書変更で、script/codeの独立レビューと区別する。実施内容と未実施範囲を限定して親が受入した。

The final script reviewer confirmed the updated version and rejected optimized Python execution. A reported hash transcription error was independently remeasured and corrected. Review acceptance, parent runtime/file/visual evidence and this parent-written completion note are separate claims.

The full goal remains active: this bounded slice is not completion of all stationery/UI/performance/delivery requirements.
