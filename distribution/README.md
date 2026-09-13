# レタリエの配布準備

ベースversionは1.0.2、MSIXは1.0.2.0です。現段階は完成品のユーザー確認用で、署名済み配布物の公開・Forge掲載・Store提出は行っていません。ソースに秘密鍵やPartner Centerの推定Identityを入れません。

## ローカル確認用

`npm run build:native` で `.local/cargo-target/release/bundle/nsis/` に現在のユーザー向けNSISインストーラーを生成します。`scripts/package-review.ps1` はEXE・文書・全ライセンス・MPL対応ソースを新しい確認用フォルダーへまとめ、ZIPとSHA-256を生成します。署名前のハッシュは確認用であり、公開版のハッシュとして転用しません。

WebView2はOSに導入されたものを利用します。NSISの既定のdownloadBootstrapper方式は未導入時だけMicrosoftからRuntimeを取得します。既にRuntimeがあるPCではアプリの通常利用に接続は不要です。ポータブルZIPもRuntimeが必要で、自己完結型Runtimeを同梱しません。保存先はアプリデータ領域でありUSB内へ自動保存する意味の完全ポータブル方式ではありません。

## 直接配布

完成品承認後に、承認済みのY-TEC自己署名経路を確認します。最終アプリEXEを署名・検証し、そのEXEからNSISを再構成してインストーラーも署名・検証します。ポータブル版は署名済みEXEをまとめ、最終ZIPとinstallerにSHA-256を付けます。バイナリの再ビルド・差替え後は署名からやり直します。

署名証明書の秘密鍵をプロジェクトへコピーしません。利用者の証明書ストアへ自動登録せず、SmartScreen警告が消えるとも案内しません。公開用CERを付ける場合は公開鍵のみを使用します。署名プロバイダーはビルドコードへ固定せず、将来SignPath等へ変更できる運用にします。独自Updaterはなく、直接配布版は新しいinstallerで更新します。

## Microsoft Store

`scripts/package-msix.ps1` はPartner Centerで確定した `IdentityName` と `Publisher` を必須引数として受け取ります。SDKのMakeAppxでローカル未署名MSIXを作ります。Identityを入力しない状態では作成しません。

```powershell
./scripts/package-msix.ps1 -IdentityName <PartnerCenterのPackageIdentityName> -Publisher <PartnerCenterのPublisher>
```

Windows 10 build 19041以上、x64、full-trust desktop process、`.binsen`関連付けを宣言します。Storeの表示名はレタリエ、起動ファイルはレタリエ.exeです。Store版はStore更新を使い、直接配布版と機能は共通です。公開Storeパッケージに自己署名証明書を強制しません。Privacy文書、説明、スクリーンショット、年齢区分、予約名、最新のStore審査条件は提出前にPartner Center上で確認します。

現時点の未完了境界：正式Identity/Publisher取得、MSIX生成・インストール・WACK、Authenticode署名・検証、完成品のユーザー確認、各公開先への提出。いずれも今回のローカルビルド成功と区別します。

参考：[Microsoftの手動MSIX作成手順](https://learn.microsoft.com/en-us/windows/msix/desktop/desktop-to-uwp-manual-conversion)、[MakeAppx](https://learn.microsoft.com/en-us/windows/msix/package/create-app-package-with-makeappx-tool)。
