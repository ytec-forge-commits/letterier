# 素材のライセンス

## 同梱フォント

指定の手書き風20種（23ファイル）は各著作権者のSIL Open Font License 1.1で配布する。本体のApache-2.0から除外する。フォント原本を改変せず、各ディレクトリのOFL.txtに著作権表示・条件を保持する。商用ソフトウェアへの同梱・再配布はOFLの条件を満たして行う。フォント単体を販売しない。

配布正本: `public/fonts/`。各ファイルの取得元・固定commit・SHA-256・サイズ: `public/fonts/manifest.json`。アプリ内「画面設定・使い方」からライセンス全文を読める。内部CSS名の分離はフォントバイナリの変更を伴わない。

取得日: 2026-09-06。Google Fonts公式リポジトリの固定commit `5e35378e6bda803962ee6fd257e444a7d459660d`。

- Klee One: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/kleeone) / [OFL](public/fonts/kleeone/OFL.txt)
- Yomogi: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yomogi) / [OFL](public/fonts/yomogi/OFL.txt)
- Yuji Syuku: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yujisyuku) / [OFL](public/fonts/yujisyuku/OFL.txt)
- Yuji Mai: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yujimai) / [OFL](public/fonts/yujimai/OFL.txt)
- Yuji Boku: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yujiboku) / [OFL](public/fonts/yujiboku/OFL.txt)
- Zen Kurenaido: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/zenkurenaido) / [OFL](public/fonts/zenkurenaido/OFL.txt)
- Yusei Magic: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yuseimagic) / [OFL](public/fonts/yuseimagic/OFL.txt)
- Mochiy Pop One: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/mochiypopone) / [OFL](public/fonts/mochiypopone/OFL.txt)
- Hachi Maru Pop: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/hachimarupop) / [OFL](public/fonts/hachimarupop/OFL.txt)
- Potta One: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/pottaone) / [OFL](public/fonts/pottaone/OFL.txt)
- Caveat: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/caveat) / [OFL](public/fonts/caveat/OFL.txt)
- Dancing Script: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/dancingscript) / [OFL](public/fonts/dancingscript/OFL.txt)
- Patrick Hand: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/patrickhand) / [OFL](public/fonts/patrickhand/OFL.txt)
- Kalam: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/kalam) / [OFL](public/fonts/kalam/OFL.txt)
- Indie Flower: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/indieflower) / [OFL](public/fonts/indieflower/OFL.txt)
- Shadows Into Light: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/shadowsintolight) / [OFL](public/fonts/shadowsintolight/OFL.txt)
- Architects Daughter: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/architectsdaughter) / [OFL](public/fonts/architectsdaughter/OFL.txt)
- Nothing You Could Do: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/nothingyoucoulddo) / [OFL](public/fonts/nothingyoucoulddo/OFL.txt)
- Reenie Beanie: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/reeniebeanie) / [OFL](public/fonts/reeniebeanie/OFL.txt)
- Kaushan Script: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/kaushanscript) / [OFL](public/fonts/kaushanscript/OFL.txt)

## テンプレート装飾（生成素材）

`public/template-art/` のPNGは、レタリエのテンプレート装飾用にCodex ImageGenで生成した素材です。既存の制作記録には生成日を2026-09-08と記載しています。文字・ロゴ・透かしは含めず、アプリ内のテンプレート表示に使用します。

`public/template-motifs/` の透過PNGは、本文領域の外へ配置するレタリエ専用素材としてCodex ImageGenで生成した素材です。既存の制作記録には全面再生成日を2026-09-14と記載しています。17種類それぞれに内容の異なる主役素材と `-companion` 付きの脇役素材を用意し、同じ画像を1枚の便箋内で複製配置していません。

2026-09-28、Y-TECの管理者から、便箋イラスト55点と製品アイコン・ロゴはCodexによる制作であり、現在の素材・ブランド条件で公開・再配布してよい旨の確認を受けました。現在の全55点およびブランドファイルのパス・SHA-256・サイズは [素材来歴台帳](public/legal/asset-provenance.json) に記録しています。配布物では `legal/asset-provenance.json` を参照してください。

制作モデルの詳細と第三者画像の入力・参照の有無は確認できていないため、不明として台帳に残しています。既存記録の制作日を、今回独立に確認した実行日時とは扱いません。この確認は素材単体の自由な再配布許諾や第三者の権利が存在しないことの保証ではありません。既存の [ブランド条件](BRAND_POLICY.md) と [ライセンス適用範囲](LICENSE_EXCEPTIONS.md) を維持します。

