# レタリエ

## 固定ルール

- Windows 10/11 x64用、日本語UIのオフライン手紙作成アプリ。READMEは日英を用意する。
- 正式名称はレタリエ。旧開発名由来の`jp.ytec.binsen-kobo`、保存先、`.binsen`形式は互換用に維持する。表示名の変更だけを理由に内部識別子を変更しない。
- ルートとbusiness-appsのAGENTSを明示的に読む。現行Y-TEC Director（Luna Medium標準）の記録は`.ytec-director/`、一時証跡は`.local/`へ分離する。旧Astra経路はWorkspace共通方針では使用しない。
- BodyFlowと自由配置要素、表示レイアウト、出力、永続化、履歴、外観テーマを分離する。
- `.binsen`は現在状態のみ。過去履歴を通常ファイルへ混入させない。元フォント指定は不足時も保持する。
- 合成文書だけで検証し、保存失敗時に原本を保護する。単一writerを維持する。
- GitHub/Forgeアップロード、Store提出は完成品のユーザー確認前に行わない。
- Store Publisher/Identityを推測しない。秘密鍵をプロジェクトへ置かない。
