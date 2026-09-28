# プライバシー / Privacy

レタリエはオフラインのWindowsアプリです。アカウント、広告、アクセス解析、クラウド同期、アプリ独自の自動更新、文書や利用状況の送信はありません。手紙・画像・保存履歴・設定をこのPC内で処理します。

回復用データはWindowsが提供するアプリデータ領域の `jp.ytec.binsen-kobo/store` 配下に保存します。通常保存した `.binsen` とPDFは利用者が選んだ場所に書き出します。回復データは暗号化していません。共有PCではWindowsのユーザーアカウントを分けてください。アンインストール時も手紙を保護するため、回復データと利用者の保存ファイルは自動削除しません。

Windows、Microsoft Store、WebView2、プリンタードライバーやOSコーデックの通信・診断機能は、それぞれの提供元の設定と条件に従います。WebView2がないPCではインストーラーがMicrosoftのランタイム取得を案内します。利用者が選択したネットワーク保存先やプリンターはその接続先へデータを渡します。

Letter Atelier processes documents, images, history and preferences locally. It has no account, advertising, analytics, cloud sync, application updater or document upload. Recovery data is stored unencrypted in the Windows application data directory; exported files go to the location you select. Uninstalling does not delete your documents or recovery data. Windows, Store, WebView2 and printer services are governed by their providers. A network printer or storage location you choose receives the corresponding data.
