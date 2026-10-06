# 素材のライセンス

## 同梱フォント

指定の手書き風20種（23ファイル）は各著作権者のSIL Open Font License 1.1で配布する。本体のApache-2.0から除外する。フォント原本を改変せず、各ディレクトリのOFL.txtに著作権表示・条件を保持する。商用ソフトウェアへの同梱・再配布はOFLの条件を満たして行う。フォント単体を販売しない。

フォントのソース正本はソースリポジトリの `public/fonts/` です。配布アプリにはフォントを内部リソースとして同梱し、著作権表示・OFL全文はこのディレクトリの [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) に収録しています。各ファイルの取得元・固定commit・SHA-256・サイズ: [font-manifest.json](font-manifest.json)。アプリ内「画面設定・使い方」からライセンス全文を読める。内部CSS名の分離はフォントバイナリの変更を伴わない。

取得日: 2026-09-06。Google Fonts公式リポジトリの固定commit `5e35378e6bda803962ee6fd257e444a7d459660d`。

- Klee One: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/kleeone) / [OFL](THIRD_PARTY_NOTICES.txt)
- Yomogi: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yomogi) / [OFL](THIRD_PARTY_NOTICES.txt)
- Yuji Syuku: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yujisyuku) / [OFL](THIRD_PARTY_NOTICES.txt)
- Yuji Mai: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yujimai) / [OFL](THIRD_PARTY_NOTICES.txt)
- Yuji Boku: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yujiboku) / [OFL](THIRD_PARTY_NOTICES.txt)
- Zen Kurenaido: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/zenkurenaido) / [OFL](THIRD_PARTY_NOTICES.txt)
- Yusei Magic: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/yuseimagic) / [OFL](THIRD_PARTY_NOTICES.txt)
- Mochiy Pop One: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/mochiypopone) / [OFL](THIRD_PARTY_NOTICES.txt)
- Hachi Maru Pop: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/hachimarupop) / [OFL](THIRD_PARTY_NOTICES.txt)
- Potta One: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/pottaone) / [OFL](THIRD_PARTY_NOTICES.txt)
- Caveat: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/caveat) / [OFL](THIRD_PARTY_NOTICES.txt)
- Dancing Script: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/dancingscript) / [OFL](THIRD_PARTY_NOTICES.txt)
- Patrick Hand: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/patrickhand) / [OFL](THIRD_PARTY_NOTICES.txt)
- Kalam: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/kalam) / [OFL](THIRD_PARTY_NOTICES.txt)
- Indie Flower: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/indieflower) / [OFL](THIRD_PARTY_NOTICES.txt)
- Shadows Into Light: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/shadowsintolight) / [OFL](THIRD_PARTY_NOTICES.txt)
- Architects Daughter: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/architectsdaughter) / [OFL](THIRD_PARTY_NOTICES.txt)
- Nothing You Could Do: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/nothingyoucoulddo) / [OFL](THIRD_PARTY_NOTICES.txt)
- Reenie Beanie: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/reeniebeanie) / [OFL](THIRD_PARTY_NOTICES.txt)
- Kaushan Script: [出典](https://github.com/google/fonts/tree/5e35378e6bda803962ee6fd257e444a7d459660d/ofl/kaushanscript) / [OFL](THIRD_PARTY_NOTICES.txt)

## テンプレート装飾（生成素材）

`public/template-art/` のPNGは、レタリエのテンプレート装飾用にCodex ImageGenで生成した素材です。既存の制作記録には生成日を2026-09-08と記載しています。文字・ロゴ・透かしは含めず、アプリ内のテンプレート表示に使用します。

`public/template-motifs/` の透過PNGは、本文領域の外へ配置するレタリエ専用素材としてCodex ImageGenで生成した素材です。既存の制作記録には全面再生成日を2026-09-14と記載しています。17種類それぞれに内容の異なる主役素材と `-companion` 付きの脇役素材を用意し、同じ画像を1枚の便箋内で複製配置していません。

2026-09-28、Y-TECの管理者から、便箋イラスト55点と製品アイコン・ロゴはCodexによる制作であり、現在の素材・ブランド条件で公開・再配布してよい旨の確認を受けました。現在の全55点およびブランドファイルのパス・SHA-256・サイズは [素材来歴台帳](asset-provenance.json) に記録しています。配布物では `legal/asset-provenance.json` を参照してください。

制作モデルの詳細と第三者画像の入力・参照の有無は確認できていないため、不明として台帳に残しています。既存記録の制作日を、今回独立に確認した実行日時とは扱いません。この確認は素材単体の自由な再配布許諾や第三者の権利が存在しないことの保証ではありません。既存の [ブランド条件](BRAND_POLICY.md) と [ライセンス適用範囲](LICENSE_EXCEPTIONS.md) を維持します。

## 2.0.0の追加素材と規約確認

2026-10-06に、OpenAIの個人向け利用規約（https://openai.com/policies/terms-of-use/）、Services Agreement（https://openai.com/policies/services-agreement/）、Service Terms（https://openai.com/policies/service-terms/）、Sharing & Publication Policy（https://openai.com/policies/sharing-publication-policy/）を確認しました。利用者とOpenAIの間では、法令の許す範囲で利用者がOutputを所有する一方、第三者の権利を侵害しない責任、出力の確認、AI生成である旨の開示が必要です。本アプリへの同梱範囲の確認であり、第三者権利の不存在・著作権成立・独占性を保証しません。素材単体の別ライセンス付与は行わず、既存のアプリ用素材としての扱いを維持します。

2.0.0では図案2〜5用の透過PNG160点を追加しています。参照画像を使わないCodex Imagegen生成、採用パスとSHA-256、目視確認の記録は、ソースリポジトリの [ASSET_PROVENANCE.md](https://github.com/ytec-forge-commits/letterier/blob/main/ASSET_PROVENANCE.md) に記載しています。直接配布ZIPにも同名文書を同梱します。上記asset-provenance.jsonは1.0.4時点の55点とブランド素材の履歴であり、新規160点を収載した記録ではありません。追加素材も本体Apache-2.0から分離し、アプリ用素材としての既存条件を維持します。

