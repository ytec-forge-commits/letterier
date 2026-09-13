# Director Astra 実アプリ最終試験

レタリエ1.0.0の実開発に適用した。今回のアプリ完成とDirectorの公開可否を区別する。結論は **要改善・限定試験としての記録**。問題なしの最終合格、または一般的な自律本番操作の資格取得とは判定しない。

## 要求と観測

- 親: gpt-6-astra / high要求。Host turn_contextで同一model/effortを観測。速度は標準要求、実測未確認。
- OSS比較担当: gpt-6-astra / medium要求。Hostへ割当済み、観測値は未確認。
- 1 writer維持。外部公開なし。interactive adapterがモデルをdispatchした件数は0で、ホスト側で実行した担当呼出しを0件と誤記しない。

## D01: Rust標準生成物の候補検査

再現: 新規Tauriプロジェクトを標準のsrc-tauri/targetへビルド後、InteractiveSession.checkを実行。

結果: candidate-unclassified-hidden-fileでチェック開始前に停止。interactive.pyの候補走査はtargetを生成物として分類せず、Rustの隠しファイルを拒否する。危険な自動継続は起こらなかったが、一般的なTauriの初期構成へそのまま適用できなかった。

今回の対処: 対象アプリのCargo出力を.local/cargo-target、Vite出力を.local/frontendへ明示設定する。既存試作生成物はプロジェクト内へ移動して保持する。Director本体・共通設定を黙って変更しない。

公開前の改善候補: 呼出し側が宣言した生成物境界を事前検査する仕組み、または対応手順の明記。Gitignore全件の無条件除外は、ソース検証漏れを招くので採用しない。開始前に停止した検査も記録へ残す設計が必要か評価する。

本ファイルの所見は開発記録であり、独立レビューの合格を表すものではない。

## 工程別の実行記録

以下は親のHost実行へ結び付けた工程。いずれもAstra/Highの要求・観測を記録した。定型操作が含まれていても、実測HighをLow/Medium実績へ書き換えていない。

|工程ID|内容|確認|
|---|---|---|
|phase0|OSS比較・Tauri/組版/出力試作|初期ゲート|
|document-layout|BodyFlow、縦横組版、直接編集|編集/組版回帰|
|persistence|ZIP、自動保存、履歴、復元、バックアップ|保存/移行/失敗回帰|
|objects-pages|画像/文字箱、追従/固定、ページ操作|配置/Undo回帰|
|templates-themes|和洋20便箋・21画面テーマ|再利用/保存/表示|
|fonts-output|手書き20書体・PDF/印刷|原本ハッシュ/フォント/出力|
|image-formats-a|静的/アニメ画像・SVG|入力/原本保持/安全検査|
|image-formats-b|PSD/PDF互換AI/HEIC|変換/制限/ライセンス|
|editor-stability|改ページと自由要素の整合|回帰/キーボード|
|windows-integration|Windows入出力・終了/関連付け|Rust/型/機能|
|security-hardening|Standard監査の2件と上限検査|不正アーカイブ/画素予算|
|release-candidate|1.0.0、法的通知、配布、独立レビュー修正|最終候補に結び付く検査|
|verify|最終tests/diff・成果物照合|台帳の終了/最終レポートで判定|

実行台帳は `.ytec-director/runs/binsen-final-trial-20260906.jsonl`。機械集計は `.local/director-report.json` に保存する。最終工程はこの文書を含む候補へ `tests` と `diff` を結び付け、`close()`後の集計で完了を確認する。後続の公開や署名をこの完了へ含めない。

## 独立作業と保証の限界

OSS・編集方式の閉じた調査にはAstra/Mediumを割り当てた。リリース前の読み取り専用レビューにはfreshなAstra/Highを割り当て、同じ保証単位の上限3回を維持した。子の要求設定は確認できるが、子自身は実行に結び付く観測値を確認できていない。Host受付・観測・要求を混同しない。

第1回は本文削除と固定アンカー、最近の手紙の保存順序を指摘。第2回は同一ファイル再読込の保存順序を指摘。親がRED→GREENを実行して修正した。第3回の固定候補判定と各回のハッシュは `RELEASE-CHECK.md` と `.local/release-final/report.md` を参照する。

このinteractive adapterがモデルをdispatchした件数は0。Host側の子呼出しや実開発が0件という意味ではない。adapterは独立保証を認証せず、集計の `independent_assurance` は `not-established-by-this-adapter` のまま。速度は要求のみで実測未確認、工程別総トークンも未取得なので0消費と報告しない。xHighを開始した工程はない。

## Directorの公開判断へ残す事項

D01の生成物境界を修正または正式な対応手順として整備し、標準Tauri構成で独立再試験する必要がある。native adapterの一般live資格・ツール実行観測は今回のinteractive試験で代替されない。Director本体の修正・GitHub/Forge公開は今回行っていない。アプリの確認結果をもって「Directorに問題がなかった」とは結論しない。
