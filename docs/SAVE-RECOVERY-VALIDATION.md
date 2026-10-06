# 保存・復元の検証 / Save and recovery validation

## BKC現行版の実排他ロック・入力なし再試行・再起動（2026-10-02、15:00–15:03 JST）

最新QA EXE `464E46FD27C08DACC7AD7B16B2D6468AC37A31AFE8B7BF65DCDDC1C348B7C2A2` / frontend `index-BKCcvAG_.js` を同じ隔離rootで再起動。App55156/WebView2 52900（親55156）と、再試行後の再起動App69136/WebView2 56572（親69136）をHostで観測。いずれも専用exe path/identifierと127.0.0.1:9228。通常版を起動・上書きしていない。

- PASS: 空起動→明示回復で既知の39文字混在fixtureを確認してから、`.local/native-current-lock.ps1` の専用draft FileAccess.Read/FileShare.Noneによる25秒lockでREADYを観測。対象は既知合成ID `d94ccc89-17df-4a4c-8e23-5e3e7f131d0a` のみに固定、実データ/他保存項目へ作用なし。
- PASS: 実キーで「再試」を追加し、自動保存status「保存に失敗」と実alertを観測。編集本文41文字は保持。画像の警告は「ファイルを開けません。」であり、権限拒否/OS容量不足の試験と読み替えない。
- PASS: lock processのRELEASED/terminal exit0を確認。`.local/native-current-lock-retry.cjs` は待機/読取だけで、追加入力なしにstatusが回復保存済みへ戻り、警告解除/41文字不変を確認。保存ファイルは別ZIP decodeで元37文字、draft41文字。2書体/14・24pt/部分太字/縦方向/目安10/自動間隔・太さを保持。
- PASS: 試験app/WebView2/9228不在確認後に引数なし再起動。空のNew画面→明示回復で41文字、混在サイズ/Yomogi/太字の実tokenを確認。独立read-only `.local/native-current-files.mjs retry-restart` でも本文・書式・全ページ/continuationの文字数/自動罫線を照合。元ファイルを変更していない。
- PASS: 各起動console Errors0/Warnings0。失敗、成功、再起動回復の3画像を全て親が目視、root/screensへ保存。cleanup close_appの応答切断だけで終了成功とせず、全4 app/WebView2 PIDとlistenerのHost不在を確認。既知OS-close拒否の経路は未使用/未変更。

製品コード変更なし、既存290件差分を保持。これは現行アプリの一時排他失敗と自動再試行の限定合格であり、停電、実ディスク満杯、多重実行、OS保存先選択成功、OS終了guard、実IME、PDF/印刷経路の合格ではない。全358JS/check/12Rustの前節結果はコード同版の証拠として保持し、今回再実行したとは称さない。

Actual exclusive-lock failure, unchanged edited contents, idle retry after release, original-file protection and explicit 41-character recovery after a process restart passed on the current BKC Windows/WebView2 build. The archive decoder also verified mixed formatting and rule/count settings. All three captures were inspected; four QA PIDs and the loopback listener were absent after cleanup. Broader OS/fault and output gates remain separate.

## BKC現行版Windows保存・再起動回復（2026-10-02、14:53–14:58 JST）

同じ実行中build session62578のterminal exit0を観測。debug buildは9m19sで完了し、既存QA identifier/no-bundle/no-signを維持。最新frontend `index-BKCcvAG_.js`（SHA256 `01B47E40EA7FA45B198561D349FD66586B050C0AEA3C0BFF545FE4128AB9D482`）を埋め込むコピーを新 `.local/native-current-save-20261002` へ作成。QA EXE SHA256 `464E46FD27C08DACC7AD7B16B2D6468AC37A31AFE8B7BF65DCDDC1C348B7C2A2`。通常release/installerと以前のQA rootsは保持。

| 実機観測 | 初回の合成ファイル起動 | 引数なし再起動→明示回復 |
| --- | ---: | ---: |
| QA app PID | 56060 | 48820 |
| WebView2 127.0.0.1:9228 PID | 69756 | 27480 |
| WebView2親PID | 56060 | 48820 |

- PASS: 専用exe path、identifier、loopback listener/親PIDをHostとWebView2双方で観測。両起動ともdocument.scriptsがBKC現行bundle。接続初回は起動前ECONNREFUSEDだったため、同launch session52661の完了と実listenerを確認してから接続し直した。アプリ重複起動なし。
- PASS: 既存mixed-prepareを実UIで通し、横/縦、2書体、14/24pt、部分太字、目安10文字、自動間隔/太さ、混在欄の空表示→逐次14入力、他書式維持、Undo1回を確認。glyphが行帯四辺から出る数0、各方向5行。partial選択はDOM Rangeを使用し、実マウス選択の試験と称さない。
- PASS: 元の37文字均一14ptファイルは自動保存では変わらず、draftだけ混在/縦/文字数/自動罫線になることをread-only ZIP展開で独立確認。UI「保存」後はmanualとdraft project全体が一致。2文字追記後は元ファイル37文字、draft39文字で書式維持、New未保存確認キャンセルで本文保持。
- PASS: 初回app/WebView2/portの不在確認後に引数なし再起動。空のNew画面→明示回復で39文字、14/24pt、Yomogi/太字、縦方向、目安10、自動罫線2設定を確認。別ファイルverifierのrestart段階もPASS。両起動console Errors0/Warnings0、prepareのpageErrors空。
- PASS: 横/縦編集、保存直後、追記/キャンセル、再起動回復の5画像を全て親が目視し、新QA root/screensへ保持。保存直後の画像はbusy overlay中であり保存完了画面証明ではない。保存成功はUI status待機と別project一致を根拠とする。縦紙面の通常スクロールをクリック不能と混同しない。
- PASS: 追加故障境界を含む全43files/358 frontend tests、check/version1.0.4、12 Rust tests。Rustには実Windows排他ロックで原本保持/再試行の単体試験も含む。今回のnativeアプリで排他lock→idle retryの一連操作は未再実行であり、Rust単体と旧UI証拠を混同しない。
- 終了は専用QA cleanupに限定した既存close_app。応答切断のTarget closedだけでは成功とせず、全4 app/WebView2 PIDと9228 listenerのHost不在を確認。OS-close guardの拒否を迂回・権限変更していない。

NOT RUN: OS保存先選択での保存成功、OS-close guard、実停電/容量不足/実IME/同時多重起動、最新BKCのPDF/印刷経路。これらをこの保存確認から推定しない。製品コード/保存方式/形式/依存/権限/version/公開先変更なし、既存290件Git差分を保護。公開/署名/Store/物理印刷なし。

The current BKC frontend passed isolated Windows/WebView2 mixed-format editing, original-versus-recovery file separation, manual saving, cancelled New, blank startup and explicit recovery after a controlled process restart. Both actual archives were independently decoded. All 358 frontend and 12 Rust tests passed. Five captures were inspected; the busy save capture is not used as completion evidence. Current PDF/printing, OS dialog success and close-guard/fault conditions remain separate unverified gates.

## 現版Windows再確認の準備と追加故障境界（2026-10-02、14:51 JST）

前回は警告翻訳のTDD修正と実画面確認で進捗あり。今回、最新BKC frontendを埋め込む既存QA識別子/debug/no-bundle/no-sign buildを開始。観測時点でexec session62578は実行中、rustc61464とその子link58676の生存をHostで確認。観測待ちをbuild完了と扱わず、同handleを次の観測で継続する。旧debug EXEは13:37のものであり、現行QAへコピー・起動していない。通常release/installerは変更していない。

新しい `.local/native-current-save-20261002` に既知の合成ABCDEF fixtureを検査したうえで、37文字の書式試験用文書を新規作成。以前のQA rootsは保持。起動scriptは9228の占有と専用同名processを拒否し、debugでのみ有効な隔離store/WebView2 profile/出力先を設定・復元する。実データやOS設定は使用・変更しない。build完了前の起動はしない。

`tests/session.test.ts` に新文書のdraft、recent-documents、session-currentの各書込み失敗を追加。実SessionPersistenceとDocumentRepositoryを合成Memory storeで通し、容量不足時に前文書の本文/書式を復元でき、失敗を解除すると次の保存と最新参照を再試行できることを確認。限定実行 `npm test -- tests/session.test.ts` は7 tests PASS（追加3ケース）。製品コード変更なし。Memoryの故障注入をOS実容量不足、実停電、原子性の包括証明とは扱わない。追加後の全suiteはまだ再実行していない。

The current isolated debug build is still running at this checkpoint, with its live session and compiler/linker observed. A fresh synthetic root was prepared without reusing a live profile. Three new write-failure/retry boundary tests passed; current-binary Windows replay remains pending and is not inferred from these in-memory tests.

## 混在サイズ入力修正後と出力向き修正後のnative回復（2026-10-02、13時台）

`index-9MYp8P-f.js` / QA copy `95F17B0B42676FA97701395E99AED901C01CA2384AB874036BBE7DDD0919EE7D` を新しい `.local/native-font-mixed-20261002` で確認。実WebView2横/縦、2書体・14/24pt・部分太字、目安10文字/自動罫線2設定で、逐次14入力/他書式保持/Undo1回/実glyph四辺帯内がPASS。native autosaveでは元37文字均一14ptファイル不変、draftのみ混在/縦方向へ更新。UI手動保存で両projectが完全一致。追記後は元ファイル不変・draftだけ39文字、New未保存確認キャンセルで本文保持。実プロセス終了・不在確認・再起動後に空起動→明示回復、混在書式/方向/count/auto保持。別ZIP decodeもPASS。app60072/21060、WebView2 11320/63912、loopback9228/親PID/Runtimeを観測し、全4PID不在確認済み。

続くPDFの目視でreadonly縦英数字の横倒しを発見し、共通Paper描画を修正（保存コード変更なし）。修正版 `index-DLcqMv88.js` / QA copy `8A8D054C964212B64AB49E4880C67ECCC78CC215F33D2EF5D659958E8CC49DD7` を別新root `.local/native-font-upright-20261002` で再起動・明示回復確認。39文字、全run属性/baseStyle/pages/continuation/settingsが元の合成fixtureと一致。実variant追加・削除後には隣接同書式runが圧縮されたため、raw run境界一致とは称さず、本文と全有効token属性一致を別確認。app26512/69680とWebView2 49020/21260の全4PID/9228不在確認済み。詳細は [native出力の最新節](NATIVE-OUTPUT-VALIDATION.md) を参照。

両版の各起動console0、全349JS tests/check/build、12Rust tests PASS（RustはPaper変更前、Rust source変更なし）。制御close_appはcleanupだけでOS終了guard合格ではない。初回保存画面captureはbusy表示中であり完了画面証拠ではなく、手動保存成功は正しいstatus待機と別ファイル解析で確認した。OS保存先選択成功、実停電/容量不足/IME/多重起動は未検証。今回最新Paper版の排他lock試験は再実行しておらず、下記旧版の証拠と分ける。既存差分保護、実データ/保存形式/依存/版番号/公開先変更なし。

Actual isolated WebView2 mixed-format/count/automatic-ruling recovery passed after process restart. Manual file and recovery draft were independently decoded, and autosave did not overwrite the original. The subsequent readonly-renderer fix also passed explicit native recovery. Controlled exits, old lock-test results and untested OS/fault conditions are kept distinct.

## 背景Esc・縦書き送り量修正後のWindows再検証 / Current metrics-fix Windows replay

2026-10-02 12:00–12:08 JST。前ターンは現行全図案/範囲の実操作検証で進捗あり。今回の対象は保存と再起動。Workspace/business-apps/project AGENTSを明示全文読込、Director/Playwrightを利用。`node scripts/native.mjs tauri build --debug --no-bundle --config .local/native-save-qa-20261002.json --no-sign` PASS、Rust dev build 2m27s。同梱production `index-yDVezcP9.js` SHA256 `1C66658B9748C945E7D236C1649B575D1AAE23CE239A44D131997B6F4E4D46A9`。背景Escと縦書きupright ASCII修正を含む。QA copy SHA256 `84046684778B0EC1D0361D32EB5F69EF46230B52F6FF61F86C5EDA663F4EB42D`。通常release exe/installer/10:51 ZIPは更新していない。

既存QA識別子 `jp.ytec.binsen-kobo.qa-save-20261002` を維持し、新規 `.local/native-save-metrics-20261002/` にだけ既知の合成fixture・store・WebView2 profileを作成。元のQA証跡を保持。通常版識別子・保存先・製品コード・保存形式・依存・version1.0.4・権限・OS設定・実データは変更していない。QA debugは非署名/非bundle、installer導入や公開ではない。

| 起動 | 合成既存ファイルから開始 | 空の通常起動→明示回復/履歴 | 再試行後の空起動→明示回復 |
| --- | --- | --- | --- |
| QA app PID | 41336 | 49684 | 50980 |
| loopback9228 WebView2 PID | 63956 | 67072 | 60072 |
| WebView2親PID | 41336 | 49684 | 50980 |

- PASS: 3回とも実WebView2 `document.scripts` が `http://tauri.localhost/assets/index-yDVezcP9.js`。listenerは127.0.0.1:9228、WebView2親PID/専用exe pathを別host実測。WebView2 Runtime `154.0.4258.53`。実効Windows10互換性やClean VM合格へ拡張しない。
- PASS: `native-save-prepare.cjs`、UI「保存」、`native-save-edit-recovery.cjs`。`scripts/verify-native-save-files.mjs` はautosave/manual/recovery各段階で元 `.binsen` とdraftを別展開し独立期待本文と一致。自動保存は元ファイルを保持、手動保存では両方更新、追加編集後はdraftだけ最新。Newの未保存確認をキャンセルして現在本文を保持。
- PASS: 初回app/WebView2/listenerの不在を確認してから再起動。`native-recovery-verify.cjs` は通常起動本文空、明示回復で最新本文一致、現在を保護版に登録、追加編集から保護版へ復元、復元前状態の保護を実UI確認。回復後のnativeファイル照合もPASS。
- PASS: `.local/native-metrics-lock.ps1` で専用draftをFileAccess.Read/FileShare.Noneにより25秒ロック。READYを観測後に `native-all20-lock-failure.cjs` を操作し、実local_write失敗/本文保持を確認。finally解除とlock process terminalを観測。`native-all20-lock-retry.cjs` は追加キー入力なしで再試行成功、警告/alert解除、本文完全一致を確認。
- PASS: `.local/native-metrics-retry-files.mjs` は元ファイルが手動保存時のまま、draftだけ「／Windows再試行」まで保持することをread-onlyで別decode。2回目の制御終了とPID/listener不在確認後に再起動し、`native-all20-retry-restart.cjs` で空の起動→明示回復と最新47文字の完全一致を確認。終了後のread-only照合もPASS。
- PASS: 各起動console Errors0/Warnings0、3つの既存保存/履歴scriptのpageErrors空。7枚の1280×720画像を全て目視し、本文、保存状態、履歴保護、実lock失敗警告と解除を確認。7枚を新QA rootのscreenshotsへ別コピーして保持。本文の英単語途中改行は既存折返し規則であり、用紙全体は通常の縦スクロールに収まる。
- PASS: 今回の親観測 `npm test` 42files/344tests、`npm run check` TS/version1.0.4、frontend build、debug native build、`npm run test:native` 12tests。main540.33kB/gzip178.04kBの500kB警告とprepare時間警告は残る。独立lintコマンドなし。
- 終了は既存 `close_app` を限定QAのcleanup/再起動目的だけで使用し、未保存終了guardの試験とは数えない。closeと同時のCLI `Target page...closed` は応答切断であり、終了成功は全6PID/9228 listener不在の別host観測で確認した。`plugin:window|close` の既知の権限拒否は今回再試行せず、権限追加/別経路で終了guardを迂回していない。
- 初回の保存後status確認をCLIへ直接渡した断片はSyntaxErrorで未実行。UI保存clickの結果は独立ファイルverifier manual段階で確認できたが、失敗したstatus待機を成功扱いしない。後続は読込済みのCJS関数をファイル経由で実行した。製品の保存不具合と判定していない。
- NOT RUN: OS保存先選択/キャンセル、OS閉じるbuttonのguard、実IME、強制終了/停電/実容量不足/多重同時起動。今回nativeのmixed-font/文字数fixtureや最新版PDF/印刷の再確認はまだ別gate。保存コード同版の過去独立所見とこの親実測を分け、独立再実測と称さない。開始時284件の既存Git差分は保持。push/公開/Store/物理印刷は行っていない。

The current metrics-fix frontend passed isolated native/WebView2 manual-versus-recovery file checks, cancelled New, protected history restoration, actual exclusive-lock failure with idle retry, and explicit recovery after two controlled process restarts. All seven captures were inspected; 344 JavaScript tests, type/version checks and 12 Rust tests passed. Controlled exits are cleanup evidence, not OS close-guard acceptance. Current PDF/print and mixed-format native output remain separate gates; no production data or published artifacts changed.

## 日英UI最終修正後のWindows再検証 / Windows replay after final UI fixes

2026-10-02 10:19–10:29 JST。現行frontend `index-DAkWGDAt.js` を埋め込む同じdebug/no-bundle/no-sign buildが完了。QA copy SHA-256 `2507E7F8C3BACB4D98ED5CBF4FC621C4AB6A1F7651994C0DFB2E4D011440D6F0`。既存の専用識別子 `jp.ytec.binsen-kobo.qa-save-20261002` を維持し、新しい `.local/native-save-final-20261002/` に合成fixture/store/WebView2 profileを作成。以前の検証rootは保持した。通常版・実データ・installer・OS設定・権限・保存形式は変更していない。

| 実機観測 | 初回 | 復元/履歴/失敗再試行 | 再試行後の再起動 |
| --- | --- | --- | --- |
| QA app PID | 48588 | 68828 | 69156 |
| loopback 9228 WebView2 PID | 28532 | 13508 | 54244 |
| WebView2親PID | 48588 | 68828 | 69156 |

- PASS: 3回とも実WebView2のdocument.scriptsから `index-DAkWGDAt.js` を確認。再起動前に旧app/debugger/listenerの不在を別途実測。
- PASS: 既存guard付き `native-save-prepare.cjs` → UI「保存」 → `native-save-edit-recovery.cjs` を実操作。read-only verifierのautosave/manual/recovery段階で、元 `.binsen` とdraftを別展開して期待本文を確認。自動保存は元ファイルを上書きしない。Newの未保存確認→キャンセル後も本文保持。
- PASS: `native-recovery-verify.cjs` で通常起動時は本文空、明示回復後は最新本文、保護版からの復元と復元前保護を確認。復元後も実ファイルverifier PASS。
- PASS: 専用draftだけをFileAccess.Read/FileShare.Noneで25秒ロック。保存失敗時の本文保持、finally解除、追加入力なしの自動再試行、alert解除を実操作確認。別decodeでも元ファイルは手動保存時、draftだけ「／Windows再試行」追加後の本文。さらに再起動し、空の通常起動→明示回復でその本文を完全一致確認。
- PASS: 各起動のconsole errors/warnings 0。guard付き保存/復元scriptのpageErrors空。7枚の1280×720画像を全て目視し、本文・状態・履歴保護・失敗警告・警告解除を確認。画像は新QA rootのscreenshotsにも保存。長い用紙は通常の縦スクロールで表示され、本文の英単語途中改行は既存の折返し規則である。
- PASS: `npm test` 41files/341tests、`npm run check`（version1.0.4）、frontend/debug build。製品の保存・復元コード変更なし。今回Rust testの再実行はしておらず、12件PASSは前工程の記録と区別する。
- NOT RUN: `plugin:window|close` は `core:window:allow-close` の権限拒否。追加権限、別経路の回避を行わず、終了guardのAPI試験は中止。API拒否をOS閉じるボタンの不具合と断定しない。既存 `close_app` による制御終了は別のcleanup/再起動経路であり、終了guardの成功ではない。
- 終了後、上表6PIDと9228 listener不在を確認。`close_app` 時のCLI Target closedは応答切断であり、終了成功は別のhost観測で確認した。合成証跡は削除しない。OS保存先選択/キャンセル、強制終了、電源断、実容量不足、複数同時起動の成功へ拡張しない。

The current frontend passed actual isolated Windows/WebView2 staged manual-versus-recovery checks, cancelled New, protected history restore, an exclusive-lock failure followed by idle retry, and explicit recovery after two controlled process restarts. All seven screenshots were inspected; console errors/warnings were zero. A window-close API was denied and was neither enabled nor bypassed; controlled cleanup is not close-guard evidence. Untested OS dialogs, forced termination, power loss, actual disk-full and concurrent instances remain unverified. This parent-operated replay is separate from earlier bounded independent code reviews, not an independent rerun by those reviewers. Latest PDF/print verification remains a separate gate.

## 全改修版Windowsの保存・2回の再起動 / Latest Windows save and two restarts (2026-10-02 JST)

08:51–09:01 JST。`node scripts/native.mjs tauri build --debug --no-bundle --config .local/native-save-qa-20261002.json --no-sign` PASS。frontend `index-OvbCngb2.js` を3回とも実WebView2のdocument.scriptsで確認。検証専用コピー SHA-256 `9C6FE6BD55AAD0428EF788725AFA8E540FD4FBD7D1AF622D9152E16CDAEDD19C`。公開・installer・署名ではない。通常版識別子/保存先は変更せず、QA識別子 `jp.ytec.binsen-kobo.qa-save-20261002` と新しい `.local/native-save-all20-20261002/` の合成文書/store/WebView2 profileを使用。launcherはポート占有時に中止し、process限定envをfinallyで戻す。

| 実機観測 | 初回 | 明示回復・履歴確認 | ロック失敗→再試行後の再起動 |
| --- | --- | --- | --- |
| QA app PID | 54340 | 37296 | 65800 |
| loopback `127.0.0.1:9228` のWebView2 PID | 36880 | 28596 | 69560 |
| debugger親PID | 54340 | 37296 | 65800 |
| 実行ファイル | 専用 `レタリエ-保存検証.exe` | 同じ専用コピー | 同じ専用コピー |

- 初回編集の自動保存後、read-only verifierのautosave段階で元 `.binsen` は初期本文、draftは編集本文。UI「保存」後のmanual段階で両方が手動保存本文。追加編集とNewの未保存確認→キャンセル後のrecovery段階で元ファイルは手動保存本文、draftだけ最新本文。各ファイルをfflateで別展開して照合。
- 初回app/debugger不在を実測して再起動。起動直後の本文は空、新規画面を閉じて明示回復後に最新本文一致。native履歴の保護版を登録、追加編集、保護版へ復元し、復元前の状態も保護済み。3既存guard付きCJSのpageErrors空。
- 合成QA draftだけをFileAccess.Read/FileShare.Noneで25秒ロック。実 `local_write` の失敗で「保存に失敗」/「ファイルを開けません。」を表示、編集本文保持。ロックはfinallyで解除。追加入力なしで自動再試行が成功し、警告/alertが消え、draft最新・元ファイル非上書きを別decodeで確認。
- さらにapp/debugger不在を実測してもう一度再起動。通常起動で本文空のまま、明示回復で「合成保存試験：最初の本文／Windows手動保存／Windows回復専用／Windows再試行」完全一致。再試行書込のプロセス再起動後保持を確認。
- 3回ともconsole errors/warnings 0。7screenshotsを目視、本文・状態・履歴保護・失敗警告・警告解除を確認。今回の画像と以前の4画像をQA rootのscreenshots/prior-screenshotsへ別保存し、旧証跡を保持。
- 終了は既存 `close_app` による制御終了。CLIの「Target page…closed」は終了と同時の応答切断であり、別途全app/debugger PIDと9228 listener不在を確認した。OS閉じるボタンのguard、保存先ダイアログ選択、強制終了、電源断、実容量不足、多重同時起動の成功へ拡張しない。PDF/印刷の最新版確認は別工程に残る。
- 初回ロック検証のCLI直渡しはasync function形式の欠落でSyntaxError、本文操作前に中止。ロック解除を確認、ファイル化した同試験を構文確認して再実行。製品コード/保存形式の修正なし。保存コードの同版43テスト独立レビューは下記であり、この親による実機操作の独立再実測を意味しない。

The latest isolated Windows/WebView2 build passed staged original-versus-recovery file checks, cancelled New, explicit recovery and protected history restore after a real process restart. An actual exclusive read lock on the synthetic draft caused a native save failure; the body remained intact, idle retry succeeded after release, and the retried body survived a second process restart. Separate PID/parent/listener checks identify the native runtime. Controlled exits do not attest to OS close-button guards, file-dialog selection, forced termination, power loss, real disk-full or concurrent-instance safety. Latest PDF/print acceptance remains separate.

## 全20シリーズ追加後の最新版 / Latest all-20-series regression (2026-10-02 JST)

- production `index-OvbCngb2.js` を専用合成profile `letterier-all20-save-oct2` / `letterier-all20-retry-oct2` のdocument.scriptsで確認。
- 実IndexedDBの最新回復、通常起動時は明示回復のみ、復元前保護、復元本文の再読込保持、手動download、破損draft保持、375px破損modal横overflowなし、修復後回復：最終window結果全true、pageErrors空。
- download `output/playwright/save-recovery-synthetic.binsen` を別展開しformat binsen/version2、本文「合成保存試験：最初の本文」、autoSpacing/autoWidth=trueを確認。通常ファイルへの履歴混入なし。
- 実transaction.abortで初回自動保存を失敗させ、追加入力なしの自動再試行成功、警告解除、再読込後の本文完全一致「合成再試行：入力を止めても本文を守る」、375px履歴保護版登録/横overflowなしを確認。最終window結果全true、pageErrors空。
- 両profilesのconsole errors/warnings 0。履歴1280、破損1280/375、再試行失敗1280、回復1280、履歴375の6画像を目視。beforeunloadの途中状態は完了とせず、最終結果を別evalで取得。
- 全41files/316 frontend tests、12Rust、check/version/build PASS。下記同版43テストの独立レビューと区別する。最新版Windowsプロセス再起動/OS保存ダイアログ、実電源断、実容量不足、同時多重起動はNOT RUN。保存コード・形式をこの再検証で変更していない。実利用者データ不使用。

Fresh synthetic profiles verified actual IndexedDB recovery, protected restore, corrupt-draft retention/repair, a decoded v2 manual download and idle retry after an aborted transaction on the latest bundle. Both consoles were clean and six screenshots were inspected. Browser reload is not evidence of native process restart, power-loss, real disk-full or concurrent-instance safety.

## 保存・復元の限定独立レビュー / Bounded save review (2026-10-02 JST)

assignment FINAL-SAVE-20261002-C、正規担当 Sartre / 01a0f9cf-8ea6-77b2-8ad0-5858b9b3cb63。保存・復元の9filesを同版で読取専用レビューし、3 files / 43 tests PASS、実不具合の指摘なし。親が開始版・終了版・結果本文の全9 SHA-256を機械比較し一致を確認。同IDの完了waitとclose応答を受領。実効modelとHost不在の独立証明はUNVERIFIED。Windows実機、実電源断、容量不足、多重起動の合格を意味しない。保存コード・保存形式の変更なし。

The independent bounded review found no concrete defects within its nine-file scope; all 43 synthetic save/fault/evidence tests passed. Parent-side hash comparison matched the same revision. Native process restart/dialog and untested fault conditions remain separate acceptance gates.

| File | SHA-256 |
| --- | --- |
| `src/ui/useDocumentFiles.ts` | `5EAAEC20780A632F69E29535146C44B3EAEB162B5A81A6F510F0D952DF75EC7D` |
| `src/persistence/platform.ts` | `AE9778730C42AAE8F7287CAF28471D73059C089FFB2A979B468076D598D6C2E9` |
| `src/persistence/session.ts` | `95DB0F1F17B3449EEA6DE3F404BBA3CA196EA129D2230FA4D5A75DCF0C92CD28` |
| `src/persistence/repository.ts` | `A0C9DD2A9AF9CA0FBFE5C6396DF212789DFD7D745BE32F8CE9DA2156D6A0237A` |
| `src/core/archive.ts` | `400567EFD96F692C469B97DC4069C3F9EC0FC5215225117B487DB1593B8262B1` |
| `tests/document-files.test.ts` | `B997E5A46B9486E6E1C5AE68D903EB7A3C61AA3B54B90E2CABEBC761077C3BD2` |
| `tests/persistence-faults.test.ts` | `E46E1146140812E6FEE137FB7037F2232C6B84BCE25CCC35020FD7D14862E18F` |
| `tests/native-save-evidence.test.ts` | `196E133DBE3C4D4550A7E625DD81FB521D8BE75FC9D30303DF795BC6D8876012` |
| `scripts/verify-native-save-files.mjs` | `CF16B7D8DABCC349A2CFD2EF81083A29B2F67C6A3E1B78B754064657154A8317` |

## 和紙・市松追加後 / Japanese all-season save regression (2026-10-02 JST)

- 専用3browserをcloseし、CLI一覧no browsers、PID47060/49248/64532不在を確認。既存preview PID61860は保持。git diff --check PASS（CRLF通知のみ）、開始時既存差分/tmp保護、commit/push/公開なし。

- 最新production index-BOK9f4YX.jsを新しい合成専用profile letterier-perennial-save-oct2とletterier-perennial-retry-oct2のdocument.scriptsで確認。実IndexedDB最新回復、通常起動時は明示回復のみ、履歴復元前保護、復元後再読込保持、手動download、破損draft非上書き/finally修復後回復、375破損modal横overflowなしの最終window結果が全true、pageErrors空。
- 手動downloadをfflateで別展開し、format binsen/version2、本文「合成保存試験：最初の本文」、autoSpacing/autoWidth=trueを確認。
- 実transaction.abortで初回失敗後、追加入力なし1回成功、警告解除、再読込後本文完全一致、375履歴保護版登録/横overflowなしも最終window結果全true。両profile console errors/warnings 0。履歴/破損/失敗/再試行後の6画像を目視。実利用者データ不使用。
- CLIがbeforeunload modal状態を返した時点は完了とせず、別evalで最終結果を再取得。保存側の追加dialog-acceptは既にmodalが解消済みでErrorになったが、最終結果と本文・downloadの検証は成功。製品修正は行っていない。
- 303frontend/12Rust、check/version/build PASS。保存productionコード/形式は今回変更なし。最新Windowsプロセス再起動/OS保存ダイアログ、実電源断、実容量不足、複数同時起動はNOT RUN。ブラウザーの合格をそれらへ拡張しない。

Both fresh synthetic profiles confirmed the latest loaded bundle. Actual IndexedDB recovery, protected history restore, corrupt-draft retention/repair, a decoded v2 download, and idle retry after a real aborted transaction passed. Six screenshots were inspected and no page or console errors/warnings were observed. Final results were queried separately after transient beforeunload observations. Latest native restart/dialog, power-loss, real disk-full and simultaneous-instance behavior remain unverified.

## 追加依頼に対する重点確認 / Requested save-safety emphasis (2026-10-02 JST)

ユーザーの追加依頼により、自動保存と復元を最終受入の重点項目として維持する。実利用者データは使わず、元ファイルと回復データを別々に検査する。最新ビルドでのWindows保存・プロセス再起動は、ブラウザー再読込やmockの合格で代替しない。

- 08:05 JST: `npx --no-install vitest run tests/document-files.test.ts tests/persistence-faults.test.ts tests/native-save-evidence.test.ts --maxWorkers=2` を実行し、3 files / 43 tests PASS。保存処理・保存形式はこの再確認で変更していない。
- 対象: 自動保存の遅延と古いtimer取消、同一/別文書の旧保存処理との競合、書込段階別失敗、有限再試行、手動保存の失敗/取消、元ファイル非上書き、破損回復データ、復元前保護と50世代超の履歴整理、復元後の再読込に関する既存回帰。
- 残る最終確認: 全改修を含む最新版での実ブラウザー保存/復元/失敗後再試行と、専用Windows QA profileでの保存/プロセス再起動。実電源断、実容量不足、複数同時起動等は実施の証拠がない限り未確認とする。

Autosave and recovery remain explicit final-acceptance priorities. The three existing save/fault/evidence suites passed all 43 tests again with synthetic data. This is not a new native-app restart test. Final browser and dedicated Windows QA checks must identify their actual tested build; untested power-loss, real disk-full and concurrent-instance conditions must stay unverified.

## 冬図案追加時の保存確認 / Western Winter save regression (2026-10-02 JST)

- 確認専用5profilesをclose済み、CLI一覧no browsers。PID54736/67004/52876/45336/44220不在、既存preview PID61860を保持。git diff --check PASS、既存差分/tmpは保持。commit/push/公開なし。


- 最新Bi6T2RUl.jsの別合成profile `letterier-winter-retry-oct2`で実transaction.abortを注入。初回失敗→追加入力なし1回成功→警告解除→再読込後本文完全一致、375px履歴保護登録/横overflowなしの最終結果すべてtrue。保存/再試行profile console errors/warnings 0、破損・履歴・再試行前後の計6画像を目視。
- 同latest上でunsaved-promptを直列再実行し取消本文保持・破棄後空文書・375横overflowなし/pageerror空。ruling設定3文字ごとに3行、自動spacing/width、背景mouse drag/resize/fit/applyもPASS。先行bundle結果とは分けた最新版追加確認。
- 独立review WINTER-WESTERN-SAVE-20261002（Anscombe、01a0f9a6-39ed-7a92-9737-8ff0d279f51e）は保存browser2filesを含む27限定files/48tests/6syntax PASS。初回hash JSON誤りを同担当の独立再計算で補正し、親の正本現hash27件一致、同ID完了wait/close済。実効model UNKNOWN、Host不在独立証明なし。native/保存production全体の独立再試験ではない。

- 最新production `index-Bi6T2RUl.js`を新規合成profile `letterier-winter-final-save-oct2`のdocument.scriptsで確認。実IndexedDB最新編集保存、明示回復のみ、履歴復元前保護、復元本文再読込保持、手動download、破損draft非上書き、finally修復後の回復が最終window結果ですべてtrue、pageErrors空。
- 手動downloadをfflateで実展開しformat binsen/version2、本文「合成保存試験：最初の本文」、autoSpacing/autoWidth=trueを確認。
- `save-recovery.cjs`に375px破損modalの横overflow・2buttons・screenshot検査を追加し実操作PASS、履歴1280と破損375画像を目視。
- 同工程前半のC1Zxv-vn.jsでは `unsaved-prompt.cjs`の現UI対応更新後、375pxの取消で本文完全保持、保存しないで空の新規文書、modal横overflowなしを実操作PASS。画像も目視。これはBi6T2RUlでの再実行とは区別する。背景drag/resize/fit/applyも前半bundleでPASS。
- 保存productionロジックの追加変更なし。全295frontendと12Rust PASS。初回frontend3件時間制限超過を再実行で295 PASS、maxWorkers=2でも295 PASSと区別して記録。
- 最新Windows保存ダイアログ/プロセス再起動、電源断、実容量不足、同時起動はNOT RUN。独立reviewとlatest idle-retry最終結果は本節冒頭に追記。配布完了判定ではない。

Actual recovery, protected history restore, corrupted-draft preservation/repair, decoded v2 download, and 375px corrupt-dialog checks passed on the latest production bundle with synthetic data. Unsaved cancel/discard and background gestures passed on the preceding bundle. Latest native restart/dialog and power-loss/disk-full/multiple-instance tests remain NOT RUN.


## 秋図案・保存ボタン翻訳修正後の再検証 / Autumn and Save-label regression (2026-10-02 JST)

- 確認専用4browserはclose済み、CLI一覧no browsers。保存profile PID32360/63748/21748は不在を確認。既存preview PID61860/port1421は保持し、既存diff/tmpは削除しない。commit/push/公開なし。

- 保存関連3files/43testsと翻訳20testsを再実行しPASS。全体41files/291tests、check/version/build、Rust12testsもPASS。今回、保存・復元ロジックへの追加変更はない。
- 最新production bundle `index-C1Zxv-vn.js`を、新規合成profile `letterier-autumn-final-save-oct2` / `letterier-autumn-retry-oct2`でdocument.scriptsから確認。途中の`index-C4Q6vpbr.js`でも別profileで保存フローが通ったが、以下の最新版結果とは区別する。
- 実IndexedDBで最新編集保存、空の新規起動からの明示回復、履歴復元前の保護版、復元本文の再読込、手動download、破損draftの非上書き、finallyによる元bytes修復後の明示回復をすべて操作確認。最終window結果の各フラグtrue、pageErrors空。
- 手動downloadをfflateで展開し、version2、本文「合成保存試験：最初の本文」、autoSpacing/autoWidth=trueを確認。
- 実transaction.abortを注入した初回失敗後、追加入力なしで1回再試行成功、警告解除、再読込後の本文一致、375px履歴の横はみ出しなしと保護版登録を確認。最終各フラグtrue、pageErrors空。
- 保存履歴・破損通知・再試行前後・375px履歴の5スクリーンショットを目視。両最新profile console error/warning 0。実利用者データは使用しない。
- 保存ボタンの英語表示漏れを限定修正（▣ Save / ▱ Copy / Save (Ctrl+S)）。翻訳再現テストは3 REDから20 PASS、日英切替・375px・キーボードタブ移動の実操作もPASS。独立レビューAUTUMN-RIBBON-20261002は指定4ファイルPASS、独立hash再計算と親比較一致、同ID完了wait/close済み。実効モデルUNKNOWN、Host不在は独立証明なし。
- Windows実保存ダイアログ・プロセス再起動、電源断、実ディスク容量不足、同時起動の追加試験はNOT RUN。ブラウザー再読込／downloadの合格をそれらへ拡張しない。配布完了判定ではない。

Actual IndexedDB recovery/history preservation, corrupt-draft retention and repair, a decoded v2 manual download, and idle retry after a real aborted transaction passed in fresh profiles on the latest bundle. Five screenshots were inspected and no page or console errors/warnings were observed. Save-button translation passed regression and bounded independent review. Browser reload/download is not proof of latest native dialog/restart, power-loss, disk-full, or simultaneous-instance behavior; these remain NOT RUN.

## 夏図案追加後の再検証 / After Western Summer additions (2026-10-02 JST)

- 最新production bundle `index-B5VGzpEm.js`を別々の新規合成profile `letterier-summer-save-oct2` / `letterier-summer-retry-oct2`で実際に読み込んだことをdocument.scriptsで確認。
- `save-recovery.cjs`: 実IndexedDBに最新編集を保存→起動は空の新規画面→明示回復、保護版作成、履歴復元と復元前の保護、復元本文の再読込、手動download、破損draft非上書き、finallyで元bytes復旧後の明示回復をすべて確認。windowの最終結果は全true、pageErrors空。
- download `.binsen`をfflateで展開し、format binsen/version2、本文「合成保存試験：最初の本文」、自動罫線設定保持を確認。
- `autosave-retry.cjs`: 実transaction.abortによる初回失敗・警告→追加入力なしで1回再試行成功・警告解除→再読込後の本文完全一致、375px履歴横はみ出しなし／保護版作成を確認。最終結果は全true、pageErrors空。
- 保存履歴／破損通知／再試行前後の1280×720と履歴375pxの5スクリーンショットを目視。両profile console errors/warnings 0。PID20748/65552をclose後に不在確認。実利用者データは使っていない。
- 保存関連3files/43testsは同工程前半でPASS、最終全体283tests/check/build、Rust12testsもPASS。Windows合成保存ファイルのcheckerは既存証跡の読み取り再確認のみで、最新bundleでWindowsアプリを再起動した保存実操作ではない。
- 最新Windows OSファイルダイアログ、強制終了／電源断、実ディスク容量不足、同時起動の追加実機試験はNOT RUN。Browserの合格をそれらへ拡張しない。既存diffとtmpは保護し、公開・pushは行わない。

The latest production bundle was verified in two fresh synthetic browser profiles. Actual IndexedDB recovery, protected pre-restore state, persistence after reload, corrupt-draft preservation and repair, a decoded v2 manual download, and an idle retry after a real aborted transaction all passed. Five screenshots were inspected; no page or console errors/warnings were observed. Both dedicated browsers were closed and their PIDs were absent. Rust tests passed, but existing native-file evidence was only rechecked read-only: latest Windows dialog/restart, power-loss, disk-full, and simultaneous-instance tests were not rerun.

検証日: 2026-10-02（日本時間）。対象は 1.0.4 の作業中差分。リリース完了判定ではありません。
Date: 2026-10-02 JST. Scope: work-in-progress changes to 1.0.4, not release approval.

## 修正 / Fixes

- **復元前の状態の保護**: 通常履歴として保存され、後の50世代整理で失われる状態を再現して修正。復元前を保護版にし、既に付けた利用者の名前は維持。55回の編集・再読込・バックアップ移送後も残ることを確認。
- **終了確認の登録切れ**: native close listener が busy/ready の変更ごとに非同期再登録される隙間を再現して修正。登録は維持し、最新状態を refs で読む。処理中の終了と、処理後のキャンセルを回帰テストで確認。
- Protected pre-restore revisions now survive ordinary 50-generation pruning; existing user labels remain intact. Verified after 55 edits, repository reopen and backup transfer.
- The native close guard stays registered across busy/ready renders. A regression test reproduces the previous unguarded interval and verifies busy-close prevention and subsequent cancellation. This is a mocked native boundary, not a WebView2 UI result.
- **自動保存の有限再試行**: 初回失敗後、入力を止めても5秒・15秒・30秒後に最大3回再試行。編集・文書切替・unmount 時は取消。失敗が続く場合は警告を保持し、無限書込しない。元ファイルへの自動保存は追加していない。
- **遅延失敗の隔離**: 古い文書／同一IDの旧版で実行中の保存が遅れて失敗しても、新しい画面に失敗状態を表示しない。独立レビューのF01を2つのREDテストで再現して修正。
- **警告の所有範囲**: 自動保存専用の警告を設け、再試行成功時はそれだけ解除。別の手動操作のエラーを消さない。
- **履歴の狭幅表示・英語文言**: 375pxで358pxのscrollWidthが335pxのmodal内幅を超える問題を実ブラウザーで再現。700px以下を1列にし、保護版作成・プレビュー・復元を日英で確認。履歴操作の未翻訳10項目も補完。
- Bounded automatic retries now run after 5, 15 and 30 seconds, even without more typing. Editing, document switching and unmount cancel old retries; persistent failure remains visible after at most four attempts. Original files are still never autosaved.
- Late failures from old document versions no longer contaminate the current status. Autosave warnings have separate ownership and clear on success without clearing manual-operation errors.
- History now uses one column on narrow screens, and its missing English control/help text is translated. Browser operations verified both languages.

## 実行結果 / Results

| 状態 | 確認対象 / Scope | 証拠 / Evidence |
| --- | --- | --- |
| PASS | 全体回帰 / Whole frontend suite | `npm test`: 40 files / 253 tests（追加3件を含む / including three added evidence-checker tests） |
| PASS | 型・版番号・build・差分空白 / Types, version, build, whitespace | `npm run check`, `npm run build`, `git diff --check`（CRLF通知のみ / CRLF notices only） |
| PASS | draft/recent/pointer の各書込失敗、同一/別文書、直列保存、再試行 / Write-stage failures, ordering, retry | `tests/persistence-faults.test.ts`: 実際の repository/session と合成 fault store / real repository/session with synthetic fault store |
| PASS | 壊れた pointer/draft/recent、ID不一致、復元前保存失敗、バックアップ読込の各段階失敗 / Corruption, ID mismatch, pre-restore failures, import failures | 同テスト。既存本文・索引維持と明示再試行を確認 / Existing body/index preservation and explicit retry |
| PASS | 自動保存1.8秒境界、古い timer 取消、元ファイル非上書き、Save失敗/キャンセル、切替/終了防止 / Autosave timing, timer cleanup, manual save boundaries | `tests/document-files.test.ts`: 実 persistence、React/native 境界は mock / Real persistence, mocked React/native boundaries |
| PASS | idle retry、永久失敗時の4回上限、同一/別IDの遅延失敗隔離、他のエラー保持 / Retry bounds, late failures and error ownership | `tests/document-files.test.ts`: 21 tests。fake timer＋実際の session/repository/archive / Fake timers with actual persistence and archive code |
| PASS | 実 IndexedDB transaction abort→追加入力なし再試行→再読込回復、成功時警告解除 / Actual transaction abort and idle recovery | `tests/browser/autosave-retry.cjs`, `letterier-retry-fixed-oct2` profile。初回書込失敗＋1回の成功、pageerror 0、console error/warning 0 / First attempt failed, second succeeded, no page/console errors |
| PASS | 実 IndexedDB に保存→再読込→明示回復、履歴復元→再読込、保護版、手動 download / Actual browser recovery and history flow | `tests/browser/save-recovery.cjs`, 専用 `letterier-save-oct2` profile, local production preview `127.0.0.1:1421` |
| PASS | 壊れた合成 draft の警告・非上書き・元 bytes 復旧後の回復 / Corrupt synthetic draft retention and repair | 同 browser script。実利用者データを使用せず、変更した bytes は finally で戻した / Synthetic data only, bytes restored in finally |
| PASS | 手動保存ファイルの実内容 / Downloaded archive contents | `output/playwright/save-recovery-synthetic.binsen` を fflate で展開。本文「合成保存試験：最初の本文」、v2、基準書式・罫線を確認 / Decoded archive contains the restored body and v2 formatting/rulings |
| PASS | 1280×720 実画面・操作 / Browser UI | `output/playwright/save-recovery-{history,corrupt}-1280.png` を目視。履歴選択・復元・保存を実操作。pageerror 0 / Screenshots inspected, flows operated, no page errors |
| PASS | 日英1280/375の履歴プレビュー・保護版作成・英語復元、Escで閉じる / Bilingual history UI | `tests/browser/history-language.cjs`。4 screenshots を目視、pageerror 0。狭幅のpreview内部には紙面用scrollがあり、modalの横はみ出しはなし / Four screenshots inspected, no page errors; intentional preview scrolling is not modal overflow |
| PASS | 独立の読取レビュー / Independent read-only review | 初回で遅延失敗F01と警告残存を検出し修正。同版の2回目レビューはFAILなし。下記WARNは残る / First review found issues; second review of corrected fixed hashes found no FAIL |

ブラウザー再読込は Windows プロセス終了・再起動の代替ではありません。手動 download も Windows ファイル保存ダイアログの代替ではありません。テスト実行時の beforeunload は明示 accept。Playwright CLI がその時点で先に返ることがあるため、最終結果 `window.__letterierSaveRecoveryQA` を別の eval で確認しました。初回は二つある「閉じる」の strict locator で中断し、`.first()` に絞って専用の新しい profile で再実行しています。

Browser reload does not prove Windows process restart behavior; downloads do not prove native dialogs or filesystem writes. The script explicitly accepts beforeunload. Because the CLI may yield at that dialog, completion was verified separately through `window.__letterierSaveRecoveryQA`. An initial ambiguous Close locator was corrected and the flow rerun in a fresh dedicated profile.

## 残る制約 / Remaining limits

- **WARN**: 有限retryで保存領域の故障を直せる保証はない。初回＋3再試行が失敗した後は次の編集・手動保存等が必要。実ディスク不足、OS強制終了の条件では未確認。
- **WARN**: snapshot/backup import の blob 書込成功後に索引保存が失敗すると、未索引 blob が残り得る。既存履歴の保持・再試行を確認したが、完全 rollback・不要 blob 清掃は未保証。
- **WARN**: Rust `atomic_save` の最後の hash 確認と置換の間に、外部アプリとの競合窓が残る。通常の外部変更検出テストは、この非常に短い競合窓の不存在を証明しない。
- **NOT RUN**: OSの閉じるボタン経由の終了確認、Windows保存先ダイアログでのSave as/キャンセル、ディスク不足、外部同時保存、複数起動、電源断。375pxの破損回復・未保存確認画面は今回未確認。実nativeの既存tokenによるSave・通常プロセス終了／再起動・履歴復元は下記追記の限定範囲で確認。
- **WARN**: Bounded retries cannot repair storage failure. After all four attempts fail, a later edit or manual operation is needed. Actual disk-full and forced OS termination remain untested.
- **WARN**: Index-write failure after blob writes can leave unindexed blobs. Preservation and retry are covered, complete rollback/cleanup is not.
- **WARN**: Native atomic save still has a final-check-to-replacement race against other processes.
- **NOT RUN**: OS close-button guard, native Save-as/cancellation dialogs, disk-full/concurrent-instance/power-loss scenarios; corrupt-recovery and unsaved-change screens at 375px. Existing-token native Save, controlled exit/restart and history restore were checked within the bounded scope below.

## 独立レビューの範囲 / Review binding

Planck `01a0f89f-7c7c-7a80-8c7a-ecf66276b5b3` は旧候補のF01を指摘。修正後はAmpere `01a0f8a7-28c1-7682-8d23-dddcba7de96b` が次の正本hash一致を確認してPASS/WARNを返しました。両担当とも同IDのwaitでcompletedを受領後にnative closeし、モデル実効値はUNKNOWN。親だけがwriterです。後から追加したi18n辞書・browser script・説明文は親のテスト/実画面確認であり、4ファイルの独立レビューへ含めません。

The first reviewer found F01. The second reviewed the following corrected hashes; both were received with targeted waits and then closed. Effective model identity is UNKNOWN. Later translation, browser-script and documentation additions are parent-verified, not part of this four-file review.

| File | SHA-256 |
| --- | --- |
| `src/ui/useDocumentFiles.ts` | `5EAAEC20780A632F69E29535146C44B3EAEB162B5A81A6F510F0D952DF75EC7D` |
| `tests/document-files.test.ts` | `B997E5A46B9486E6E1C5AE68D903EB7A3C61AA3B54B90E2CABEBC761077C3BD2` |
| `src/ui/App.tsx` | `6DC39301C27E1A0120D47C85715A1EDD64F8F0BD73B24FD017E61058D10E2FF2` |
| `src/ui/app.css` | `5C917C5EBFE2CC074E7A58FF6FDBD571D06C0919B35636A1284C96CCDB390010` |

通常履歴だけで重要な原稿の保護を保証しません。名前を付けたファイルと別媒体のバックアップを維持してください。検証は保存形式の変更・実データ移行・公開・push を含みません。開始時の既存未追跡 `tmp/` は変更していません。
Keep named files and backups on separate media. No format migration, real-data migration, publication or push was performed; the pre-existing untracked `tmp/` was untouched.

## Windows実機の追加確認 / Additional Windows evidence

2026-10-02 JST。インストーラー・署名・配布ではなく、`tauri build --debug --no-bundle` の検証専用コピー。通常版の識別子と権限は変更していません。`.local/native-save-qa-20261002.json` で識別子を `jp.ytec.binsen-kobo.qa-save-20261002`、main windowを1280×720・非表示に限定。`BINSEN_QA_DATA` と `WEBVIEW2_USER_DATA_FOLDER` はプロセス起動時だけ専用 `.local/native-save-qa-20261002/` に設定し、親shellの値はfinallyで戻しました。合成の `.binsen` を別コピーして使用し、既存 `tmp/` は不使用。

This is a hidden, unbundled debug QA copy, not a release or installer. The QA-only identifier, recovery root and WebView2 profile are separate; production identity/capabilities remain unchanged. Only synthetic copied documents were used.

実機性はbrowser scriptのbooleanだけで判断しません。2回目の確認では、Windowsの実プロセス情報とloopback debuggerを別途確認しました。

| 観測 / Observation | 起動 / Before exit | 再起動 / After restart |
| --- | --- | --- |
| QA app PID | 59040 | 61416 |
| 実行ファイル / Executable | 専用 `レタリエ-保存検証.exe` と一致 / Dedicated copy matched | 同じコピー / Same copy |
| debugger owner | `msedgewebview2.exe`, PID 15016 | `msedgewebview2.exe`, PID 24344 |
| debugger parent PID | 59040（QA app一致 / matched） | 61416（QA app一致 / matched） |
| listener | `127.0.0.1:9228` | `127.0.0.1:9228` |

QA binary SHA-256: `108A6949561EE7C0C0B14292092954FD267DCAB5A2116547AAE9674B98FFC3EF`。旧PID59040とdebuggerが消えたことを確認してから61416を起動。終了は既存の `close_app` commandによる制御終了であり、OSの閉じるボタン／未保存終了確認／強制終了／電源断の証明ではありません。

The old app process and debugger were observed absent before the new process started. Controlled `close_app` exit does not attest to the OS close-button guard, forced termination or power-loss recovery.

| 状態 | 追加確認 / Added check | 証拠 / Evidence |
| --- | --- | --- |
| PASS | 実native回復書込と元ファイル非上書き / Recovery write without original overwrite | `native-save-prepare.cjs`＋`verify-native-save-files.mjs --stage autosave`。`.binsen`は初期本文、draftは手動保存前の編集本文 / Original and draft archives decoded separately |
| PASS | 既存tokenでの手動保存 / Manual Save with existing file grant | UIの「保存」後、`--stage manual`で元ファイルとdraftの両方が編集本文 / Both actual files contain the manually saved body |
| PASS | 追加編集の自動保存、新規作成キャンセル / Recovery-only edit and cancelled New | `native-save-edit-recovery.cjs`。`--stage recovery`で元ファイルは手動保存時、draftは最新本文 / Original retained, draft latest |
| PASS | 実プロセス再起動後の明示回復 / Explicit recovery after process restart | 上記PID観測＋`native-recovery-verify.cjs`。起動直後は空、新規画面を閉じて明示回復すると最新本文 / Blank until explicit recovery, then latest body |
| PASS | native保存履歴での保護版・復元前保護 / Native history and pre-restore protection | 同script。後続編集を保護版へ戻し、復元前の版が残る。復元後も`--stage recovery` PASS / Restored body and protected previous revision retained |
| PASS | 実Windows filesystemの失敗時保護 / Filesystem failure protection | `npm run test:native`: 12 tests。追加3件は一時ディレクトリ内で外部削除・directory target・Windows exclusive lock／解除後retry / Synthetic filesystem tests, not dialog tests |
| PASS | 保存証跡の誤成功を拒否 / Reject false file-evidence success | `tests/native-save-evidence.test.ts`: 3 tests。元ファイルの意図しない更新、古いdraft、不正pointerを拒否 / Unexpected original update, stale draft and invalid pointer rejected |

1280×720の `native-save-autosave-1280.png`、`native-save-new-cancelled-1280.png`、`native-recovery-restarted-1280.png`、`native-recovery-history-1280.png` は `output/playwright/`。前三画面と履歴一覧を目視し、本文・状態表示・保護ラベルを確認。回復・履歴scriptのpageerrorは0。通常版を起動・インストールせず、検証用の位置設定ファイルがQA識別子側に作られることも確認。

The screenshots were inspected, not used as a substitute for actual operations. UI scripts report boundary identifier and UI observations; the read-only file verifier reports decoded synthetic archives only. Neither independently proves a genuine runtime or process restart: those require the separate host observations above.

**初回の独立レビュー**はGalileo `01a0f8c2-6971-7502-8d50-a99aac9ff715`。Rust追加テストPASS、browser script単体のnative証明にはFAIL。指摘に従い、編集前の専用識別子・fixture確認、無条件 `actualWebView2` 宣言の除去、read-onlyの実ファイル証跡検証を追加。修正版を専用の2回目fixtureで再実行しました。script単体へhost証拠を混入させず、単体レビューと親の実機観測を分離します。

**初回の実行中断**: `plugin:window|close` が `core:window:allow-close` 未許可で拒否されました。製品権限を追加せず、この経路の検証は中止。その後のNewキャンセルと制御終了は異なる検証であり、拒否されたwindow-closeの成功へ格上げしません。最初は文書名「新しい手紙」のボタンをNew操作と取り違えたため待機timeoutも発生し、実snapshotに基づく「新規作成」→「この便箋で新しい手紙」に修正して再実行しました。非表示WebView2でdialogの名前locatorが一致しなかった箇所は、実headingを含むdialogへ限定しています。製品のaccessible nameが正常である証明とはしません。

The first review rejected scripts as standalone native proof; their guarded rerun is combined only with separate host/file evidence. A denied window-close API was not enabled or counted as tested. Initial selector mistakes and a hidden-WebView2 dialog-name locator limitation were corrected in the QA scripts, not represented as product fixes.

修正版の独立担当Chandrasekhar `01a0f8cc-5cfe-7de0-8c22-bed52ad93826` は限定読取レビューPASS／証明範囲WARN。6コード・テストファイルと説明のレビュー候補版（この追記前の文書hash `E85626A7061914028FBE2461824E25649A095D04FD26531FF160FEF182BA1D3B`）を確認。Rust hashの転記欠落1文字は同担当が再実測し、親の64文字hashと一致して判定維持。両担当は同IDのcompleted wait受領後にclose済み。実効モデルUNKNOWN、親だけがwriter。host/PIDや実機操作は担当による独立再実測ではなく親の証拠です。この完了記録と集計更新は親の追記で、候補文書版の独立レビューと区別します。

最終集計: frontend 40 files / 253 tests PASS、Rust 12 tests PASS、check/version PASS、frontend build PASS、debug QA native build PASS、diff whitespace PASS（CRLF通知のみ）。500kB超chunk警告は残ります。最後のQA PID61416と9228 listener不在を確認して終了し、合成手紙・検証EXE・profile・証跡は削除せず保持しました。製品挙動・保存形式の変更は今回なく、Rustの変更はtest-onlyです。

The second read-only review passed its bounded scope with explicit warnings. Its six code/test hashes were unchanged; the reviewed document revision predates this parent-written completion note. Both reviewers were received through targeted completed waits and then closed. Host observations were not independently rerun by reviewers. Final suites/check/build passed, with the existing chunk-size warning. The dedicated app/debugger stopped; synthetic evidence was retained.

Native file evidence can be rechecked read-only after the run:

```powershell
node scripts/verify-native-save-files.mjs --root .local/native-save-qa-20261002 --file manual-round2.binsen --stage recovery
```

再実行には専用QA build/config・合成文書・専用profile・host process確認が前提です。browser scriptだけを通常版へ接続せず、`autosave`→UI「保存」→`manual`→追加編集→`recovery` の各段階を別々に検証します。旧PID/debugger不在と新PID/実行ファイル/実WebView2 parentを確認してから再起動後scriptへ進みます。`.local`のQA設定・launcher・EXEはローカル証跡であり、Gitに含まれる正式な配布手順ではありません。

Do not run these UI scripts against the normal application. Reproduction requires the isolated QA build, synthetic fixture, profile, host-process checks and staged file verification; local `.local` evidence is not a distributable release procedure.

## 再実行 / Reproduction

### 春の洋風図案制作中の再確認 / Recheck during Western Spring artwork

2026-10-02 JST。保存実装・形式は変更せず、3ファイル43固有テストを再実行してPASS。専用合成profile `letterier-spring-save-oct2` / `letterier-spring-retry-oct2`でproduction `index-C1ugGBp8.js`の既存save-recovery/autosave-retryを再実行し、最終window結果を別evalで確認。最新本文の実IndexedDB回復、明示回復、履歴復元/復元前保護、復元後再読込保持、manual download、破損draft非上書き/元bytes復旧後回復、transaction abort後の追加入力なし1回retry、警告解除、375px保護版作成はPASS。pageErrors空・console error/warning 0、保存/破損/失敗/再試行/375履歴の5画面を目視。Windows合成ファイルのread-only verifierもPASS。両専用browserをcloseし、PID44616/66404不在を確認。既存preview PID61860は維持。

The 43 distinct save/fault/evidence tests and both actual IndexedDB flows passed again on the Winter production bundle while Spring artwork was being generated. Final results were queried separately and five screenshots inspected. Existing Windows synthetic files passed read-only verification; save implementation and format remained unchanged.

図案登録後は新しい合成profile `letterier-spring-save-latest-oct2` / `letterier-spring-retry-latest-oct2`でlatest `index-CL-jX2Nk.js`へ接続し、同2フローを再実行。別evalで実読込URL・最終結果の全項目PASSを確認し、pageErrors空・console error/warning 0。5screenshotsを再目視し、downloadをfflateで別decodeしてv2・本文「合成保存試験：最初の本文」を確認。全体41ファイル279件、Rust12件、check/version/build PASS。両profileは終了確認を下記記録へ残す。Windows最新プロセス再起動/OSダイアログ/実ディスク不足/同時保存/電源断は未実施。

After artwork registration, both flows also passed in fresh synthetic profiles on the latest Spring bundle, independently confirmed through final-result and script-URL queries. The five screenshots were inspected again and the downloaded archive separately decoded. Both browsers were closed and PID34468/62036 observed absent. This is browser evidence, not a new native process restart, OS-dialog, actual disk-full, concurrent-save or power-loss test.

### 冬の図案追加後の再確認 / Recheck after Winter additions

2026-10-02 JST、保存実装/形式を変更せず、3ファイル43固有テスト（document-files・persistence-faults・native-save-evidence）がPASS。全体41ファイル275件、Rust12件、check/version/build PASS。旧Windows合成証跡のread-only検査ではmanual-round2.binsenは手動保存時の本文、draftは最新編集本文のまま。これは最新nativeを起動・再保存した証明ではありません。

The 43 distinct save/fault/evidence tests passed; complete suites passed 275 frontend and 12 Rust tests. Existing synthetic Windows files were decoded read-only and retained the intended manual/draft separation; this does not prove a new native run.

専用の合成profile letterier-winter-save-oct2 / letterier-winter-retry-oct2で旧Moon buildを先に確認し、冬図案登録後のlatest index-C1ugGBp8.jsでもreloadしてsave-recovery.cjsとautosave-retry.cjsを再実行。最終window結果と実読込script URLを別evalで確認。実IndexedDB最新回復・起動時の明示回復・履歴復元/復元前保護・再読込保持・manual download・破損draft非上書き・元bytes復旧後回復がPASS。実transaction abort後、追加入力なし再試行1回で成功・警告解除・再読込後本文一致・375px保護版作成もPASS。pageErrors/console error/warning 0。downloadをfflateで別展開し、v2・合成本文完全一致を確認。1280保存/破損/再試行と375履歴の5screenshotsを目視。history-language.cjsの日英1280/375実操作は冬登録前のMoon buildでPASS（冬登録後は再実行せず区別）。

Both existing browser recovery and transaction-abort/retry flows passed again after reload onto the latest Winter production bundle, verified with separate final-result and bundle-URL queries. Archive bytes were independently decoded. Five save/corruption/retry/history screenshots were inspected. Bilingual history preview/restore was rerun on the preceding Moon bundle only. These are synthetic browser tests, not OS-dialog, forced-exit or power-loss evidence.

最新冬のWindows process restart / OS保存先ダイアログ / 強制終了 / 実ディスク不足 / 外部同時保存 / 複数起動 / 電源断はNOT RUN。保存元非上書き等のmock/unitと古いnative観測を最新の実機成功へ格上げしない。旧素材・実データ・開始時tmpを保持、公開/pushなし。
Latest native restart, OS dialogs, forced shutdown, real disk-full, concurrent external saves/instances and power-loss remain NOT RUN. Existing data and tmp were preserved; no publication or push.



### 月の図案追加・選択カード修正時 / Recheck during Moon artwork and card changes

2026-10-02 JST、保存実装・形式は変更せず、document-files/native-save-evidenceの24件、persistence-faults/native-save-evidenceの22件を再実行して計46回の実行がPASS（native-save-evidenceの3件は重複、固有43件）。最初のコマンドには存在しないpersistence.test.tsも指定されていましたが、Vitest実集計は2ファイル24件であり、3ファイルとは扱いません。故障注入・同一/別文書の遅延失敗・有限再試行・復元前保護・手動保存失敗/キャンセル等の既存テストを再確認。全体回帰は41ファイル271件、check/build PASS。月図案のpack/unpack後巡回もunitで確認しました。

Forty-six test executions passed across manual-save/fault/evidence suites, representing 43 distinct tests with three evidence tests rerun. Save code and formats were unchanged. The first command included nonexistent persistence.test.ts, so only Vitest's actual two-file result is counted. The complete frontend suite passed 271 tests across 41 files. Moon design cycling survived the real archive pack/unpack unit flow.

今回の最新buildはindex-CnAM-1Ve.jsで、実IndexedDB復旧のbrowser flowやWindows保存・再起動をこの図案/CSS変更後には再実行していません。直前の本文回避変更後の実IndexedDB・Windows証跡再確認とは区別します。電源断、実ディスク不足、複数起動などの未確認条件は引き続き未確認です。

The IndexedDB recovery browser flow and native saving/restart were not rerun after this artwork/CSS-only change; prior evidence below remains bounded to its tested revision. Power-loss, real disk-full and concurrent-instance scenarios remain unverified.

### 図案への本文回避変更後 / Recheck after artwork-aware body wrapping

2026-10-02 JST、`index-DBpkf2TS.js` を新しい専用profile `letterier-save-wrap-oct2` で確認。`save-recovery.cjs` の最終結果を別evalで取得し、実IndexedDBの最新回復、起動時の明示回復のみ、履歴復元・復元前保護、再読込後の保持、手動download、壊れたdraftの非上書き、元bytes復旧後の明示回復が全件PASS。downloadしたv2 archiveを別decodeして本文完全一致を確認。pageErrors/console errors/warnings 0、専用browserは閉じた。

The latest production bundle passed the existing save/recovery flow in a fresh synthetic-only profile. Final results were queried separately after reloads; the downloaded v2 archive was decoded separately and matched the expected body. Actual IndexedDB, explicit recovery, history protection, corruption retention/repair and download passed. No OS save-dialog or forced-exit claim is made.

保存／文字数／自動罫線の近接5 files /61 tests、全体41 files /269 tests、Rust12 tests、check/version/build PASS。実Windows保存証跡のread-only再確認も、手動ファイルは手動保存時、draftは最新編集時の本文でPASS。本文回避の変更は保存コード・形式を変えず、旧文書の図案に重なる行は再配置され得る。Windows PDFの検証と制約は [NATIVE-OUTPUT-VALIDATION.md](NATIVE-OUTPUT-VALIDATION.md) に分離する。

Current totals and file evidence passed. Stored content/format is unchanged, although previously overlapping lines may reflow. Native PDF evidence and untested boundaries are recorded separately.

### 長文DOM変更後の再確認 / Recheck after long-document DOM change

2026-10-02 JST、最新production `index-BOh3YJ0Z.js` を新しい合成専用profile `letterier-save-longdoc-oct2` で確認。既存 `save-recovery.cjs` を再実行し、最終 `window.__letterierSaveRecoveryQA` の全項目PASS・pageErrors空を別evalで取得しました。実IndexedDBの最新本文回復、起動時の明示回復、履歴復元・復元前保護、復元後の再読込、手動download、壊れたdraftの非上書き・元bytes復旧後の回復を再確認。OSダイアログ・強制終了の成功へ格上げしません。保存コードと形式はこの性能変更で触っていません。

The existing save/recovery browser flow passed again in a fresh synthetic-only profile on the latest production bundle. Its final result was queried separately after reloads. Actual IndexedDB recovery, history restoration/protection, persistence after reload, download and corrupt-draft retention/repair passed; this is not an OS-dialog or forced-exit test. Saving code/formats were unchanged by the DOM optimization.

この再確認時の全体回帰: frontend 40 files / 255 tests PASS、Rust 12 tests PASS、check/version/build PASS。上記253件の表は以前の検証時点の数であり、この追記で最新集計と区別します。

Current recheck totals: 40 frontend files / 255 tests and 12 Rust tests passed, as did type/version/build checks. The earlier 253-test table remains a historical observation.

```powershell
npm test -- tests/persistence-faults.test.ts tests/document-files.test.ts
npm test
npm run check
npm run build
npx vite preview --host 127.0.0.1 --port 1421 --strictPort
# Separate terminal; dedicated synthetic profile only.
npx --package @playwright/cli playwright-cli --session letterier-save-qa open http://127.0.0.1:1421
npx --package @playwright/cli playwright-cli --session letterier-save-qa snapshot
npx --package @playwright/cli playwright-cli --session letterier-save-qa run-code --filename tests/browser/save-recovery.cjs
npx --package @playwright/cli playwright-cli --session letterier-save-qa eval "window.__letterierSaveRecoveryQA"
# Fresh synthetic profile for fault injection; no real application data.
npx --package @playwright/cli playwright-cli --session letterier-retry-qa open http://127.0.0.1:1421
npx --package @playwright/cli playwright-cli --session letterier-retry-qa snapshot
npx --package @playwright/cli playwright-cli --session letterier-retry-qa run-code --filename tests/browser/autosave-retry.cjs
npx --package @playwright/cli playwright-cli --session letterier-retry-qa eval "window.__letterierAutosaveRetryQA"
npx --package @playwright/cli playwright-cli --session letterier-retry-qa run-code --filename tests/browser/history-language.cjs
```
