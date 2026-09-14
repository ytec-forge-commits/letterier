# Microsoft Store certification notes

## Japanese

レタリエはアカウントやログインを必要としない、ローカル動作のWindowsデスクトップアプリです。起動後すぐに編集画面が表示されます。

基本確認手順:

1. 「便箋を選ぶ」で任意の便箋を選択し、「この便箋で新しい手紙」を押します。
2. 用紙上をクリックして本文を入力します。左側の「書字方向」で横書き／縦書きを切り替えられます。
3. 「写真・画像」または「文字箱」から要素を追加できます。
4. 「PDF・印刷」でプレビュー、PDF保存、Windows印刷を確認できます。

アプリ独自の外部通信、広告、アクセス解析、クラウド同期、自動更新はありません。WebView2 Runtimeが未導入の場合のみ、WindowsインストーラーがMicrosoftのRuntime取得を案内することがあります。ネットワーク保存先やネットワークプリンターを利用者が選んだ場合は、その接続先へ対応するデータが渡ります。

`.binsen` はレタリエ専用の手紙ファイルです。アプリ本体とは異なる文書アイコンを使用します。サンプル文書、テスト用アカウント、外部機器は不要です。

## English

Letterier is a local Windows desktop application that requires no account or sign-in. The editor is available immediately after launch.

Basic certification flow:

1. Select **Choose stationery**, choose any design, and select **Start a new letter with this stationery**.
2. Click the paper and enter text. **Writing direction** switches Japanese horizontal and vertical writing.
3. Add content through **Photo / Image** or **Text box**.
4. Open **PDF / Print** to review the preview, save PDF, or use Windows printing.

The app has no application-specific external communication, advertising, analytics, cloud sync, or updater. If Microsoft WebView2 Runtime is missing, the Windows installer may direct the user to Microsoft's runtime acquisition flow. A network storage location or printer selected by the user receives the corresponding data.

`.binsen` is Letterier's document format and uses a document icon distinct from the application icon. No sample file, test account, or external hardware is required.
