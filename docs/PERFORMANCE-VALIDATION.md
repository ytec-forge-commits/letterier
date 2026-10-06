# 性能の限定検証 / Bounded performance validation

## BKC現行版の回帰・再計測（2026-10-02、15:45–15:50 JST）

専用production1435/PID66160、合成Chromium final-performance/PID45752とfinal-license/PID65684。実BKC bundleのSHA256 `01B47E40EA7FA45B198561D349FD66586B050C0AEA3C0BFF545FE4128AB9D482` 一致。製品コード変更なし。

- PASS: unchanged-page-domの1万文字で、末尾入力時に先頭本文DOMとtoken参照が残る。全文一致、先頭入力/キャレットも一致。
- PASS: 同じ合成benchmarkは1万文字/14頁。末尾5入力は117.4/116.7/115.0/115.2/113.9ms、中央値115.2ms（beforeinput→2RAF）。初期入力354.5msはProfiler/キャッシュ差を含み、比較率から除外。ページ追加245.4ms、全文18pt変更250.0msは自動操作往復込みの各単発値であり改善保証なし。各段階で全文10005文字とpage-add/Undo、全token18ptを検査。
- 過去同fixtureの入力中央値328.8ms/137.8msに対し今回115.2msを観測。ただし同時A/Bではなく環境変動を含む。数値閾値は未合意で、全体性能目標達成やnative入力性能の証明ではない。
- PASS: flow-imeの横/縦長文改ページ・削除・CDP composition確定・同一文字再確定・直後キャレット。実OS IMEではない。
- PASS: ライセンス初期request0、読込途中close/reopen、20候補、Klee/Yomogi権利本文SHA完全一致、375px横overflowなし、意図的取得失敗の説明。pageErrors0。専用license console error1は明示route.abortによるERR_FAILEDで、0へ隠さない。performance console0。
- 長文1280とlicense1280/375の3画像を親が個別目視。2browserのCLI close完了、全3PID/1435 listener不在を別Host確認。
- 最後の全43files/358 JS tests、TypeScript/version1.0.4、12 Rust testsを再実行して終了0を観測。RustはWindows実排他lock原本保持/再試行を含む。通常release/NSISの最新buildは前工程で終了0、今回再buildしていない。

main541.54kB/gzip178.49kB（500kB WARN）とprepare時間WARNを維持。native性能、大量画像、長時間heap/漏れ、実OS IME、全font描画性能、数値目標は未検証。高速化を実装・回帰確認したという限定成果であり、すべての操作が高速になったとの保証ではない。

The current BKC build preserves unchanged-page DOM and passes long-document input, pagination and bulk-format regressions. Five tail-input samples have a 115.2ms median, with frame scheduling included. License loading remains deferred and preserves the original texts. These are bounded synthetic-browser results, not native, image-heavy, memory-leak or agreed-threshold approval.

2026-10-02 JST、1.0.4 作業中差分。全体性能の完了判定ではありません。
Work-in-progress 1.0.4; this is not an overall performance approval.

初期依存グラフの実測で `font-licenses.json` が静的に含まれることを確認し、ライセンス画面を開く時だけ読込むよう変更しました。本文・フォント数・権利表示の正本は変更していません。
An actual Vite output module graph identified the bundled font-license JSON as an initial static dependency. It is now requested only when its screen opens; original license text and font count are unchanged.

| Production build | Before | After |
| --- | ---: | ---: |
| Main JS (minified, Vite decimal kB) | 618.01 kB | 531.40 kB |
| Main JS gzip | 181.70 kB | 176.13 kB |
| Deferred font-license chunk | — | 88.54 kB / gzip 4.74 kB |

After列は有限自動保存retry・警告所有範囲・履歴英語文言も含む最新build。遅延読込だけを入れた時点のmainは530.23 kB、gzip175.69 kBでした。
The After column includes the latest autosave and history-language changes. Immediately after license splitting alone, main JS was 530.23 kB, gzip 175.69 kB.

PASS: `tests/startup-bundle.test.ts` は Vite の実 build（write:false）を通し、ライセンス module が生成物には存在し、entry の静的 imports から到達しないことを確認。`tests/browser/font-license-lazy.cjs` は production preview で初期 request 0、読込中 close、再open、20フォント、Klee One/Yomogi 本文 SHA-256 が正本と一致、375px modal 横はみ出しなし、読込失敗の説明を確認。1280/375 screenshots は目視済み。pageerror 0。意図的 route abort の network error 1 は期待した失敗で、console error 0 とは報告しません。

PASS: The graph regression test checks real build output, not source-string matching. Browser checks cover zero initial license requests, close/reopen during loading, all 20 options, exact text hashes for two licenses, modal overflow at 375px, and explained load failure. Both viewport screenshots were inspected. No page errors; one deliberately aborted network request is expected, so this is not a zero-console-errors claim.

WARN: main JS はまだ500 kB超で build warning が残る。長文入力・大量画像・native 起動時間・メモリー・全フォント描画の性能を確認した結果ではありません。可読性・権利本文を削って警告を隠す変更はしていません。
WARN: The main chunk still exceeds 500 kB. Long-document, image-heavy, native startup, memory and full font-rendering performance remain unverified by this change.

## 長文の本文DOM / Long-document body DOM

2026-10-02 JST。専用合成Chromium `letterier-longdoc-oct2`、1280×720、production preview、同じ1万文字・横書き14ページ。入力前の `beforeinput` から2回目のRAFまでであり、純粋なCPU時間やnative入力時間ではありません。数値の合意済み性能目標は見つかっておらず、この結果を全体性能の完成判定にしません。

| 観測 / Observation | Before | Final after |
| --- | ---: | ---: |
| 末尾1文字×5回 / Five tail inputs, ms | 350.2, 328.8, 335.7, 297.7, 321.9 | 146.8, 137.8, 128.2, 132.2, 139.3 |
| 末尾入力中央値 / Median, ms | 328.8 | 137.8 |
| ページ追加 / Add page, ms | 280.1 | 286.4 |
| 全文18pt変更 / Bulk 18pt, ms | 411.5 | 371.5 |

ページ追加・一括変更はクリック自動操作の往復を含む単発値で、改善を保証しません。初回1万文字入力はProfiler有効・キャッシュ差の影響があり、改善率の根拠に使いません。heap値は瞬間値だけでメモリー漏れ試験ではありません。縦書き8ページの別観測は上表の比較から除外しています。

Each input sample includes frame scheduling. Add-page/bulk samples include automation overhead and are single observations, not proof of improvement. Initial insertion profiling/cache differences and instantaneous heap readings do not establish an improvement ratio or leak safety. A separate vertical eight-page observation is excluded from this comparison.

原因確認: 旧keyは全ページにglobal caretRequestを含み、末尾入力で先頭ページDOMも再作成していました。実DOM参照を保持する `unchanged-page-dom.cjs` が変更前RED、修正後GREEN。keyを表示行・座標・書式・言語・方向・文書IDに基づくものへ変更し、IME確定だけは該当ページのrevisionを加算します。同一文字の再確定でもブラウザーが触ったDOMを残しません。選択依存の初案は先頭入力回帰を起こしたため破棄し、最終版には含まれません。保存方式・形式は変更していません。

The old global caret key remounted every body page. A real DOM-identity regression reproduced this before the fix. Keys now follow rendered lines/format/geometry/document/language/direction, with a per-page IME commit revision. A discarded selection-dependent prototype failed head-caret input; the final implementation has no selection-dependent key. Persistence formats and saving code are unchanged.

PASS: `unchanged-page-dom.cjs` の先頭DOM保持・先頭/末尾入力、`flow-ime.cjs` の横/縦改ページ・削除・日本語確定・同一文字再確定・直後の入力、`long-document-performance.cjs` の全文一致・ページ追加/Undo・全token18pt/Undo。最終build `index-BOh3YJ0Z.js`、532.52kB（既存warningあり）。1280 screenshot目視で重なりなし、紙面の縦scrollは意図通り。

PASS: Actual browser regression checks preserve unrelated page DOM, head/tail input, horizontal/vertical pagination/deletion, IME commits including identical text, and subsequent caret input. Benchmark operations verify complete body contents, page-add/Undo and all-token bulk size/Undo. The 1280 screenshot was inspected; vertical paper scrolling is intentional.

独立読取review: Russell `01a0f8f5-135e-7ab3-82ed-50ca75385d37`、静的PASS／実測範囲WARN、40 files/255 tests・check・script構文PASS。親が実ブラウザーを実行し、reviewerは未実行。3主要ファイルおよびIME追加scriptのSHAは親再実測と一致。同IDのcompleted wait受領後close済み、実効モデルUNKNOWN。性能閾値・native/大量画像/メモリー漏れ・実OS IMEは未確認。同一文字再確定は本文と後続入力の検証で、DOM再作成そのものの独立証明ではありません。

Independent read-only review passed its static scope, with warnings about absent thresholds and native/memory proof. Parent browser observations are separate from the reviewer's tests. The same reviewer ID was received completed and closed; actual model UNKNOWN. Real OS IME, native performance, image-heavy documents and leak testing remain unverified.
