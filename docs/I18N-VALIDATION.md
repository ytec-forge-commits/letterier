# 日英UIの仕上げ検証 / Final Japanese–English UI validation

## 同版独立静的レビュー受領（2026-10-02、14:51 JST）

assignment `CURRENT-WARNING-I18N-20261002-P`、担当Dalton / `01a0fb27-a222-7543-ab51-9b8a21f0ead3`。正規spawn、同IDのcompleted wait、closeのprevious_status completedを親が確認。対象はi18n.ts、unit回帰、clipboard browser回帰、参照App.tsxの4ファイル全文。開始/終了hash一致、具体的不具合検出なし。親側でも下記原本hashを再照合した。編集・実行/import・test/build・Git・外部操作・再委任なし。実効model/HostはUNKNOWN、Host不在証明なし。通常Nativeの限定静的レビューであり、他repo限定ARTIFACT_ONLY_BOUNDED_V1やSTRICT保証を適用したとは称さない。

- i18n.ts: `99DD62DA2E17223FFD9D957EAFD78E9987B6227C255FDBE148898F067D458AF0`
- tests/i18n.test.ts: `80A82DE1B82B947E4C223EDFE49310315ED00E2547A2AAE1373115AE99E7C015`
- tests/browser/i18n-warning-clipboard.cjs: `3E969EB0932D6D03C4A6E7D18AA6D331680C22F95491EEEA27AD98944C19D691`
- App.tsx: `4678BAC6BE586212A81E096D3F12839FE35C34493D3F71C159D5EA28A23C2757`

親の355 tests/実画面観測を独立実行へ昇格しない。今回の翻訳修正に対する限定静的review残件は解消したが、要素上限/不足フォント実UI、現行nativeの保存/復元/出力は別gate。

## 警告文の翻訳修正（2026-10-02、14:38–14:42 JST）

補完レビューOが指摘したApp.tsxの3警告を調査。既存翻訳辞書に要素上限/クリップボード失敗の完全な文がなく、不足フォントの動的文に専用変換がないことが原因だった。6ケースを追加して実関数でRED（6 failed / 45 passed）を確認し、辞書2件と動的変換1件だけを追加してGREEN（51 passed）。動的変換は一般的な部分置換より先に元の指定名を捕捉し、名称「未導入フォント」「白の和紙、保存履歴」や改行を含む合成名を改変しない。日本語の原文とError接頭辞も保持する。

- PASS: 全43 files / 355 frontend tests、check/version1.0.4、production build。500kB chunkとprepare-out-dir遅延はWARNとして残る。
- 現行frontend: `index-BKCcvAG_.js`、SHA256 `01B47E40EA7FA45B198561D349FD66586B050C0AEA3C0BFF545FE4128AB9D482`。
- `src/i18n.ts` SHA256 `99DD62DA2E17223FFD9D957EAFD78E9987B6227C255FDBE148898F067D458AF0`、unit test SHA256 `80A82DE1B82B947E4C223EDFE49310315ED00E2547A2AAE1373115AE99E7C015`。
- PASS: 新browser回帰 `tests/browser/i18n-warning-clipboard.cjs` を現production/専用1432/session warning-i18nで実行。外部clipboard readだけを合成拒否に置換し、実リボンPaste→実エラー処理→DOM警告翻訳を通した。英→日→英、1280×720/375×812、閉じる、本文tokens空の保持、document幅内、pageerror0を確認。console error/warning0。2画像を親が目視し、警告本文とCloseが読めることを確認。375pxのリボン/紙面内部スクロールは既存仕様で、スマホ全面対応の証明ではない。
- 試験コードの初回停止は空行のzero-width placeholderを本文と誤認したテスト側の判定。次のtimeoutも警告自体は翻訳済みで、子要素探索では親の直接テキストを取得できなかったため。実DOMを調査してtokens/直接text-nodeで検査するよう修正した。これらを製品のRED証拠へ流用しない。
- 専用browser70236とpreview53204を終了。要素200個上限と不足フォントの実UI再現はNOT RUNで、関数テストを実Windows試験の証明としない。Rust/保存形式/保存処理/依存/権限は変更していない。現行翻訳修正の独立再review、隔離Windows保存/復元と出力の現版検証、native再build/再梱包は残る。

Six real translation tests failed before the narrow fix and passed afterward; all 355 frontend tests, type checks and the production build passed. A dedicated Chromium run exercised the actual clipboard-error UI with only the external clipboard boundary denied, including JA/EN round trips, dismissal and an unchanged empty body. Two captures were inspected. Object-limit and missing-font UI triggers, current-revision independent review and Windows-native replay remain unverified.

2026-10-02 JST、09:51–10:05頃。対象は `business-apps/binsen-kobo`。ルート・分類・プロジェクトAGENTSを明示読込。Directorによる親単一writer、Systematic Debugging、TDD、Playwrightを使用。実利用者の保存データ、保存形式、保存/復元ロジック、依存関係、版番号、公開設定は変更していない。

## 再現と修正 / Reproduction and fixes

- RED: 翻訳関数の新規17ケースが不足辞書と動的説明で失敗。実画面のヘルプ検査も旧「Choose stationery above」案内で失敗。辞書追加と「ホーム → 新規作成」への案内修正でGREEN。
- RED: 合成登録名 `保存履歴・白の和紙` が英語表示で `History・White Washi` に変化。自作名の表示を `translate="no"` で保護、削除確認を単一テキストにして名前を保持する動的翻訳へ変更。同じ実画面検査でGREEN。削除は確認表示とキャンセルのみで、利用者データを削除していない。
- RED: Reactが分割した印刷説明7ケースが翻訳不足で失敗（既に訳せる「左」は初回からPASS）。断片の辞書を追加してGREEN。印刷倍率・印刷不可領域・不足フォント説明は関数テストであり、今回Windowsプリンター状態を実測した証明ではない。
- RED: 英語UIでCategoryのMy templatesを選ぶと内部値まで `My templates` となり、一覧0件。実DOMのoption text/valueと空一覧を観測。value未指定optionが翻訳済み表示を値として使用することが原因。種類と季節のoptionへ明示 `value={s}` を追加。内部値 `自分のテンプレート`、自作一覧表示、西洋10シリーズ/春2シリーズの実UI確認でGREEN。

## 現行版の確認 / Current revision checks

- `npm run check` PASS、版番号1.0.4一致。全41ファイル/341 frontend tests PASS。12 Rust tests PASS。`npm run build` PASS、production `index-DAkWGDAt.js`。main chunk 540.29kB警告、prepare-out-dirの遅いhook警告はWARNとして保持。
- 専用Chromium session `i18n-final`、browser PID40160、loopback `http://127.0.0.1:1421`。合成テンプレートだけを登録。Windows nativeの証明ではない。
- HomeからNew dialogを実際に開く。登録/更新説明、登録名と削除確認、更新キャンセル/削除キャンセル、範囲99による英語エラーとPDF button無効を確認。
- JA→ENの再描画、EN→JAの原文復元、JA→EN再切替と属性ラベル操作が成功。本文 `保存履歴・白の和紙 — synthetic body` と登録名は保持。1280×720と375×812の計6画像を撮影・全枚目視。375のdocument幅/scroll幅はいずれも375。dialog内の通常スクロールは維持し、閉じる/言語切替を実操作。pageerror/console errorとも0。
- 回帰コードは `tests/browser/i18n-help-check.cjs`、`i18n-template-check.cjs`、`i18n-category-check.cjs`、`i18n-final-ui.cjs` に保存。npm testはブラウザコードを自動実行しない。実行には専用ローカルpreviewとCLI session、合成登録の準備が必要。
- 再実行順は、現行productionの専用previewを1421で起動して新規の専用CLI sessionで開き、`run-code --filename tests/browser/i18n-help-check.cjs` → `i18n-template-check.cjs`（合成登録を作る）→ `i18n-category-check.cjs` → `i18n-final-ui.cjs`。各CLI結果とexit codeを確認して次へ進む。通常利用者のbrowser profileでは実行しない。終了時は専用sessionだけをcloseする。
- 翻訳修正前の未保存本文があるsessionでreloadした際はbeforeunloadが働き、続きのCLIがmodal stateで停止。専用合成sessionの確認を明示acceptしてから最新版を読込し再実行。停止した一括コマンドを成功とは扱わない。
- 保存関連5ファイルは最新実Windows保存・復元試験のSHA-256と一致。今回の型/全テストに保存回帰も含まれるが、翻訳修正後のWindows専用binaryで全保存/PDF経路を再実行した証明ではない。保存試験は [SAVE-RECOVERY-VALIDATION.md](SAVE-RECOVERY-VALIDATION.md) を参照。

## 独立レビュー / Independent review

Hypatia `01a0fa1c-ebd9-7e53-bbaf-3e49a82965eb`、assignment Fは同ID完了waitで受領。6ファイルの実hash一致、具体P1/P2なし、DOM統合テスト不足P3。続く種類/季節の意味変更と永続ブラウザ回帰コードについて新assignment `I18N-FINAL-20261002-G`・8ファイルの新manifestで同担当が再確認。Gの同ID完了waitを受領し、全8hashは提示manifest・親の再読取・結果本文で一致。新たな具体的機能不具合なし、Category修正/P3の回帰追加をコード上確認。親がこの範囲のレビューを受入し、native close応答も受領。Fの結果はG受入へ流用していない。担当は読み取り専用、テスト/ブラウザ実行なし。要求モデルの実効identityとHost不在は未確認。親による実画面測定を独立実測へ読み替えない。

| File | SHA-256 |
| --- | --- |
| `src/i18n.ts` | `E992158BC35C9C29FEED4DD385EEDF121EA1916B79B1F1C76CB95F3F43DE55FB` |
| `src/ui/Preferences.tsx` | `B7534D7309DF2EE13D720B67673BEF3F5A00CF996A9641BBAEB883C67636AE13` |
| `src/ui/TemplateDialog.tsx` | `4B954A0BBFC4A0D6251EA90053B8E01ACCD65527DC22A86135C7EE6F44B40138` |
| `tests/i18n.test.ts` | `DC8DC9E1D85D37DC8B772141D5304C2DFFB11081F27ED984B3A7928418851E5C` |
| `tests/browser/i18n-help-check.cjs` | `F29C1281F1B2F0B95E12E8A0F686F8CB6535349BC7E9A7F341F3CAD698F5B548` |
| `tests/browser/i18n-template-check.cjs` | `08F6A0894AD9357D12BC34EDEF6B7DFD4362859C3D60432FBD1568E0EEDFE28D` |
| `tests/browser/i18n-category-check.cjs` | `3B9BF183EF17B2B51496B9B5E9D28FA67F932F23BD99EB88BB68CE23ED4DDE72` |
| `tests/browser/i18n-final-ui.cjs` | `3BCCE127697C86330F2E3BDB897405FB902C9E2D441CF0747C36E1FB5F6E284F` |

専用browserはCLI close成功後、PID40160不在を確認。実画面・reviewの終了とHost不在の独立証明は区別する。

## 未実施と残件 / Not run and remaining work

- 最新未署名native build、確認用ZIP再梱包、最新説明書のZIP内リンク/hash照合は残る。旧ZIPは保持し、最新成果物として扱わない。
- 新しい英語Settings画像を `docs/manual/images/en-settings-i18n-final.png` として追加し、旧all20画像は保持。その他画像は紙面挙動の変更がないため維持。
- OSプリンター失敗/送信完了/PDF完了等の各native状態は今回英語の関数テストのみ。物理印刷・実電源断・実容量不足・多重起動・installer更新/削除・公開は今回NOT RUN。
- 既存差分は開始時271項目、`tmp/`を含め保持。変更した製品コードはi18n/Preferences/TemplateDialogだけ。commit/push・一括整形・依存更新なし。

The final UI checks reproduce and fix missing translations, outdated onboarding, translated user-template names, and translated option values that broke filters. Real browser interactions verify the route, custom templates, range guards and language round trips. Windows runtime states, fault conditions and current-source package acceptance are separate gates; no claim of zero bugs is made.
