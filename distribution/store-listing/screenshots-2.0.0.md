# 2.0.0 Store画像準備 / Store screenshot preparation

2026-10-02。ローカル候補・未アップロード / Local candidates, not uploaded.

## 撮影・確認 / Capture and checks

実際の2.0.0 frontend（`index-D1NGkB2s.js`）を専用headlessブラウザーで表示し、合成本文だけで操作・撮影した。Windows実機の起動・保存・印刷の合格証拠ではない。利用者Chromeの管理画面や個人情報は撮影していない。

Captured the actual 2.0.0 frontend in an isolated headless browser using synthetic letters. These images do not prove native Windows startup, file operations or printing. No user Chrome management page or personal information was captured.

- 再現手順: `vite preview --host 127.0.0.1 --port 1436 --strictPort`、新規Playwright CLI sessionで `http://127.0.0.1:1436/?capture=store-2.0.0` を開き、`tests/browser/manual-2-screenshots.cjs` をrun-codeで実行する。
- Without the `capture=store-2.0.0` query, the same script retains its 1280×800 manual capture mode and separate output names.
- 10枚すべて1536×960 PNG、50 MB未満。PNG IHDRとbyte数を読み取り確認。全10枚目視確認、pageerror/console error/console warning 0。
- All ten images were visually inspected. Controls and sample text are readable; the editor and Settings retain their normal scrollable view. Screenshots are not claims that the entire paper or every setting fits simultaneously.
- 旧画像は保持。追加の宣伝文・ロゴ・OSデスクトップは重ねていない。The old images remain unchanged; no marketing overlay was added.
- [Microsoft Desktop画像要件 / official screenshot requirements](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/screenshots-and-images)を撮影日に確認。Desktopの最小1366×768、PNG、50 MB上限に適合する寸法・形式。Storeの提出・審査結果は別途確認する。

## ファイル / Files

|言語 / Language|順序 / Order|画像 / Image|内容 / Content|
|---|---:|---|---|
|JA|1|[ja-01-stationery-2.0.0.png](images/ja-01-stationery-2.0.0.png)|便箋選択 / Stationery picker|
|JA|2|[ja-02-horizontal-writing-2.0.0.png](images/ja-02-horizontal-writing-2.0.0.png)|横書き・文字間隔・倍率 / Horizontal editing, spacing, zoom|
|JA|3|[ja-03-vertical-writing-2.0.0.png](images/ja-03-vertical-writing-2.0.0.png)|縦書き / Vertical writing|
|JA|4|[ja-04-text-box-2.0.0.png](images/ja-04-text-box-2.0.0.png)|独立した縦書き文字箱 / Independent vertical text box|
|JA|5|[ja-05-layout-2.0.0.png](images/ja-05-layout-2.0.0.png)|標準サイズ・段落設定 / Default body size and paragraph options|
|EN|1|[en-01-stationery-2.0.0.png](images/en-01-stationery-2.0.0.png)|Stationery picker|
|EN|2|[en-02-horizontal-writing-2.0.0.png](images/en-02-horizontal-writing-2.0.0.png)|Horizontal editing, spacing and zoom|
|EN|3|[en-03-text-box-2.0.0.png](images/en-03-text-box-2.0.0.png)|Independent horizontal text box|
|EN|4|[en-04-settings-2.0.0.png](images/en-04-settings-2.0.0.png)|Language, interface colors and larger controls|
|EN|5|[en-05-layout-2.0.0.png](images/en-05-layout-2.0.0.png)|Default body size and paragraph options|

## SHA-256

```text
05e0d74dcc925f0125b4a84d43274e3ec309c1829c67b20f01a1dd7e499d9f25  ja-01-stationery-2.0.0.png
9aade1543b024b8b189c8aa00d5418e6581b91e55189fc2690f75551afebf18d  ja-02-horizontal-writing-2.0.0.png
0d437418eb114c92484f51a40d54ce8bbd71141ce7769f9559d86170aaa9d2de  ja-03-vertical-writing-2.0.0.png
c1bd1d9153a9bcea208104fd5fa17d273b5513f0c6f954a11a2449919fbed5c8  ja-04-text-box-2.0.0.png
efaabd64b426b1e2c2ada2cd412a87901fd9e9461bf63be9279c82a30bfd5c1f  ja-05-layout-2.0.0.png
aa12506ffc9ac2dd91a6f8f0c23a6c4b575bd92e5298c1a52d4d051f79b63cc6  en-01-stationery-2.0.0.png
44405c723157b1825a0e22f3c4d6b6098156e0226fff16b3fedc677f11042c7a  en-02-horizontal-writing-2.0.0.png
07ac0d2ee5a51fd93f0e56b26d3ccfd48b5b3304bc167f09bc3a0d64ffa00d26  en-03-text-box-2.0.0.png
fc8425395a29032164fb18f95e9d752c3809d37484637a58c1cfe4063c773bcd  en-04-settings-2.0.0.png
816d0f26fb365d4711313e0b80bac70325468ee87a7c6222071da38829470531  en-05-layout-2.0.0.png
```
