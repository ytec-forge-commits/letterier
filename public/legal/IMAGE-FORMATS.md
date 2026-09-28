# レタリエ 画像・素材の対応

2026-09-06。◎は通常利用、○は条件付き、△は試験対応、×は非対応。記載範囲での対応であり、全派生仕様を保証するものではない。

|形式|状態|条件・方式|
|---|---|---|
|JPEG / JPG|◎|WebView2の画像デコーダー。EXIF回転を反映。|
|PNG|◎|アルファ透過を保持。|
|WebP|◎ / ○|静止画は通常利用。アニメーションはGIFと同じコマ選択。|
|BMP|◎|一般的なBMP。破損や復号できない圧縮方式は拒否。|
|SVG|○|静的描画要素・属性・CSSの許可リスト。ベクターと透過を保持。外部参照、script、イベント、foreignObject、アニメーション、未対応フィルター等は拒否。|
|GIF|○|静止GIF、アニメーションは代表サムネイルと番号から1コマ選択。|
|HEIC / HEIF|○|WindowsのHEIF/HEVCコーデックが必要。最初の画像をsRGB PNGへ変換、EXIF回転を反映。|
|PSD|○|8bit RGBの保存済み統合画像。透過保持。レイヤーの選択・編集・再合成は行わない。|
|AI / PDF|○|PDF互換部分のみ。複数ページから選択。暗号化、XFA、注釈・スクリプトは利用しない。|
|PSB|×|将来の検証候補。|

SVGは静的サブセットの条件があるため目標表の◎から○へ分類した。HEICはOS非依存のlibheif-jsも調査したが、LGPL-3.0、同梱libde265およびHEVC関連の権利・配布条件を今回確定できないため同梱しない。OSコーデックの追加インストールや購入を自動実行しない。Windows 10/11の全構成でコーデック不要とは表示しない。

## 容量・保存・操作

入力は1ファイル16MiB。通常画像は4000万画素・一辺16384px、PSD/HEIC/AI/PDFの変換画像は1600万画素、変換PNGは概ね16MiBまで。SVGは2MiB、10000要素、深さ64。GIF/WebPは500コマ・合計2億画素、PDF互換素材は200ページまで。文書内の素材・元素材合計は64MiBまで。

`.binsen`形式2のZIP内`assets/{id}`に表示データ、特殊形式の`originals/{id}`に原本を格納する。`project.json`に元の名前・形式・選択コマ/ページ番号を保持し、外部ファイルを参照しない。再読込は保存済みキャッシュを使用し、別PCに元ソフトやHEICコーデックがなくても表示できる。原本の再変換UIは将来項目。キャッシュ欠損は黙って補完しない。形式1は保護履歴に旧原本を残してから読み込む。

移動、拡縮、比率保持、回転、透明度、複製、前面/背面、回り込み、追従/固定、罫線非表示は共通操作。

## PDF・印刷品質と検証

JPEG/PNG等は保存画像、HEIC/PSD/GIFはPNGキャッシュを使う。SVGは静的ベクターのまま。AI/PDFは300dpiを上限に1600万画素・一辺16384pxへ収めたPNGであり、ベクター出力ではない。本文・罫線・便箋飾りはベクターPDF。

Phase Aの合成7ラスター＋1SVGのPDFで7画像・SVGを含む96描画パスを確認。PSD/AIはブラウザーで色・透過・英字4書体・ページ選択・再読込を確認。Windows変換の合成HEICは120×80pxと色をネイティブテストで確認。物理プリンター、Windows 10、全形式の他PC持込・全派生圧縮・実iPhone機種ごとの互換は未確認。最終リリース検証報告と併読する。

## ライブラリ・配布条件

|部品|ライセンス / 条件|用途|
|---|---|---|
|WebView2 / Windows Imaging|Windows・WebView2の利用条件|標準画像、GIF/WebP、HEIC。OSコーデックをアプリへ再同梱しない。|
|@xmldom/xmldom 0.9.12|MIT|SVG解析・検査。|
|ag-psd 31.0.2|MIT|PSD統合画像。専用Worker、256MiBメモリ制限・30秒上限。|
|PDF.js 6.3.289|Apache-2.0|PDF互換AI/PDF。Worker・静的資源はローカル同梱、CDNなし。|
|CMaps / Foxit Type1 fonts|BSD-3-Clause|文字マップ・PDF標準代替フォント。|
|Liberation Sans 2.1.5|OFL-1.1|PDF.jsの旧GPL版を配布せず、公式2.1.5の未改変4書体へ置換。|
|PDF.js画像変換WASM|BSD / MIT / Apache-2.0|JBIG2、OpenJPEG、QCMS。各LICENSE原文同梱。QuickJS資源は除外。|
|png 0.17|MIT / Apache-2.0|Windows変換結果のPNG書出し。|

レタリエ本体のApache-2.0を第三者部品・フォントへ再許諾するものではない。元の著作権とライセンスを保持する。PDF資源は`public/pdf-assets/manifest.json`、手書き20書体は`public/fonts/manifest.json`にSHA256を記録。取得手順は`scripts/acquire-pdf-assets.py`と`scripts/acquire-fonts.py`。HEIC合成検証画像を生成したpillow-heif/Pillowは`.local`の検証用であり配布物には含めない。

## エラーと残課題

- 非PDF互換AI：PDF互換ではないことを示し、Illustratorの「PDF互換ファイルを作成」かPNG/SVG書出しを案内。
- 未対応PSD：8bit RGBへの変換、統合画像の保存、またはPNG書出しを案内。
- HEIC変換不可：Windowsコーデック未対応、サイズ超過、破損の可能性とJPEG/PNG書出しを案内。
- 巨大画像：具体的な容量・画素上限を示す。SVGは未対応の参照・要素を示す。

将来は実iPhone画像の検証拡充、OS非依存HEICの配布条件確定、PSDレイヤー選択、AI/PDFのベクター保持、元素材の再変換UIを検討する。Photoshop/Illustrator固有効果の編集再現は対象外。

参照：[Windows BitmapDecoder](https://learn.microsoft.com/en-us/uwp/api/windows.graphics.imaging.bitmapdecoder)、[ag-psd](https://github.com/Agamnentzar/ag-psd)、[PDF.js](https://github.com/mozilla/pdf.js)、[Liberation Fonts 2.1.5](https://github.com/liberationfonts/liberation-fonts/releases/tag/2.1.5)。
