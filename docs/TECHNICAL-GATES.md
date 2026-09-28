# 技術検証

状態: 初期成立性を確認。試作の成功を製品の全機能合格として扱わない。

Tauri 2/React/TypeScript。DOMによるネイティブ文字選択とIME、CSS縦組み、独立した矩形除外レイアウト、SVG罫線、WebView2によるPDF/印刷を検証する。

Gates A–E: 便箋上直接入力、キャレット、IME、横組みと縦組み、部分書式、禁則、縦中横、自動/手動改ページ、画像の矩形回り込み、A4/B5/はがきのPDF・印刷。結果は検証後に追記する。

## 初期試作の実測

- Node 22.22.0、Rust/Cargo 1.93.1、Windows SDKを確認。React/Tauriのビルド・起動に成功。
- DOM直接入力で日本語テキストを追加し、縦書きへ変更後も入力内容を保持。ブラウザと実際のTauri WebView2双方で操作した。
- 横縦の改ページ、禁則、手動区切り、結合文字保持を6件のREDからGREENで確認。括弧の期待値に4文字を3文字幅へ入れる誤りがあったため、実装前に手計算の期待値を訂正。
- WebView2 PrintToPdfで実際にnative-probe.pdfを生成。本文フォントを含む1ページで、ベクター文字が抽出可能。用紙寸法変換と不正値拒否はRustの2テストで確認。
- 日本語OS IMEの候補選択・未確定入力、製品の自動ページ境界編集、矩形回避、20テンプレート全出力、直接印刷ダイアログは引き続き検証対象。

## 選定

Tauri + React + TypeScriptは採用。BodyFlowは一続きの書式付き本文として保持し、mm単位LayoutPlanから行/列のDOM断片・SVG罫線・出力を作る。IME中は編集DOMを再生成せず確定後に配置計算する方式を次に検証する。

ProseMirror/MITはschema・transaction・DOM編集を分離し、IME修正も継続する有力な比較候補。ただし任意矩形回避とページ表示は別実装であり、まず小さな直接編集アダプタで今回の必要操作が成立するか評価する。失敗時はEditorViewへの置換を検討する。GitHub正本は移転案内がある。

Lexical/MITはReact統合とimmutable EditorStateに利点があり、公式0.50.0公開を確認したが、改ページ問題は残る。Vivliostyle/AGPL-3.0は継続開発中の日本語組版参考として調査したが、直接編集エンジンではなく、ライセンス条件の変更を伴う採用は行わない。これらの外部コードはコピーしていない。

CSS shape-outsideはfloatの輪郭を対象とし、自由配置の任意矩形回避そのものを保証しないため、行・縦列の区間から除外矩形を差し引く処理を独立させる。

Canvasへの全面描画はIME・キャレット・選択を自作する負担が大きいため不採用。低解像度紙面画像だけのPDFも不採用。

出力はTauri with_webviewからICoreWebView2Environment6/ICoreWebView2_7へ接続。PDFは一時ファイルで完成を確認後に保存する。印刷はWindowsシステムダイアログを使用する。実装の初回compileではcallbackの公開パス誤りを修正し、その後Rustテストとネイティブ出力に成功。

独立調査担当: Astra Mediumを要求、読み取り専用で比較報告を受領。実行モデル・effort・速度の観測は未確認として扱う。独立最終レビューの代わりにはしない。

実装依存は公式npm/Cargoからプロジェクト内に追加し、lockfileへ固定する。React/Vite/fflateはMIT、TypeScriptはApache-2.0、TauriはMIT/Apache-2.0。開発依存と同梱依存の通知は配布前に実物から監査する。導入の戻し方はこの新規プロジェクトの依存宣言を戻して再インストールすることであり、既存アプリやOS全体を更新しない。

## 参照

- [Tauri前提条件](https://v2.tauri.app/start/prerequisites/)
- [WebView2の印刷API](https://learn.microsoft.com/en-us/microsoft-edge/webview2/how-to/print)
- [CSS writing-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/writing-mode)
- [ProseMirror](https://github.com/ProseMirror/prosemirror)
- [Vivliostyle](https://github.com/vivliostyle/vivliostyle.js/)
