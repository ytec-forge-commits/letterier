# 便箋図案の追加生成記録 / Additional stationery artwork provenance

## クラシック・パステルドット / Western all-season additions (2026-10-02 JST)

最新Windows再検証追記（2026-10-02 JST）: `index-OvbCngb2.js` の専用保存版で手動保存・回復データの分離、排他lock失敗後の入力なし自動再試行、2回の再起動後の明示復元を確認。[SAVE-RECOVERY-VALIDATION.md](docs/SAVE-RECOVERY-VALIDATION.md)に記録。専用出力版で13 PDF / 25ページの構造・全頁目視と実印刷プレビューを確認。[NATIVE-OUTPUT-VALIDATION.md](docs/NATIVE-OUTPUT-VALIDATION.md)に記録。下記の「未実施」は追記前の時点の記録であり、保存先OSダイアログでの成功・実プリンター送信・強制終了/電源断・正式配布判定は現在も未実施。

Codex built-in Imagegen、参照画像なし、transparent_background=true。16枚を1素材1呼出しで生成し、全原本を目視、public/template-motifsへ無加工・非上書きコピー。全16枚1254×1254、四隅alpha=0、原本と採用コピーのSHA-256一致。既存図案1の枠／水玉ベクター装飾は維持。20シリーズ各5図案が利用可能。全生成実行811の完了を受領、元画像を保持。

新しい図案の描画/保存巡回6 REDと本文/罫線回避8 REDを確認後、素材8組登録で近接5files/86tests PASS、全41files/316tests、12Rust、check/version/build PASS。最新production index-OvbCngb2.js（537.30kB）、既存500kB警告を保持。保存形式・版番号・依存変更なし。全図案browserおよび最新版保存/復元の実検証は下記のとおり完了。Windows最新版の実機検証・配布完成判定は未実施。

### 最新ビルドのブラウザー・独立レビュー / Latest browser and bounded review

- production `index-OvbCngb2.js`、専用合成profileで全20×5×縦横の200描画ケースを確認。画像decode、採用path、罫線との重なり0。全40新規作成フローで本文空、書字方向、図案5→1のページ追加とUndoを確認。
- 19追加シリーズの図案5→1巡回、桜3→4、Undo、日英選択を実操作。152PNGの透明/描画画素と四隅alpha≤1、19シリーズの英語5候補と375px preview巡回/横overflowなしを確認。classic/dotsの全20紙面画像と英語375pxの2画像を目視。既存図案1のSVGは維持。
- art/save/retryの3profilesともconsole errors/warnings 0。Windows最新版の再起動・PDF/印刷はこのブラウザー試験には含まない。
- assignment `ALL20-WESTERN-20261002-D`、Mill / `01a0f9d8-fd7f-7631-bde4-13d177676af8`：指定30files、5files/86tests、CJS構文5/5、16追加PNGの1254×1254 RGBA/重複なし、文書整合を読取専用レビュー。実不具合指摘なし。親の開始版・現在版・結果本文SHA-256全30件一致、同ID完了waitとclose応答を受領。実効model/Host不在はUNVERIFIED、ブラウザー/nativeの独立実測を意味しない。
- 初回のCLI起動はWindowsのコマンド長上限で失敗。CJS自体の構文を確認し、公式CLIの `run-code --filename` で同じファイルを実行して成功。製品コードの不具合として扱わない。

All 200 render cases, 40 new-letter flows, cycle/Undo interactions, 152 additional PNG alpha checks and 19 English five-design selectors passed on the identified latest bundle. Same-revision bounded review passed; native restart/output acceptance remains separate.

### 最終プロンプト / Final prompts

Prefix:

```text
Use case: stylized-concept. Asset type: all-season letter-writing stationery corner motif, ONE original transparent PNG. Subject:
```

Suffix:

```text
Style: refined hand-painted watercolor, calm elegant stationery, delicate visible brush texture. One isolated complete motif centered within square canvas; all content fits within 80% of canvas with fully transparent padding, readable at 46mm. Spaces between objects transparent. No surrounding pigment wash, glow, blurred halo, ground or cast shadow. No solid background, paper-background rectangle, checkerboard background, frame, text, lettering, logo, watermark or signature. Not a collage or asset sheet.
```

- `classic-v2`: One complete pale ivory feather quill with antique brass nib beside a small round burgundy wax seal embossed only with a simple abstract sprig, no letters.
- `classic-v2-companion`: One complete small burgundy wax seal with a simple abstract sprig embossing and one short narrow ivory ribbon curling behind it, no letters.
- `classic-v3`: One complete small antique brass skeleton key with ornate open oval bow and delicately weathered muted gold finish, diagonally composed.
- `classic-v3-companion`: One tiny complete antique brass key with a heart-shaped open bow beside a short muted lavender ribbon loop, no text.
- `classic-v4`: One complete open laurel wreath with delicate sage-green leaves and a tiny muted gold medallion at its base, thin elegant branches, empty transparent center, no crest lettering.
- `classic-v4-companion`: One small sage-green laurel branch beside a tiny round muted gold medallion embossed with a simple leaf, no lettering.
- `classic-v5`: Two complete small antique books stacked with muted plum and warm tan cloth covers beside one sealed ivory letter envelope; closed books, no cover text or markings.
- `classic-v5-companion`: One complete small sealed ivory envelope tied with a thin muted plum ribbon beside a tiny closed tan book, no writing.
- `dots-v2`: One cheerful small loosely arranged cluster of pastel pink, mint and pale lilac confetti circles with a delicate pale pink curled ribbon. Sparse airy composition, not a background pattern.
- `dots-v2-companion`: One complete small pastel mint ribbon bow beside three pastel pink and lilac confetti circles, delicate and airy.
- `dots-v3`: Three complete floating translucent soap bubbles of different sizes, subtle pastel pink, blue and mint iridescent rims, transparent interiors, no scene or reflection of people.
- `dots-v3-companion`: Two complete small overlapping translucent soap bubbles, delicate lilac and pale blue iridescent rims, transparent interiors, no scene.
- `dots-v4`: Three complete small pastel pink, mint and lilac balloons with fine cream curved strings loosely tied together, gentle matte watercolor shapes, no sky.
- `dots-v4-companion`: One complete small pastel lilac balloon with a fine softly curled cream string, gentle matte watercolor, no sky.
- `dots-v5`: Three complete small pastel pink, mint and lilac sewing buttons with four clearly visible holes beside one short cream thread curl, gentle hand-painted watercolor, no fabric background.
- `dots-v5-companion`: One complete small pastel mint four-hole sewing button and one loosely curled pale pink sewing thread, no fabric background.

### 原本と採用コピー / Original and selected copy hashes

| PNG | SHA-256 |
| --- | --- |
| `classic-v2.png` | `618B3D86DF1A306BF809F60E21E65A86A0A5DF55D83B7594B98A2F7CBA5EE591` |
| `classic-v2-companion.png` | `CFE9ABB05EC0843BB74547B06873DA49452E003A944DAAC69BF65CA39CF60F20` |
| `classic-v3.png` | `8966E3378C482E3B76D3243826D1286331C1B72D420C1CA9BA2EA8F0E0275E24` |
| `classic-v3-companion.png` | `C6A652E8EBA8854FE27713E8ED2C80806506DC03519D7B464272C26FF2B0FE7B` |
| `classic-v4.png` | `702EC7C43C60E764BA01B2F62345BB0038290E97FDEC907BA23CF3B293011438` |
| `classic-v4-companion.png` | `853276AE12FF95032AA99680428F29C66FD59BA479BCAA6E1064C9F5412F1902` |
| `classic-v5.png` | `6D5E31BA1F252A8FFF74101549C13AB398F13E5EDB51D448BE6A88C5417F0388` |
| `classic-v5-companion.png` | `FB23B5729F25B60C1163CE211A5629CB401C08D6836AEB7D9268E88D91E090F8` |
| `dots-v2.png` | `BE255517B097600B5FDCA6BCBB8ABFDCB21B16F3F910E623DA5645CD625B6D83` |
| `dots-v2-companion.png` | `A26A9BE704185B086A4E2AA07BCCF3FA6A958E497BC9476E615C91081E79C766` |
| `dots-v3.png` | `13441E68DB11C8F87D88134EC34119856D3450B074FAEE5A5C476E9B8C6EFC6C` |
| `dots-v3-companion.png` | `F98362192A13F3C3F5D3D507B4F4C4416C36BCA6AF5709B260C259E78B3B59F9` |
| `dots-v4.png` | `A9F4B58B445AD1D32FB3AF8B787AD0D8B4420F281B24B2F6D869345676D7D9B0` |
| `dots-v4-companion.png` | `31A2F58D9D48B4EAC40C742950FDC3197817181845FC1BB46A18CCABDC5EBE03` |
| `dots-v5.png` | `152CDDFB3A0C6238660B990E82903A4657957B8BF6C7BCF38C2981EB9243A5A8` |
| `dots-v5-companion.png` | `8A7C73956371B0D75890A435C48275C65ADA3346A6DA7155143EE99F637EFC6D` |

## 和紙・市松 / Japanese all-season additions (2026-10-02 JST)

- 最終限定review PERENNIAL-JAPANESE-20261002-B（Erdos、01a0f9c0-34b5-7e20-865c-d24c6d38bf41）は27files、52tests/4syntax PASS。17基礎素材と18追加seriesを混同した初回指摘は実数の再確認後に同担当が撤回。追加144PNGの重複SHAなし。親が全27の64hex hashを現在の正本と機械比較一致、同ID完了wait/close受領。実効model/Host不在はUNVERIFIED。親の実画面・nativeは独立再実測ではない。README日英を18/20へ更新し、manual日英の選択書式導線と巡回説明を補完。素材保存先はpublic/template-motifs、全最終promptは以下に記録。

- 同bundle index-BOK9f4YX.jsの専用profile letterier-perennial-art-oct2で直列に180紙面、36Newフロー、17追加seriesの5→1巡回/Undo＋桜3→4、136PNG全pixel alpha・17英語375選択を実操作PASS。今回2series全20紙面と2英語375画像を目視。罫線と絵の矩形重なり0、washi-v1画像なし/fiberSVGあり、console error/warning 0。最新保存/復元・abort後idle再試行も別profileで最終結果と読込bundleを確認PASS。303frontend/12Rust、check/version/build PASS。Windows最新版の再起動/出力は未実施。

Codex built-in Imagegen、参照画像なし、transparent_background=trueで16枚を生成。同じ生成実行の完了を待ち、全原本を目視後、public/template-motifsへ無加工・非上書きコピー。全16枚1254×1254、四隅alpha=0。原本とコピーのSHA-256一致。ブラウザーでの全pixel alphaと紙面確認はこの追記時点では実行中。

和紙v1は従来の繊維SVGと全面罫線を維持。追加PNG図案のみ本文・罫線の46mm装飾回避へ含める。4 RED → 21 PASS、近接7files/82tests PASS、全体41files/303tests、check/version/build PASS。最新bundle index-BOK9f4YX.js。既存500kB超chunk警告は残る。保存形式・版番号・依存関係変更なし。

限定layoutレビューWASHI-LAYOUT-20261002-A: Zeno（正規agent ID 01a0f9ba-5933-7912-86bb-c6b3aec0c8b6）の同ID完了wait、4files SHA256一致、21tests PASS、指摘なし、close応答受領。実効モデルUNKNOWN、Host不在独立証明なし。レビュー時のregistryはwashi-v2のみで、その後の7図案登録・画像・ブラウザー変更はこのレビューの対象外。

### 最終プロンプト / Final prompts

Prefix:

```text
Use case: stylized-concept. Asset type: Japanese all-season letter-writing stationery corner motif, ONE original transparent PNG. Subject:
```

Suffix:

```text
Style: refined hand-painted watercolor, delicate natural brush texture, calm elegant Japanese stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. Spaces between objects transparent. No surrounding pigment wash, glow, blurred halo, ground or cast shadow. No solid background, paper-background rectangle, checkerboard background, frame, text, lettering, logos, watermark or signature. Not a collage or asset sheet.
```

- `washi-v2`: One small airy S-shaped stream of delicate mica flecks, warm ivory and pale antique gold with visible fine particles and three tiny light tan paper fibers. Clearly defined curved decorative motif, no paper sheet or surface.
- `washi-v2-companion`: One compact loose cluster of warm ivory and pale antique-gold mica flakes beside two delicate pale tan paper fibers. Individual distinct flecks, no stream, paper sheet or surface.
- `washi-v3`: One complete slender bamboo branch with three slender sage-green leaves and a short pale warm-gray segmented stem. Restrained pale botanical watercolor, suitable for Japanese paper stationery, no surrounding wash or landscape.
- `washi-v3-companion`: Two complete slender sage-green bamboo leaves attached to one short pale warm-gray bamboo node. Compact botanical companion, no scenery or paper sheet.
- `washi-v4`: One complete small origami crane folded from warm ivory handmade Japanese paper with fine pale tan fibers visible only within the crane. Wings spread, three-quarter view, delicate light brown creases. No paper sheet, scenery or ground.
- `washi-v4-companion`: One complete tiny ivory origami crane in a different gentle side view, beside two short pale tan paper fibers. Delicate folded silhouette, no paper sheet or backdrop.
- `washi-v5`: One small open circular Japanese hemp-leaf geometric motif composed of fine pale antique-gold and warm-gray lines, with six complete angular leaf shapes around its center. Delicate watercolor linework, no solid fill or rectangular pattern background.
- `washi-v5-companion`: Two small complete Japanese hemp-leaf six-pointed geometric motifs in fine pale antique-gold and warm-gray linework, slightly different sizes, no solid fill, paper sheet or rectangular pattern background.
- `ichimatsu-v2`: One complete small open Japanese folding fan with restrained alternating indigo and cream square checks printed only on its fan leaf, pale warm-brown ribs and handle. Complete three-quarter view, no writing, ground or checkerboard background.
- `ichimatsu-v2-companion`: One complete small closed Japanese folding fan with indigo and cream checked folded leaf and pale warm-brown handle, beside one short cream cord. No open fan, writing or ground.
- `ichimatsu-v3`: One complete decorative Japanese braided cord knot, carefully interwoven muted indigo and ivory strands forming two symmetrical loops and two short tassel ends. Distinct natural fibers, no geometric background or other objects.
- `ichimatsu-v3-companion`: One small complete compact braided cord knot of muted indigo and ivory with a single short tassel. Natural interwoven strands, no fan, ground or background.
- `ichimatsu-v4`: Two complete little stylized plover birds in muted indigo and pale cream beside a short delicate indigo lattice twig. Gentle Japanese watercolor silhouettes with small visible beaks and wings, no ground or scenery.
- `ichimatsu-v4-companion`: One complete little muted indigo plover bird beside one small pale cream lattice sprig. Compact Japanese watercolor companion, no ground, text or scenery.
- `ichimatsu-v5`: One small gracefully curved band of traditional Japanese seigaiha ocean-wave arcs in restrained muted indigo and cream. Complete isolated tapering decorative motif with fine visible watercolor linework, no water landscape, ground, rectangle or background fill.
- `ichimatsu-v5-companion`: One compact cluster of three overlapping traditional Japanese seigaiha ocean-wave arcs in restrained muted indigo and cream, complete isolated decorative motif with fine watercolor linework. No water landscape, rectangular pattern or backdrop.

### 原本と採用コピー / Original and selected copy hashes

| PNG | SHA-256 |
| --- | --- |
| `washi-v2.png` | `CD9EDEA29CBE18F5FDBB9DB7BC0A9183F243A4D262DB4A9C59BC6C9EA35C41AA` |
| `washi-v2-companion.png` | `AE1FB68B67A18B0A4A3E6E98303C715141A73BEE657EC4E6C39F3F8BF71E20C6` |
| `washi-v3.png` | `256DF6D05BE7F12012AF2EC34A735477D30737829841440AAB61E797B02F4BD2` |
| `washi-v3-companion.png` | `EDFBEEAA01ADADA35EAD10B097206B6D81AA47837C8F47E4AF86F28AE37955EF` |
| `washi-v4.png` | `999345A9430631218A21D555A623DE5C1657F3065047090DD4F02033CD75B62D` |
| `washi-v4-companion.png` | `35EC0B8A17D5058C0D1A5A80A4C7B09216749E3F82744EBF63D39998F85B28CC` |
| `washi-v5.png` | `B4E00C12B4450F7B5CE5A1BEB921C563889496DB88CF533F79DC7D43A72B6046` |
| `washi-v5-companion.png` | `30384DAE5EF29BB4A679D05D5FF1F95A931DC039F4777091E080DA1042486D6E` |
| `ichimatsu-v2.png` | `6F07C99585F4680D25F4346E41EE8B941EE527295DAB67EAE77DD108BC5131FD` |
| `ichimatsu-v2-companion.png` | `9FECC0A9AF71B258D7B9B95583D44C8862D2741D6A3992F8CFA9D91FB4519484` |
| `ichimatsu-v3.png` | `CD1E8EC83F1845BCE012693DE96E66DABE1CB47A37CDC62DBD24D5C12D8E7400` |
| `ichimatsu-v3-companion.png` | `4E7095E18D2610E947B5407AD01892275236FBC985672C8CFBFF87202CE980D0` |
| `ichimatsu-v4.png` | `5006E62023BE99AC339A598C7019ED475C1A4313B3C594540A8AE5B09CA872BB` |
| `ichimatsu-v4-companion.png` | `83746AEBB9499D7F0BAB9F0A77D8211AC4D486BA746EEAF7EC2D6EC91FFEE0E0` |
| `ichimatsu-v5.png` | `2B2160E8EA2A376DC9B5630ACD9BEB2BDE79963E1469C42F277488666393C3F3` |
| `ichimatsu-v5-companion.png` | `0439F539CD61B7995AFC35669C7D99170D02DAC04D7A8A47B78D6EDB2A3A0FD8` |

実画面、New/巡回、最新保存/復元、Windows最新版、最終素材条件・配布物確認が残る。18/20シリーズに5図案の実装が揃った段階で、ゴール完了ではない。

## スノークリスタル・クリスマスリース / Western Winter additions (2026-10-02 JST)

- 確認専用5profilesをclose済み、CLI一覧no browsers。PID54736/67004/52876/45336/44220不在、既存preview PID61860を保持。git diff --check PASS、既存差分/tmpは保持。commit/push/公開なし。


- 直列の紙面再実行160casesもPASS、冬2seriesの全20紙面を目視し罫線・装飾の重なりやviewport混入なし。New32flows、15seriesの5→1追加/Undoと桜3→4追加、英語375choice2枚も確認。最新bundle上でunsaved取消/破棄・3文字目安/自動罫線・背景drag/resize/fit/applyを再確認PASS、page/console errorsなし。
- 独立review Anscombe（agent `01a0f9a6-39ed-7a92-9737-8ff0d279f51e`、assignment `WINTER-WESTERN-SAVE-20261002`）指定27filesは48tests・6syntax PASS。初回JSONがSHAでなく本文/bytesだったため受入せず、同担当のGet-FileHash再計算補正後、親が32+32hexと正本現hashを27件すべて機械比較一致。同ID完了wait/close応答受領。実効model UNKNOWN、Host不在独立証明なし。保存実装全体/nativeはreview対象外。


Codex built-in Imagegen、参照画像なし、transparent_background=trueで主役・脇役計16枚を生成。全原本を目視し、無加工・非上書きコピーで追加。既存素材・保存形式・版番号は変更しない。最終プロンプトは以下prefix + subject + suffixを単一スペースで連結。

### 最終プロンプト / Final prompts

Prefix:

```text
Use case: stylized-concept. Asset type: Western winter letter-writing stationery corner motif, ONE original transparent PNG. Subject:
```

Suffix:

```text
Style: refined hand-painted watercolor, delicate natural brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. Spaces between objects transparent. No surrounding pigment wash, glow, blurred halo, ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or asset sheet.
```

- `snowflake-v2`: One complete small antique streetlight with a slender dark blue-gray pole and glass lantern, a little pale white snow resting on its cap and base. Soft cream lantern interior, no glowing halo, street, ground or scenery.
- `snowflake-v2-companion`: Three distinct delicate six-armed pale icy-blue snow crystals floating beside a tiny frosted evergreen sprig. Fine visible watercolor edges, no streetlight, backdrop or surrounding wash.
- `snowflake-v3`: A complete pair of pale icy-blue knitted mittens joined by a loosely curved cream cord, with a few small white snow crystals beside them. Warm delicate yarn texture, no person, ground or scenery.
- `snowflake-v3-companion`: One small rolled ivory knitted scarf with two visible pale blue tassels and a tiny frosted pine cone beside it. Compact winter companion, no mittens, person, ground or scenery.
- `snowflake-v4`: One graceful complete winter twig with delicate frost on its slender brown branches and three tiny muted blue-gray berries. Airy ice-blue and cream botanical watercolor, no tree, ground or scenic backdrop.
- `snowflake-v4-companion`: Two small complete frost-edged sage-green leaves beside one tiny icy-blue six-armed snow crystal and a short fine twig. Compact botanical winter companion, no tree, ground or scenery.
- `snowflake-v5`: One complete little cottage with pale blue-gray walls, a steep roof topped with pale white snow, a short chimney and a tiny cream window. Three-quarter architectural watercolor view, no smoke, trees, ground or landscape.
- `snowflake-v5-companion`: One small complete pale blue-gray mailbox with a rounded cap topped by a little snow, beside two tiny six-armed icy-blue snow crystals. No lettering, cottage, ground or scenery.
- `christmas-v2`: One small complete evergreen Christmas tree with restrained sage-green needles, tiny muted red and antique-gold baubles, a small antique-gold star on top and visible warm brown trunk. No lights or glowing halo, gifts, ground or scenery.
- `christmas-v2-companion`: Two small complete round Christmas baubles, one muted red and one pale antique gold, with fine cream hanging loops, beside one short sage-green evergreen sprig. No tree, ground or scenery.
- `christmas-v3`: One complete small red-and-cream Christmas stocking with a folded knitted cuff beside two complete cream gift parcels tied with sage-green and muted red ribbons. No written labels, fireplace, ground or scenery.
- `christmas-v3-companion`: One small complete cream gift parcel tied with a muted red ribbon and a sage-green holly twig with three small muted red berries. No stocking, written tag, ground or scenery.
- `christmas-v4`: One complete ivory pillar candle with a tiny natural amber flame in a small antique-gold candleholder, beside a short sage-green evergreen sprig and three muted red berries. No glow or light rays outside the flame, ground or scenery.
- `christmas-v4-companion`: Two small complete ivory taper candles with tiny natural amber flames in delicate antique-gold holders, joined by a short muted red ribbon. No halo, light rays, ground or scenery.
- `christmas-v5`: Two complete small antique-gold Christmas bells tied with a muted red ribbon, surrounded only by three distinct sage-green holly leaves and tiny muted red berries. Delicate metallic watercolor, no hanging frame, ground or scenery.
- `christmas-v5-companion`: One small complete antique-gold bell with a cream hanging loop beside a compact sage-green holly sprig and three muted red berries. No bow, ground or scenery.

### 原本と追加ファイル / Originals and copied files

| 追加PNG | 原本basename | SHA-256 |
| --- | --- | --- |
| `snowflake-v2.png` | `exec-608e4e53-e2b6-4d01-94b2-3741a3dc7bc0.png` | `321D7975149C9E063420F807E1246455869D65E5D43827215B993EF4E4454B9F` |
| `snowflake-v2-companion.png` | `exec-b63a2252-51ef-4f4c-89a8-9d43003257d7.png` | `554D110677E5F5B5CCF7AF2D075130F6DF3023A056315CD9D589203A64843B78` |
| `snowflake-v3.png` | `exec-5d47de24-67c9-4dde-8dde-2a1d59d0a318.png` | `EA92B47F3834F0221099F9545D990CECE5538EB56EF4B5F17D25933FCF5BA0FE` |
| `snowflake-v3-companion.png` | `exec-faf08a24-4188-4a99-9bbf-4095fbc3a873.png` | `476082627CAFEEB5A5E5BD4D86044C5C6D80E58EBB8C16905F8D505A44411E9D` |
| `snowflake-v4.png` | `exec-13ae6c4b-e860-440e-8695-716ba4ac2a70.png` | `CF75E1C779A36CA441E73FD19092B14B31631020785C397B7A9090169D5CC820` |
| `snowflake-v4-companion.png` | `exec-22dd536a-dc16-4d2d-9066-e22b98da504f.png` | `EB330DBACC373EAAE49A1C836BF39FD22C9A403B1F8ECB388F00028202239EAC` |
| `snowflake-v5.png` | `exec-5020b7c4-f554-43e6-a370-cf80a7c2c23d.png` | `124EC0A63DC2ABE2B7814F34135EAC1169CFC9707DCBD59DB630C72B0FDDE8FC` |
| `snowflake-v5-companion.png` | `exec-2a67ef82-6789-40b6-b3f5-06b1e98e0fb4.png` | `773F54C45DADBBA6AE8E28FBFE33499717BB3AA9CE68CDA9D7F0F9E8E22C1402` |
| `christmas-v2.png` | `exec-030b12b7-df8e-4007-9d28-177a69992b56.png` | `399D7C60F183AE1920FF981F953D09049A459F883D3C7EAF927C3445A1854A91` |
| `christmas-v2-companion.png` | `exec-21c16647-208a-488f-abcd-83c18142ea4b.png` | `C59EC316C71B0ACA3E0C650137DE8D9D30C44A82CE89BAD7D190B376482C45BC` |
| `christmas-v3.png` | `exec-335dad2f-3fe3-4110-929c-464ab49498ce.png` | `753E0BE4A6E66A52E20ECCF6416F1A1D4F3803B71B26D89444D108EBAA33BAB3` |
| `christmas-v3-companion.png` | `exec-ff57a727-5b6e-4b9d-af42-40ddb7fc2abe.png` | `D07AB9A6F859B820F602BB46BA6AE407E3F6B49E1F8A07DB340C6FA12E0B9950` |
| `christmas-v4.png` | `exec-b6219e20-08fc-470c-bdc9-ad111ae5124a.png` | `1505A6B49BEDBFD43FE5E7CE05C96CFCB80DF130FD77324A588D6EA9D94A0BF4` |
| `christmas-v4-companion.png` | `exec-51d5e6de-8ade-4454-aa14-f96f5f429edb.png` | `1C618777280D951D6447299777AE5DE6C1914A3F51CC22BE6185392A456A24F2` |
| `christmas-v5.png` | `exec-e5511115-1b24-48b8-9372-cf9754bd1a2d.png` | `CADCB72A0D1BA6AEF73B6A754A00A4B50839585641525E9B2AF547C2BE2381E1` |
| `christmas-v5-companion.png` | `exec-92dcd5c1-5cf6-47ee-974d-6610abe5c8a5.png` | `E6AC46C6FE53E2D7BB7795A369B83591EFBF74158FF00D0146DB310E1860562B` |

### 確認範囲 / Verification scope

- TDD: 冬2seriesの表示・5→1循環を追加し4 REDを確認後、8素材pair登録。全体41files/295tests PASS、check/version/build、Rust12tests PASS。
- 初回全体は3件（フォントhash・既存素材読込・bundle graph）が時間制限超過。コード・時間制限は変えず再実行295 PASS、明示maxWorkers=2も295 PASS。原因は確定せず一時的負荷と整合する観測として記録。buildの既存500kB超chunk警告あり。
- 追加PNG16は1254×1254、transparent/painted pixels両方あり、四隅alphaすべて0を実decodeで確認。プロンプト80%余白は要求値であり、全画素で保証した実測値ではない。
- 16series×5×縦横の160casesで画像path/decode・罫線とのbbox重なり0、pageerror空。英語375pxの15series・120PNG alpha検査PASS。初回paper screenshotの一部に同profile並行検証のviewport切替が混入したため、紙面目視証跡は直列再実行の結果のみ採用する。
- 保存ロジック追加変更なし。latest index-Bi6T2RUl.jsの実IndexedDB保存・回復・履歴復元前保護・破損非上書き/修復後回復・375px破損modalがPASS。ネイティブ最新版や電源断/容量不足/同時起動へ拡張しない。
- 通年4seriesはまだ追加図案未制作。独立レビュー・紙面直列再確認の最終結果は本節冒頭に追記。完成・配布判定ではない。



## 秋色リーフ・森の実り / Western Autumn additions (2026-10-02 JST)

- 独立レビューArendt（agent `01a0f98c-961a-7f43-9786-d77815ec7791`、assignment `AUTUMN-WESTERN-20261002`）は指定27ファイル（11コード/説明＋16PNG）限定PASS。3files/44testsとbrowser4 syntax PASS、PNG16decode、うち4目視。初回1hashの転記漏れを同担当の独立再計算32+32補完で訂正、親が27件を機械比較し、正本の現hashも全一致。同ID完了wait→close応答受領。要求と観測を分け、実効モデルUNKNOWN、Host不在独立証明はなし。
- 確認専用4browserをcloseし、CLI一覧はno browsers。保存3profileのPID32360/63748/21748不在を確認。ribbon/art profileは初回open出力不明のため元PID不在を独立確認したとは扱わない。既存preview PID61860/port1421は保持。既存tmpと他の差分は削除せず、commit/push/公開なし。


Codex built-in Imagegenで参照画像なし・transparent_background=true、主役／脇役を各1枚、計16件生成。原本は本スレッドのgenerated_images配下に保持し、目視後、無加工・非上書きコピーで追加。既存素材・保存形式・版番号は変更しない。最終プロンプトはprefix + subject + suffixを単一スペースで連結。

### 最終プロンプト / Final prompts

Prefix:

```text
Use case: stylized-concept. Asset type: Western autumn letter-writing stationery corner motif, ONE original transparent PNG. Subject:
```

Suffix:

```text
Style: refined hand-painted watercolor, delicate natural brush texture, muted rust orange, cream, warm brown and sage green, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. Spaces between objects transparent. No surrounding pigment wash, no glow, no blurred halo, no ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or asset sheet.
```

- `autumn-leaf-v2`: A small open-centered wreath made of distinct muted orange maple leaves, golden oak leaves and two tiny brown acorns. Complete airy ring visible, no ribbon, scenery or backdrop.
- `autumn-leaf-v2-companion`: Two loosely overlapping muted orange maple leaves beside one small golden oak leaf and one brown acorn. Compact botanical companion, no wreath, ground or scenery.
- `autumn-leaf-v3`: One complete open pale cream umbrella with a curved wooden handle, decorated by three separate muted orange autumn leaves drifting beside it. Slight three-quarter view, no rain, person, ground or scenery.
- `autumn-leaf-v3-companion`: One small closed rust-orange umbrella with a wooden curved handle beside two golden fallen leaves. Complete compact object, no open umbrella, rain, ground or scene.
- `autumn-leaf-v4`: One complete small warm wooden park bench with delicate dark iron legs and two muted orange leaves resting on the seat. Three-quarter view, empty bench, no people, park, ground or scenery.
- `autumn-leaf-v4-companion`: Three separate golden and rust-orange fallen leaves beside two tiny acorns and a short fine twig. Small airy autumn companion, no bench, park, ground or scenery.
- `autumn-leaf-v5`: Three delicate pressed autumn leaves: a rust-orange maple leaf, a golden ginkgo leaf and a warm brown oak leaf, arranged diagonally with visible fine veins and slender complete stems. Flat botanical specimen motif, no backing paper, glass, frame or background.
- `autumn-leaf-v5-companion`: A small golden ginkgo leaf beside one slender rust-colored fern frond and a warm brown seed pod. Complete flattened botanical specimens, no paper, frame or background.
- `woodland-v2`: One small complete warm brown red squirrel sitting upright holding a brown acorn in its front paws, its soft bushy tail curves behind it. Gentle natural anatomy, no clothes, tree, ground or scenery.
- `woodland-v2-companion`: Two complete brown acorns with textured caps beside one small sage-green oak leaf and a single golden leaf. Compact woodland harvest companion, no squirrel, ground or scenery.
- `woodland-v3`: One small complete woodland hedgehog with warm brown textured quills and a pale cream face, gently sniffing one tiny chestnut with an open green-brown husk. Natural side view, no clothes, ground or scenery.
- `woodland-v3-companion`: Two small woodland mushrooms with muted tan caps and cream stems beside one golden fallen leaf. Complete mushroom silhouettes including stem bases, no hedgehog, soil, grass or scenery.
- `woodland-v4`: One small complete woven wicker basket containing brown acorns, chestnuts, tiny muted red rose hips and two sage-green leaves. Complete curved basket handle, delicate cream linen lining, no labels, ground or scenery.
- `woodland-v4-companion`: One open chestnut husk with a glossy brown chestnut beside a short twig carrying three muted red rose hips and two sage-green leaves. Compact forest-fruit companion, no basket, ground or scenery.
- `woodland-v5`: One small complete woodland tree stump with visible growth rings on top, warm brown bark, two tiny tan mushrooms at its side and a little sage-green moss attached to the bark. Complete stump outline, no roots spreading into soil, ground or scenic forest.
- `woodland-v5-companion`: One short complete warm brown fallen twig beside two acorns and a tiny tan mushroom with a cream stem. Airy woodland companion motif, no stump, soil, ground or scenery.

### 原本と採用ファイル / Originals and accepted files

| 採用ファイル（public/template-motifs） | 原本basename | SHA-256 |
| --- | --- | --- |
| `autumn-leaf-v2.png` | `exec-7cd05a95-7adb-493d-9eaf-78bf226c6c9b.png` | `7ADBFEAA60BC1DBAC582B16227CF2E60D31BCCFCF15AF2DEDA487A55994CFCC2` |
| `autumn-leaf-v2-companion.png` | `exec-cd2ec6be-565a-42c7-addb-96a4f363715f.png` | `256CBCA4D875857F2B26DBBC0E30D784B37C5D88B86797CA7DD03D83860BC974` |
| `autumn-leaf-v3.png` | `exec-892bb8c6-bb1d-44d6-b176-88426e19eae5.png` | `F5BE5E077A102E802344C0C7CFE3801281B914D0B7C2B4C0DF8ABF7851097ADA` |
| `autumn-leaf-v3-companion.png` | `exec-96ca9217-91f4-4bcd-8655-b96998b131da.png` | `952684B45245D01CF0D5D298F5405D07F8EECA4ECE0A3733E51A59FFC30EDB6C` |
| `autumn-leaf-v4.png` | `exec-32820e0a-97de-469b-87d4-58668e8d9814.png` | `D788B9E1737B4EEF630C72811040B784BFA9E3C065C166CE0CDC29AEC7A37D36` |
| `autumn-leaf-v4-companion.png` | `exec-d0607f6b-d66c-46ac-ab0c-b391f918d392.png` | `2D5FB84EE6C05B0729E20A1F002CB84D157CB606539560EA3A20FFDED05AF6AA` |
| `autumn-leaf-v5.png` | `exec-b5fca996-b912-4093-b47c-3063480c91c3.png` | `4AB358ACB28FB7F817AC14DE10716A67C144837AB8580A65639713AC9D4C74B2` |
| `autumn-leaf-v5-companion.png` | `exec-b7cb2635-64fc-445d-bda2-c9b22704bbe2.png` | `EDFB00E66C8816F0C081CB44F32678BAB081FF8CA921D31D364CAF0A117E3049` |
| `woodland-v2.png` | `exec-0ca82912-a6ba-4d2a-a339-926c5df4d01c.png` | `4D3F792B4D04500078D2D6E3194DFDA819C1C206538603A60086DA503AEC4574` |
| `woodland-v2-companion.png` | `exec-377151ea-a114-419b-9d62-46168e3f8ef5.png` | `ABF62BC5D15B1540656E360859A5AF51D19DB37B76A4CA53F31B7A9504A342A7` |
| `woodland-v3.png` | `exec-cf4c7998-98b7-4bfc-9d49-fd0c90688c08.png` | `CDDBC0D13636CADFA433D2ADF98C2E26BED6795ED5E58FE8838559CAA221BC22` |
| `woodland-v3-companion.png` | `exec-1334147a-c6de-4fa6-9deb-3b4a3eeefda0.png` | `3477B39B686796E6330E67E9AA5B54CCF341C712CB4495E87836073CC0A5CDC0` |
| `woodland-v4.png` | `exec-27155d7f-1a8f-4acb-a7ab-88a7462f5e67.png` | `2EC40ADAF733BDF7DBA118D26BCCA87FB5D0815E73B841D5AA0473928D827498` |
| `woodland-v4-companion.png` | `exec-6deca001-094c-4bdc-b34a-d88eb5d1f80e.png` | `4B6873092A7E63BD68A1EAC28E637480D0E7AF3D496CFFE494BD6DA1E038F032` |
| `woodland-v5.png` | `exec-d2437fda-c3a6-4ad6-b19f-6acf427eff63.png` | `E25C91787601454359C0B32E97549DC476A18C50166D39169071C6BFB183C314` |
| `woodland-v5-companion.png` | `exec-4c66ff23-32a3-4be7-b14c-e204a72f986b.png` | `7C3B1BA75644358790912C52352B4381B1F4B4989A54CA7FDCB41CA776BF5E7D` |

### 確認・限界 / Verification and limits

- 16原本と秋の縦横20紙面・英語375px選択2画面を目視。葉のリース／傘／ベンチ／押し葉、リス／ハリネズミ／収穫かご／切り株と各脇役を採用。生成指示の80%内収容を厳密に保証せず、原本の物体が切れていないことと紙面上の収容を確認。
- 16枚すべて1254×1254、透明と描画画素を実測。autumn-leaf-v2/v5の左下のみalpha 1/255、残りの新素材の全隅は0。既存許容≤1/255で合格、無加工のまま保持。桜を除く追加素材104PNGも同検査でPASS。
- TDD: 登録前3files/44testsで4FAIL、登録後44PASS。全体41files/291tests、check/version/build、Rust12件PASS。最新bundle `index-C1Zxv-vn.js`。既存500kB chunk警告は継続。
- 実ブラウザー140組（14シリーズ×5図案×縦横）の画像パス/decodeと罫線bbox交差0、28新規作成の本文空・方向・5→1巡回・ページ追加Undo、13シリーズ便箋変更巡回と桜3→4を操作確認。13シリーズ英語5選択肢/プレビュー巡回/modal375横はみ出しなし。pageerror/console error/warning 0。
- 最新実IndexedDB保存・復元・保護版・破損保持と修復、初回abort後のidle再試行、v2手動download内容を再確認。[保存検証](docs/SAVE-RECOVERY-VALIDATION.md)参照。長文・全混在フォントとの全組合せや最新Windowsダイアログ/PDF/印刷試験の代替ではない。
- この工程で英語Save/Copy/保存tooltipの限定修正も行い、3RED→20PASS、日英375px/キーボード操作と独立レビューを確認。未制作拒否browser fixtureは制作済みLemonから未完成Dotsに変更。
- 図案追加は20シリーズ中14まで完了、残6シリーズの図案2〜5は未制作。素材の配布前サービス規約確認・legalコピー同期・最終ローカル配布物は未完で、画像へのApache-2.0自動適用はしない。

Sixteen original transparent PNGs were added without editing or replacement. The fourteen completed series passed 140 horizontal/vertical artwork checks, 28 new-letter flows, cycle/undo and 375px English previews. All 291 frontend and 12 Rust tests passed. Native output, all mixed-font/artwork combinations, and distribution/legal gates are not proved by these browser checks. Six series remain unfinished.


## シーサイドブルー・レモンの便り / Western Summer additions (2026-10-02 JST)

Codex built-in Imagegenで参照画像なし・transparent_background=true、主役／脇役を各1枚、16件生成。原本はCodex generated_imagesの本スレッドID配下に保持し、下記basenameから無加工・非上書きコピー。既存素材・保存形式・配布版番号は変更しない。最終プロンプトはprefix + subject + suffixを単一スペースで連結。

### 最終プロンプト / Final prompts

Prefix:

```text
Use case: stylized-concept. Asset type: Western letter-writing stationery corner motif, ONE original transparent PNG. Subject:
```

Suffix:

```text
Style: refined hand-painted watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.
```

- `seaside-v2`: One small complete wooden sailboat with ivory triangular sails and a pale blue hull, gentle thin pale turquoise wave strokes just around the hull. Side-on view, complete mast visible, no sky, horizon or filled sea surface.
- `seaside-v2-companion`: A little cream seashell beside a loosely coiled ivory sailing rope and one smooth pale blue sea-glass pebble. Compact isolated nautical still life, no boat, ground or scenery.
- `seaside-v3`: One small complete white coastal lighthouse with restrained pale blue bands, a dark gray lantern cap and a tiny cream shell at its foot. Delicate architectural watercolor, no buildings, rocky island, ground, sky, light beam or scenic backdrop.
- `seaside-v3-companion`: One tiny white seabird with muted gray wing tips gliding above a little pale pink spiral seashell. Complete bird silhouette visible, no lighthouse, sky, ground or landscape.
- `seaside-v4`: One branching pale coral-pink sea coral beside two tiny blue-green fish with delicate fins. Compact airy underwater motif, complete coral branches and fish visible, no seabed, water fill, bubbles or scenic backdrop.
- `seaside-v4-companion`: A small ivory starfish beside a delicate short coral-pink branch and a tiny pale blue seashell. Separate compact companion objects, no fish, ground or underwater backdrop.
- `seaside-v5`: Three small pairs of barefoot footprints pressed into individual pale sand-colored patches, curving diagonally beside one ivory seashell and a few fine pale turquoise wave strokes. Only isolated footprint-shaped sand patches, no continuous sandy ground, shore, sky or landscape.
- `seaside-v5-companion`: Two small pale cream and pink seashells beside three smooth pale blue sea-glass pebbles and a gently curved thin turquoise wave stroke. Compact seaside companion, no footprints, sand ground or scenery.
- `lemon-v2`: One small complete clear glass lemonade pitcher with a pale yellow lemon slice inside and two sage-green mint leaves near its narrow spout. Delicate pale blue glass reflections and subtle pale yellow liquid, complete curved handle visible, no labels, table, ground or scenery.
- `lemon-v2-companion`: One little clear glass tumbler containing pale yellow lemonade with a thin lemon slice on its rim and a small sage-green mint sprig beside it. Compact still life, complete glass visible, no pitcher, tabletop, ground or scenery.
- `lemon-v3`: A graceful lemon-tree twig carrying three small ivory five-petalled blossoms with yellow centers, one tiny yellow lemon bud and elongated sage-green leaves. Complete short twig visible, airy botanical watercolor, no tree trunk, pot, ground or backdrop.
- `lemon-v3-companion`: Two separate small ivory five-petalled lemon blossoms with golden stamens beside one elongated sage-green leaf and a tiny closed flower bud. Delicate compact botanical companion, no long branch, ground or scenic backdrop.
- `lemon-v4`: One small complete woven wicker harvest basket holding three bright pale-yellow lemons and a few elongated sage-green leaves. Subtle cream linen lining, complete curved basket handle visible, no label, tabletop, ground or scenery.
- `lemon-v4-companion`: One whole pale-yellow lemon beside a short slender lemon-tree twig with two elongated sage-green leaves and one small ivory blossom. Compact harvest companion, no basket, tabletop, ground or scenery.
- `lemon-v5`: One small complete round lemon tart with a pale golden fluted pastry edge, smooth pale yellow filling, a thin lemon slice and two sage-green mint leaves on top. Slight three-quarter top view, no plate, fork, table, ground or scenic backdrop.
- `lemon-v5-companion`: One small triangular slice of lemon tart showing pale golden pastry and pale yellow filling, beside a thin lemon wheel and a sage-green mint sprig. Complete slice visible, no plate, whole tart, table, ground or scenery.

### 原本と採用ファイル / Originals and accepted files

| 採用ファイル（public/template-motifs） | 原本basename | SHA-256 |
| --- | --- | --- |
| `seaside-v2.png` | `exec-10d2b38c-2f77-4e71-a1f9-8b6bd282abd2.png` | `EF9991BEEF4F290F82C67404D977364DCA3F8A78EB77FEB50E52C7726804276C` |
| `seaside-v2-companion.png` | `exec-22ddf492-bddf-4faa-9406-4276346018ab.png` | `624083CDF9B0E281210904E8E6047389E2DD4D267CB2B4DA9D6083D8F5999D23` |
| `seaside-v3.png` | `exec-0a733626-e659-43d7-8407-15e8948f4ea1.png` | `C1A059ADF78C0F4628DC344542D917A8FB15CBC425520972615C6B20EC67D08F` |
| `seaside-v3-companion.png` | `exec-b3aa52d8-1c55-4094-abfc-c89e4c3b214b.png` | `8BAF86799FFC7DC60C4E502AB073720A9311F85EF2DA36C1E518CE91CF798E28` |
| `seaside-v4.png` | `exec-c8da4417-47d0-4179-8fa1-ce9ee990f14a.png` | `33B5FAD1F1A5ACC2F7AD87180049E7AB1E943A65A9A1B00D25CA497AB86107D0` |
| `seaside-v4-companion.png` | `exec-9a7e8cbc-f85f-4e08-b52e-7addae63ecec.png` | `C67DB3E83097AB5A80042D7F625DA15C1B841215479E7F484D9FC5312E86C94D` |
| `seaside-v5.png` | `exec-dc60eda9-fa80-497e-902e-db74370a28fb.png` | `8734B3CE88EA48CAFDF388B0E8FC59C78ED39FAB6735828B0D88626FE1D3CDE0` |
| `seaside-v5-companion.png` | `exec-52154475-fa76-4c24-8133-d8e4f23385b8.png` | `1F4A075FD61445197FA301B62C71B2BF2AA237C2CFBD8F26435F36E55C31BEC7` |
| `lemon-v2.png` | `exec-c428609c-4b30-4535-a786-760f30079e48.png` | `5EC18BF6C4C8B70B12B9785043829C2C379A6E679302E8E4C714E7D74D8A36F1` |
| `lemon-v2-companion.png` | `exec-5ce9d7cd-be07-4da5-8d5c-abe8e926a3d6.png` | `28102A78300B9C1A3896539EAD2B05C8557974F3A8481776F3502656D3FB7442` |
| `lemon-v3.png` | `exec-e98bb62b-0161-404d-95f8-bfcb2d54eda5.png` | `9EC292552245762C0DCF4FF873BBB005F092B03081661746AE023767F69EF4B1` |
| `lemon-v3-companion.png` | `exec-5a8b2e39-24c0-4b44-bdd7-69c83092cce9.png` | `82DA47607706967CFD98AEE6CAFEDE251B1B468036054AB34D591619AEAC5931` |
| `lemon-v4.png` | `exec-ea947554-b420-4033-a7d8-bd36b4523f31.png` | `58F0E13C9B4E22D2B9A909B44D9A1E01F45451FB652CAE152680340DA9BAEFD5` |
| `lemon-v4-companion.png` | `exec-dcf64cba-0e2a-454a-b758-684364fade68.png` | `56807C92E124355066D8B68A68FC0FB395713109C547E98D70845627E4E295D8` |
| `lemon-v5.png` | `exec-2c2eeb89-d2f5-4628-be7e-df95a5ba40aa.png` | `8012979F6566CFFF85C23870D9B008D1AE97794523002D0761490DA5AB818260` |
| `lemon-v5-companion.png` | `exec-09f1210b-b6ec-409b-aa1a-f0e9d210956f.png` | `36670897E8329327D75C11AE6A576067614C9AF3EBB512EF86E47352CA93FDA9` |

### 確認・限界 / Verification and limits

- 16原本を目視。独立したヨット／灯台／サンゴ／砂の足跡と、レモネード／花／収穫かご／タルト、およびそれぞれの脇役を採用。物体全体は見えるが、生成指示の80%内収容を厳密に保証するものではない。レモネードのガラス部分には白・青の反射と液体を描画しており、全面透明を意味しない。
- 16枚すべて1254×1254、透明・描画画素の双方を実測。lemon-v3、lemon-v4、lemon-v4-companionの左下のみalpha 1/255、他の新素材の全隅は0。既存許容値≤1/255で合格、原本は加工しない。全88追加PNG（桜を除く）も同検査で合格。
- TDD: 登録前3 files / 40 testsで4 FAIL、登録後40 PASS。未制作拒否fixtureは今後制作済みになるlemon-v2から未制作dots-v2へ移動。全体41 files / 283 tests、check/version/build、Rust12件PASS。最新bundle `index-B5VGzpEm.js`、既存500kB chunk警告は継続。
- 実ブラウザー120組（12シリーズ×5図案×縦横）で2画像のパス・decodeと罫線bbox交差0を確認。24件の新規作成で本文空・書字方向・5→1巡回・ページ追加Undoを確認。11シリーズの便箋変更巡回と桜3→4も確認。
- 夏の縦横20紙面と英語375px選択2画面を目視。11シリーズの英語5選択肢・プレビュー巡回・modal横はみ出しなしを操作確認。空の本文での図案QAは、長文・混在フォントとの全組合せ検証や最新Windows PDF/印刷試験の代わりではない。
- 最新bundleの保存／復元・保存失敗後再試行を、専用合成IndexedDBの別profile2個で再実施しPASS。詳細はSAVE-RECOVERY-VALIDATION。3 profileすべてpageerror/console error/warning 0。
- QA profile `letterier-summer-art-oct2` PID46028、save PID20748、retry PID65552はclose応答とPID不在を確認。既存preview PID61860は維持。
- 読み取り専用独立レビュー Poincare `01a0f973-d333-70f1-bf07-05436269e019`、assignment SUMMER-WESTERN-20261002、26ファイル（下記10コード／文書＋上記16PNG）。重大所見なし、40testsと4node構文検査PASS。初回と再返却の3hash転記不一致は、その3件だけ再実測・32文字分割返却で訂正し、最終26件を親の実測と機械照合して一致。自己申告のassertを親一致へ代用しない。同ID completed targeted wait→close応答を受領。実効モデルUNKNOWN、Host不在の独立証明は未確認。
- マニュアルに図案／巡回の詳細説明を追加することは軽微な残件。既存マニュアル画面画像は旧UIのため更新も残る。今回本文の導線、保存と回復の違い、自作便箋、背景マウス操作、文字数と自動罫線説明を修正したが、マニュアル全体の最終QA完了とは扱わない。
- 12/20シリーズ完了、残り8の追加図案は未制作。公開・push・Store提出・配布規約確認・最新ネイティブ成果物更新は行っていない。

### レビュー版識別 / Reviewed code and manual revision

| ファイル | SHA-256 |
| --- | --- |
| `src/core/stationery-artwork.ts` | `25101C1E6AA48BAD98FECB0217F0A0F7AE4A5B8AD31287E8EB65AD606149D8BA` |
| `tests/stationery-additional-series.test.tsx` | `829D209877B03B1C8C371BF24B2F489124C7E761EABE91585E3EF382FFA70C12` |
| `tests/stationery-design-render.test.tsx` | `79E56618E350FEE21FA34E68B0003E3D9C34CE363BEBA5EFA14D96E5B04A3C71` |
| `tests/stationery-cycle.test.ts` | `340E4D70FF305B7099788F4552722621E84A6A1A49CB654CD157485A94AB25E7` |
| `tests/browser/stationery-artwork-qa.cjs` | `616227E934C044DFC944B463817367B070EF29CB7DB22EE64C4FE0F4D2C4CF82` |
| `tests/browser/stationery-cycle-ui.cjs` | `2F3975FCC91B051D713565A8950FDD4BE28937320FF729C6CB9C59B3DCFDF943` |
| `tests/browser/additional-series-language-alpha.cjs` | `F485F99E458528F737D5DE57DFEF874536C2742D40AC0325AB98CC925F0D613D` |
| `tests/browser/stationery-new-series.cjs` | `51D006D4BE5FA2C37388603319C3FFB616BB8C19E9D7C4C3523A3982C3255628` |
| `docs/manual/ja/README.md` | `3874ACCB50DE9D8651D7692AA84FEB48B2287A49748B14A762675CD14C4F4B4D` |
| `docs/manual/en/README.md` | `10967E8A64BB268415991F92F557457D08D78CC02DF37CD35A0822372C1D13B0` |



## ミモザ・チューリップの追加 / Western Spring additions (2026-10-02 JST)

Codex built-in Imagegenで、参照画像なし・transparent_background=true、各1枚として16件を生成。主役/脇役を独立生成し、原本PNGを無加工・非上書きコピーで採用。旧素材は維持。以下のprefix + subject + suffixを単一スペースで連結した全文が最終プロンプトです。

Prefix: Use case: stylized-concept. Asset type: Western letter-writing stationery corner motif, ONE original transparent PNG. Subject:

Suffix: Style: refined hand-painted botanical watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.

| File | SHA-256 | Subject | Original path |
| --- | --- | --- | --- |
| mimosa-v2.png | DB7A0DBD21E4A4679FC3287AD4AB17BDB4E93400A712578AC121031896C30108 | A small airy hand-tied bouquet of golden-yellow spherical mimosa flowers and fine sage-green fernlike leaves, tied with a thin ivory linen ribbon bow. Complete cut stems visible, not a wreath, no vase, ground or scenery. | [非公開の生成原本] |
| mimosa-v2-companion.png | E324D69D2B3EA2B2CF73CA7AFC43470A851F762B4A01F69C9FF2C043778B6038 | Two short separate mimosa sprigs with tiny golden-yellow pompom flower clusters and fine sage-green fernlike leaves beside a gently curled loose ivory ribbon. Compact botanical still life, not a complete bouquet, no ground. | [非公開の生成原本] |
| mimosa-v3.png | D20E434B599EF277A277AAD046120B7D8E97878663D7438F38A549FB3A19C9A3 | One small complete clear glass bottle holding three slender mimosa branches with golden-yellow pompom flower clusters and fine sage-green fernlike leaves. Subtle glass rim and pale blue reflections, transparent glass areas, no label, tabletop or backdrop. | [非公開の生成原本] |
| mimosa-v3-companion.png | 476041D6D76DFE8AB10F9D2FAC6E5CE8289AE1B2E9B854C44563028CEAB631B1 | One short flowering mimosa twig leaning across a small clear round glass stopper, with a few separate tiny yellow flower balls. Complete compact vignette, transparent glass, no bottle, ground or scene. | [非公開の生成原本] |
| mimosa-v4.png | 76BEA31120573C52FBD5EAE5EE6A6A4C4FFFFDE131278573A151FF47E127E88A | A single pale cream butterfly with delicate muted ochre wing markings perched beside a graceful arching mimosa sprig with small golden-yellow pompom flowers and fine sage-green fernlike leaves. Complete butterfly visible, no ground or scenic background. | [非公開の生成原本] |
| mimosa-v4-companion.png | EAD236278082FA72FD5172F3BB1C91DB9519DA444FFB5A4EAEF3160B89F1F4C2 | Two tiny pale cream butterflies with delicate muted ochre wing markings fluttering above one short mimosa leaflet and a small cluster of golden-yellow flower balls. Airy compact composition, no large flowering branch or backdrop. | [非公開の生成原本] |
| mimosa-v5.png | 30D1A1F66BAF5012D485D8AF32FDBA7D79F4DD39EE166981F626E636A22B4C8A | One small complete cream kraft-paper gift parcel tied with thin ivory twine, topped with a flowering mimosa sprig with golden-yellow pompom blooms and fine sage-green fernlike leaves. Plain wrapping without labels, no tabletop, ground or scenery. | [非公開の生成原本] |
| mimosa-v5-companion.png | C09E85ABA6634CCCE69C1BF9BF1CF30B096981A5CAB6FE9681BC729720A906C5 | One little ivory twine bow with a short flowering mimosa sprig and a single loose blank cream gift tag. No lettering, no wrapped parcel, no ground or scenery. | [非公開の生成原本] |
| tulip-v2.png | 9DD75EDEA2E37BC6B3C231A492BA1DBD92DF55D6710E887C207C35D7C9E481FB | A small natural bouquet of pink, coral-red and ivory tulip blossoms with long sage-green leaves and slender stems, tied with a thin dusty-pink ribbon bow. Complete cut stems visible, no vase, garden or ground. | [非公開の生成原本] |
| tulip-v2-companion.png | 231544C893DDACEAE27EA25038A17476E0B9C74C38F8F0DC483EEE8775D6E481 | One ivory-white tulip blossom lying diagonally beside a pale pink tulip bud and two slender sage-green leaves. Complete short stems visible, no bouquet, vase, ground or scenery. | [非公開の生成原本] |
| tulip-v3.png | 5D5877A437B1C74828FA4AD227A75C4BFAE37A4C57D30F1F97C24AAB7081AB34 | One small complete vintage pale mint bicycle viewed side-on, with a woven front basket carrying three pink and coral-red tulips and sage-green leaves. Simple delicate spokes, both wheels fully visible, no rider, ground or landscape. | [非公開の生成原本] |
| tulip-v3-companion.png | 2694DD248B44A046CD819A5126998C0F90E8B7BF5A1A54A1933FE81ED07D6B4D | One tiny woven wicker flower basket holding a pink tulip bud and an ivory tulip bloom with slender sage-green leaves. Compact isolated companion, no bicycle, ground or scenery. | [非公開の生成原本] |
| tulip-v4.png | 9BF4DEB4E53B45503FEC8A564F84B08E6070C5D6BE373BC0097ADC31232CEBC9 | One small complete weathered pale blue metal watering can holding three pink and coral-red tulip flowers with long sage-green leaves. Complete curved handle and narrow spout visible, no water splash, ground or garden. | [非公開の生成原本] |
| tulip-v4-companion.png | A183908F217A54CBF2BA8854DC048B6A829E1E254C481FD5481DE2523960A238 | One short pink tulip sprig with a gracefully curved green leaf beside three separate clear water drops. Delicate botanical companion, no watering can, puddle, ground or scenery. | [非公開の生成原本] |
| tulip-v5.png | 2F32340232B3DD73BF180189AE8ED66173E3D17DB4DE2BAFAC144E10691C4B95 | One small natural blue-gray songbird perched on a short brown twig beside two pale pink tulips with slender sage-green leaves. Complete bird visible, soft cream breast, delicate restrained colors, no garden, ground or scenic backdrop. | [非公開の生成原本] |
| tulip-v5-companion.png | D144203EFCCD5A31A2D5C006E3B2FF310F4AEAD9A05AC18B30D681D55020CE1A | One small blue-gray loose bird feather beside a single ivory tulip bud and a gently curved sage-green leaf. Delicate airy companion, no complete bird, ground or scene. | [非公開の生成原本] |

全16枚を目視し、花束/ガラス瓶/蝶/贈り物、自転車/じょうろ/小鳥等の図案の意味を確認。四辺余白はpromptの80%より小さいものもあるが、全形が画像内に収まり、紙面で切れなし。ガラスの反射は淡い白/青で描画され、ガラス全pixelの透明は要求・証明していない。ミモザ脇役v2はリボンが枝へ巻かれた構成を採用。1254×1254 RGBA、全16hash独自。mimosa-v2-companion/tulip-v3-companionは左下隅alpha=1/255、他四隅0。既存許容<=1に従い原本を保持。

TDD: registry追加前は18件中4件RED（未登録render/巡回）、登録後GREEN。親の近接コマンドで不存在stationery-designs.test.tsを指定したため実集計は2ファイル31件。独立レビューは正しいstationery-design-render.test.tsxを含め3ファイル36件PASS。全体41ファイル279件、Rust12件、check/version/build PASS。latest bundle index-CL-jX2Nk.js (534.38kB)、既存500kB chunk警告あり。

実ブラウザーletterier-spring-art-oct2: 10シリーズ×5図案×横/縦100ケース、decode/2画像パス/罫線矩形交差0/エラー0。追加2シリーズの20用紙と英語375px選択2画面を目視。新規作成20ケースの空本文/方向/図案5/次ページ1/Undoを実操作。9追加シリーズの5→1と桜3→4を確認。alpha scriptは桜を除く72PNG、透明/描画pixel存在・四隅<=1を確認。9シリーズ英語5選択肢/巡回preview/375px横はみ出しなし。空本文の紙面試験を満杯本文の不存在証明へ拡大しない。新しいnative PDF/printはNOT RUN。

独立read-onlyレビューKepler 01a0f95e-32f3-7832-ab7d-478c8d0b2966: 6コード/テスト+16PNGの22hashが親の実測と一致、registry/UI静的整合・36tests・4syntax PASS、FAILなし。画像意味/ブラウザー/全体Git差分/文書は親確認。正規化manifestの申告hash 76a200806b3632ecf76143482882e2cb20c2346653ab420c6e20f7523f918d2d は親で同じserializationを再現していないため、個別22hash一致と分ける。同ID completed wait受領→native close応答受領。実効モデルUNKNOWN、Host不在の独立証明は未確認。親だけwriter。

| Review code/test file | SHA-256 |
| --- | --- |
| src/core/stationery-artwork.ts | 2DEA4828ACB86B05CA278EBEEC3ACBBAFDEE114C935E8D40EABB1C2C491D8571 |
| tests/stationery-additional-series.test.tsx | 91632A5EEBDC9AB388E6F9E7361DA335C1AA0A4BE48D396734FA1A1818C030D5 |
| tests/browser/stationery-artwork-qa.cjs | AD63F445E79EEF2DDD845FAA5B34B9AA5D8179E2ABB3F76666D26A6332166D21 |
| tests/browser/stationery-cycle-ui.cjs | 6B39539E76604FC01F48FEC551B22093D46484B3BF3802CD2FFBCA2FF050E361 |
| tests/browser/additional-series-language-alpha.cjs | AA27908FA644EEE1CBBFD20A2A154DEC10B9422E36AF4CCC1C2F23F3064C9F3D |
| tests/browser/stationery-new-series.cjs | A5BFC9FF7CC5CA8B7E948CC95D093BC3EB522DFAA77C08BCFFFAAA9E320E49FE |

Complete series now 10/20; 80 added PNGs total. Save/recovery evidence and untested OS boundaries are separately recorded in docs/SAVE-RECOVERY-VALIDATION.md. No format change, publication, push or deletion.

専用browser PID8176/34468/62036はclose応答後に不在を確認。既存preview PID61860と開始時tmp/は維持。今回の変更は16PNG、registry、追加シリーズunit、4browser script、日英README、ASSETS_LICENSE、生成記録、保存検証記録に限定。public/legalの説明コピーは最終配布準備時の同期が残件。

## 雪の庭・椿の便りの追加 / Winter additions (2026-10-02 JST)

図案2〜5の主役・脇役計16枚を、個別の組み込みImageGen呼出しで生成。参考画像なし、transparent_background:true。原PNGを public/template-motifs/ へ非上書きコピーし、旧v1・旧ID・保存形式を維持。全16枚を目視し、異なる構図・水彩調・文字/ロゴなしを確認。実効モデルUNKNOWN。利用範囲はローカル表示と品質検証。規約・権利者・商用利用・改変・再配布・クレジットは配布前に要確認で、本体Apache-2.0を素材へ自動適用しません。

Sixteen independent built-in ImageGen calls produced original transparent primary/companion motifs without references. Originals were inspected and copied without modification or overwriting. Old artwork/IDs and save formats remain unchanged. Actual model UNKNOWN; service terms and distribution rights remain unverified.

最終プロンプトはPrefix、Subject、Suffixを半角スペース1個で連結。Final prompts concatenate Prefix, Subject and Suffix with single spaces.

Prefix: Use case: stylized-concept. Asset type: Japanese letter-writing stationery corner motif, ONE original transparent PNG. Subject:

Suffix: Style: refined hand-painted botanical watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.

| File | SHA-256 | Subject | Original file path |
| --- | --- | --- | --- |
| snow-garden-v2.png | 187F0012136C3AB1450930DFDBBB64973BE8DCE30B696A0668846EA500DD312E | A small complete pale gray Japanese stone garden lantern with a rounded cap carrying a thick soft white layer of snow and little snow patches on its low base. Subtle cool blue-gray snow contours, closed dark window without light, no moon, grasses, ground or landscape. | [非公開の生成原本] |
| snow-garden-v2-companion.png | EBFB3474A8CC60D449D17EFCD95FF0FF899A1B197B56152807217893D995D027 | Three little smooth garden stones capped with white snow beside one small bare brown twig with two tiny red berries. A low compact winter companion vignette, subtle cool blue-gray contours, no lantern, ground or scenery. | [非公開の生成原本] |
| snow-garden-v3.png | CB870009067CC339AE38027370C452DE7ECC77D0EF94E47AC80209A0CE9CC9A4 | One short branch of winter sasanqua with two small open pale pink flowers with visible yellow stamens, several glossy dark sage-green leaves and light white snow resting on the upper leaves. Delicate narrow twig, no vase, ground or scenery. | [非公開の生成原本] |
| snow-garden-v3-companion.png | 3F651AF1D36955B1D8BC99CA09F5D862690B7308C2A7A245E70429CD092D7154 | A single small fallen pale pink sasanqua blossom with yellow stamens, beside two glossy sage-green leaves and three separate tiny white snow clumps. Compact botanical still life, no branch, ground or scenery. | [非公開の生成原本] |
| snow-garden-v4.png | A3FE2A00210EBA3384CC968D89ED84B660758F256E9EA4235D1B4900809E48ED | A small traditional Japanese snow rabbit made from a smooth oval white snow body, two pointed green leaf ears and two tiny red berry eyes, beside one short bare twig. Clearly a crafted snow rabbit rather than a furry live rabbit. Cool blue-gray contours, no ground or scenery. | [非公開の生成原本] |
| snow-garden-v4-companion.png | EC47F0072C8B925A15151AF26094CFA768F89C12D1DC44CF2778F90B8AD59B83 | A little soft white mound of snow bearing four tiny rabbit paw impressions, beside one narrow green leaf and a single red berry. Isolated compact snow shape with subtle cool blue-gray edges, no complete rabbit, ground surface or landscape. | [非公開の生成原本] |
| snow-garden-v5.png | 45F6BE68E80297CD45862E033A8F9551579813DE46EEEED660FE4B4825A7BDE7 | Three graceful pale sage-green bamboo stalks with visible joints and a few narrow curved bamboo leaves, supporting small layers of white snow on the upper leaves and joints. Airy compact winter botanical vignette, no ground or scenic backdrop. | [非公開の生成原本] |
| snow-garden-v5-companion.png | 3DEB083D7C093FD7BDCF425A846CE5578FED8AEC647254E0CA9795A24325D654 | One gently curved slender bamboo leaf sprig with two small snow caps and a single clear icy drop hanging from its tip. Pale sage-green leaves and subtle blue-white snow, no whole bamboo stalks or scenic background. | [非公開の生成原本] |
| camellia-v2.png | 4562CBB65F3BE4C6992AF975AE21320EBAE8C4338CC9B6AEE7DA7915186F5C09 | Three small rounded weathered pale gray stepping stones curving into a short path, with two fallen red camellia flowers showing yellow centers and three glossy sage-green leaves at their edges. Only stones, flowers and leaves, no ground or landscape. | [非公開の生成原本] |
| camellia-v2-companion.png | F8A7E0690E9E58F5B229921A4F9FC0146AA5AA8BDE8174046856C1C385E28ADC | One fallen ivory-white camellia blossom with a golden stamen center beside two glossy muted green oval leaves and one loose red petal. Delicate isolated botanical still life, no stones or ground. | [非公開の生成原本] |
| camellia-v3.png | 2D65981C91BA88B608CE987FC3F032D545CF47CD0CCD4F84D8E745E49FDDAF77 | One small pale celadon ceramic bud vase holding a slender branch with a single deep red open camellia blossom, visible yellow stamens, one tiny bud and two glossy sage-green leaves. Complete vase and stem visible, no tabletop or backdrop. | [非公開の生成原本] |
| camellia-v3-companion.png | 22B7C278C09D7F71BC7E34BD0160F7DF448053839D10F3270D6837F98B5C6399 | One small closed red camellia bud with its green sepals on a short gracefully curved stem, beside one tiny ivory ceramic saucer. Simple airy companion still life, no vase, open flower or ground. | [非公開の生成原本] |
| camellia-v4.png | 0C3084F89671134C93BDC625958F409E46613A66D526F562CC32D5370202C221 | A small Japanese white-eye songbird with olive-green wings and a clear white eye ring perched on a short branch bearing one pale pink camellia bloom and three glossy sage-green leaves. Natural delicate bird proportions, complete bird visible, no ground or landscape. | [非公開の生成原本] |
| camellia-v4-companion.png | 9B38CF07B17A9927C1B58600698D591F503E4DAB521E24FBBE2F3F7C03B98C31 | One small brown camellia seed pod opened to reveal two glossy dark seeds, beside one tiny loose olive-green bird feather and a single green leaf. Delicate isolated botanical companion, no complete bird or flowers. | [非公開の生成原本] |
| camellia-v5.png | 96610D7BAA3D98CBFFE0F9A2B3A422E6DB79E1380D34DC5A0116ECC5BD6B6929 | A slender gently arching camellia twig with three distinct closed red buds, glossy muted green oval leaves and one small bead of dew on a leaf. Airy natural botanical composition with no open flowers, vase, ground or scenic backdrop. | [非公開の生成原本] |
| camellia-v5-companion.png | 213760263FC3CFC01652BB50C3EFAC38CD36DDE7B4695B24EFE3D2687AD7CF80 | Two small ivory-white camellia buds with green sepals on a short forked twig, beside one softly curled glossy sage-green leaf and one clear dew drop. Compact airy botanical companion, no open flowers or scenery. | [非公開の生成原本] |

観測した指示との差異: 雪の竹の主役は指示の3本ではなく2本の竹。竹の本数はアプリ要件ではなく、冬の竹の独立した構図として採用。葉・蕾等の細部個数まで指示完全一致を保証しません。
Observed difference: The snowy bamboo primary has two stalks rather than the requested three. Exact stalk/leaf/bud counts are not application requirements.

TDD: 未登録時は追加4件RED、登録後は関連3ファイル32件GREEN。未制作シリーズの巡回拒否fixtureをclassicへ変更してcoverageを維持。全体41ファイル275件、Rust12件、check/version/build PASS。production index-C1ugGBp8.js（533.87kB、既存500kB chunk警告あり）。

実ブラウザー: 専用合成profile letterier-winter-art-oct2、8シリーズ×5図案×横/縦80ケースでdecode成功・罫線矩形との交差0。雪/椿の20用紙と英語375px選択2画面を目視。空本文の紙面であり、満杯の本文との重なり不存在の証明へ拡大しません。新規作成16ケースで空本文・方向・主役/脇役・5→1の次ページ・Undoを実操作。7追加シリーズの5→1/Undoと桜の3→4も確認。additional-series-language-alpha.cjsの56PNG（桜除外）で透明/描画pixelあり。今回16PNGは1254×1254、四隅alpha=0。7シリーズの英語選択肢5件・巡回preview・375px横はみ出しなし。console error/warning 0。

Browser PASS: Eighty artwork/ruling cases; twenty Winter sheet screenshots and both narrow English choices inspected. Sixteen actual new-letter flows and cycle-wrap/Undo operations passed. The sixteen new PNGs are 1254×1254 with genuinely transparent pixels and zero corner alpha. The 56-file alpha suite excludes Sakura. Empty-body paper checks do not prove every dense-body layout. Archive pack/unpack evidence is unit coverage, not Windows file/PDF/printing verification for these new designs.

保存の最新production再確認は [docs/SAVE-RECOVERY-VALIDATION.md](docs/SAVE-RECOVERY-VALIDATION.md)。図案追加で保存実装は変更しない。Windows新図案のPDF/印刷、配布規約確認、他12シリーズの追加4図案は未完了。旧素材・既存差分・tmpを保持、公開/pushなし。
Latest actual IndexedDB/retry checks are recorded separately. New Winter native PDF/print, distribution terms and the other twelve series remain unfinished; no publication or push.

独立レビュー: Descartes 01a0f94a-836c-7042-b74c-c9bba43fec15、指定7コード/test＋16PNGの限定読み取り・関連32test・4CJS構文PASS。registry hash本文の末尾1文字欠落を発見し、同担当の再実測で訂正・同版PASS/WARN維持を確認。親の23hashと一致。同IDcompleted targeted wait→native closeを初回/訂正回とも受領。モデル実効値UNKNOWN。Host不在の独立確認なし。画像意味・実browser・Git差分と後追記docは親観測であり、独立reviewへ含めません。

Independent review passed bounded code/tests/PNG identity and syntax only. A one-character hash transcription error was remeasured and corrected by the same reviewer; all 23 parent hashes matched. Both replies were received through same-ID targeted completed waits and native closes. Actual model UNKNOWN; host absence is not independently verified. Parent UI/visual observations and later documents are separate evidence.

| Reviewed code/test | SHA-256 |
| --- | --- |
| src/core/stationery-artwork.ts | 4E7649083C49488FBD9254A27BEDBF34AAAD21E575BB3B218EBB91D6D02A74A2 |
| tests/stationery-additional-series.test.tsx | 21323F22207AA863AE0AD55F1E10DF1EB19B47FD440702B091D9DFE6EE40F810 |
| tests/stationery-cycle.test.ts | 5C8182D70B17287BECDDC78BAB819B801BD79733A1A6F3C6B5FD3A9FD939153D |
| tests/browser/stationery-artwork-qa.cjs | 78C2F84C7B6CD711D68A152D9288BC3473C81AF58C0DE903FCFAC962D3AAE85A |
| tests/browser/stationery-cycle-ui.cjs | 762A1E4B5DF8D512B51A3EDE9AC16E65E9BB4718FA74E570E5894BAD4CC2DEF4 |
| tests/browser/additional-series-language-alpha.cjs | 62B4636BDC1047FEA24B37D9EEB2706D3F91BB08E56C1E078511D7A7E7997902 |
| tests/browser/stationery-new-series.cjs | BF6267B94CC4F07CD280F036252742EF11594FD492D4580D09D378B7A73F4D70 |

終了確認: 今回のbrowser3 profileをcloseし、PID55680/61008/54260不在を親が確認。既存preview61860は維持。git diff --check PASS（CRLF通知のみ）。画像生成の原本と合成検証証跡は保持。通常版や実データは不使用。
The three dedicated browser profiles were closed and their process IDs observed absent by the parent. The pre-existing preview remains; generated originals and synthetic evidence were retained. No real application data was used.




## 月とすすきの追加 / Moon additions (2026-10-02 JST)

個別の組み込みImageGen呼出し8回、参考画像なし、transparent_background:trueで図案2〜5の主役・脇役を新規生成。原PNGを public/template-motifs/ へ非上書きコピー。全8枚を目視し、水彩調・異なる構図・文字/ロゴなしを確認。図案1・旧ID・保存形式は不変更。実効モデルUNKNOWN。生成サービスの規約、権利者、商用利用、改変、再配布、クレジットは配布前に要確認で、本体Apache-2.0を自動適用しません。利用範囲はローカル表示と品質検証です。

Eight separate built-in ImageGen calls produced original primary/companion motifs without references. PNGs were inspected and copied without editing or overwriting. Existing artwork/IDs and save formats remain unchanged. Actual model UNKNOWN; ownership, service terms and distribution permissions remain unverified. No automatic grant of the code license to artwork.

最終プロンプトはPrefix、Subject、Suffixを半角スペース1個で連結。Final prompts concatenate Prefix, Subject and Suffix with single spaces. 素材原本は [非公開の生成原本] に保持。

Prefix: Use case: stylized-concept. Asset type: Japanese letter-writing stationery corner motif, ONE original transparent PNG. Subject:

Suffix: Style: refined hand-painted botanical watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.

| File | SHA-256 | Subject | Original file path |
| --- | --- | --- | --- |
| moon-v2.png | A8B52995573623618EA8ACB8ABA2648CECB81F2BD608B10DEE51E00A6AC15FED | One small ivory rabbit sitting in profile looking upward at a pale cream full moon, beside two slender beige pampas grass stems. Gentle natural rabbit proportions and soft gray ear details, complete rabbit visible, no ground or landscape. | [非公開の生成原本] |
| moon-v2-companion.png | AA305E3EC0B3AAD554F6F05D600C30EA72DF1556E5A955A0FE5C23BFC2B87522 | A tiny Japanese wooden offering stand with a neat pyramid of seven ivory moon-viewing rice dumplings, beside one slender pampas grass sprig. Complete compact still life, no rabbit, moon, ground or scenery. | [非公開の生成原本] |
| moon-v3.png | 7019C33D7785E269846CACE53FCCDE5CF820648E753BCC6973E81F4BF0A12644 | Three small wild geese with soft brown-gray wings flying in a gently ascending diagonal across a pale golden full moon. Clearly distinct complete bird silhouettes, airy compact composition, no sky fill or clouds. | [非公開の生成原本] |
| moon-v3-companion.png | F29FF30EBD083D39E0275261F0B3F839204DF6CBAA259899D547C88AA2154A30 | A pair of little brown-gray wild geese swimming side by side with three narrow pale blue ripple arcs and one short reed sprig. Complete birds visible, no moon or filled water surface. | [非公開の生成原本] |
| moon-v4.png | E0E02D4CB6E614A1188BE391E92FA51CA7687674833D2334DCB0D88C875473DE | A gracefully arching Japanese bush-clover branch with tiny muted pink and lilac flowers and small sage-green oval leaves, curving partly around a pale cream crescent moon. Airy delicate botanical composition, no ground or scenic backdrop. | [非公開の生成原本] |
| moon-v4-companion.png | 42D502931AD2E5F6D06D34D9717218557A7602840EF7C7C44441B74BBCEA07D8 | Two short Japanese bush-clover sprigs with small pink-purple pea flowers, one opened blossom and two little buds among tiny sage-green leaves. Fine slender natural stems, no moon, vase or scenery. | [非公開の生成原本] |
| moon-v5.png | 565DB1A25A284D1210AB18323408F30B0F4516AD5EE8F82BC2654460C0502481 | One small traditional pale gray Japanese stone garden lantern, complete cap and base visible, with restrained warm amber light inside its window, beside two thin autumn grasses and a small cream crescent moon above. No exterior glow, ground or scenic backdrop. | [非公開の生成原本] |
| moon-v5-companion.png | B7CD4E6639E14E4B179190FD52D392ACFD420BDF8EF454EEBDF18E8E454447DD | One tiny round ivory Japanese paper lantern hanging from a slender natural bamboo hook, with a short beige pampas grass sprig and one small ochre leaf. Restrained amber tint inside the paper lantern, no exterior glow, text, stone lantern or scenery. | [非公開の生成原本] |

採用時の差異: 月見団子は指示の7個ではなく6個の構図です。個数はアプリ要件ではなく、月見の意匠として採用。生成時の細部指示と観測を区別します。
Observed difference: The offering illustration shows six dumplings rather than the requested seven; exact count is not an application requirement.

TDD: 月の表示/保存後巡回の2追加テストが未登録時RED、登録後は関連3ファイル28件GREEN。全体41ファイル271件、check/build PASS。未制作シリーズ拒否テストのfixtureはsnow-gardenへ移し、拒否coverageを維持。

ブラウザー検証: 専用合成profile letterier-moon-oct2、loopback previewで6シリーズ×5図案×横/縦60ケース、画像decode成功・罫線矩形との交差0。月10用紙のスクリーンショットと英語375pxの図案選択を目視。新規作成12ケースで空本文・方向・主役/脇役・次ページ図案1・Undoを実操作。追加素材40枚のalphaを検査し、月の8枚は全て1254×1254、透明/描画pixelあり。月v4は左下角alpha=1/255、他角は0（既存の許容基準≤1/255、原PNGを改変しない）。保存後巡回はunit archive証拠で、月のWindows実ファイルやPDF/印刷の証明ではありません。

Browser PASS: Sixty artwork/ruling cases across six series, all five designs and both directions; zero ruling intersections. Ten Moon sheet screenshots were inspected. Twelve new-letter cases checked empty body, writing direction, artwork, cycle wrap and Undo. All eight Moon PNGs have genuine alpha; one corner in moon-v4 is 1/255 rather than zero, accepted under the existing quantization tolerance without edits. Native file/PDF/print verification for Moon remains NOT RUN.

狭幅cardの不具合も発見: 英語375pxで桜/朝顔/月の固定225px cardがclientHeight223/scrollHeight236、季節表示がcard外へ出るREDを再現。min-heightだけの初回修正もRED。最新buildのCSS実読込を確認し、一時DOMのheight:max-contentで238px、client=scroll236、文字が内部に収まることを実測してから正本へ採用。最終CSSは自動row/最低225px/内容高さを明示。新scriptは空配列・3対象シリーズ欠落・8画面欠落も拒否。New letter locatorのbannerとの同名衝突をtabpanel限定へ修正し、全8画面を再実行してPASS。JA/EN×375/1280×新規/変更、各20cardを検査。最終profile letterier-moon-cards-final-oct2、pageerror/console error/warning0、4画面のスクリーンショットを目視。最終main index-CnAM-1Ve.js533.25kB、CSSindex-DHDkECJn.css。既存500kB warningは未解消。

Narrow-card fix: The failing browser test caught clipped long English labels. A min-height-only attempt still failed and is not counted as success. Explicit max-content card height passed eight bilingual/narrow/desktop New/Change views with twenty cards each. The initial ambiguous New-letter locator was scoped to its ribbon panel and the whole test rerun. Four final dialog screenshots were inspected. Existing bundle-size warning remains.

独立review: Copernicus 01a0f932-523d-7c90-8415-a20f2f2c7fd7 が限定7コード/test+8PNGのhash・関連28test・4CJS構文を確認、FAILなし。親の実測SHA全一致、同IDcompleted targeted wait→native close応答受領、modelUNKNOWN。意味的画像確認・実browser・後追記docは親観測で分離。

カード修正の独立reviewはAverroes 01a0f938-1973-7773-93b2-7cdcc3124e65。初回の未解決CSSを成功へ流用せず、height:max-contentと明示件数チェック、tabpanel locatorを含む最終版を静的/構文PASS。app.css SHA256 3DF5EC72713121A51A8A03E32DC766BEB88887D4CA4A89160B2F09AAB324943F、stationery-card-layout.cjs SHA256 A032E89FBD07F942C54F70B8D90663C2053DE858DE9B98C0DCFDB70A9BC3C722 は親の実測一致。同IDcompleted targeted wait→native close応答受領、modelUNKNOWN、Host不在は独立確認なし。親の実browser8画面結果・後追記docsは別証拠。今回の専用browser3profileは全てcloseし、実測PID不在を確認。既存preview61860は再利用し、この工程で新設していないため維持。

The second independent reviewer passed only the final bounded CSS/script static and syntax checks; parent hashes matched. Completed targeted wait and native close were received for the same ID, effective model UNKNOWN. Host absence was not independently verified. Actual browser results and later documents remain parent evidence. Dedicated browser profiles were closed; the pre-existing local preview was retained.

再実行: 専用合成profile日本語起動で stationery-artwork-qa.cjs → stationery-cycle-ui.cjs → additional-series-language-alpha.cjs → stationery-new-series.cjs。カードは新しい合成profileで stationery-card-layout.cjs。証跡 output/playwright/moon-v{1..5}-{horizontal,vertical}.png、moon-choice-375-en.png、stationery-cards-{en,ja}-{375,1280}-{change,new}.png。旧assets・tmp・既存差分を保持。公開・push・配布規約確認なし。他14シリーズの追加図案は未完了。



## 紅葉の追加 / Maple additions (2026-10-02 JST)

図案2〜5の主役・脇役8枚を、個別の組み込みImageGen呼出しで新規生成。参考画像なし、transparent_background:true。原PNGを public/template-motifs/ へ非上書きコピーし、旧素材・保存形式・図案1は維持。実効モデルUNKNOWN。利用目的はローカル表示と品質検証で、配布規約・商用利用・改変・再配布・クレジットは配布前に要確認。本体Apache-2.0を素材へ自動付与しません。

Eight independent built-in ImageGen calls, without reference images, generated the original transparent primary/companion PNGs. Originals were copied without editing or overwriting. Old artwork and save formats are unchanged. Actual model UNKNOWN; service terms and distribution permissions remain unverified. Local integration does not grant the code license to these assets.

最終プロンプトはPrefix、Subject、Suffixを半角スペース1個で連結。Final prompts concatenate Prefix, Subject and Suffix with single spaces.

Prefix: Use case: stylized-concept. Asset type: Japanese letter-writing stationery corner motif, ONE original transparent PNG. Subject:

Suffix: Style: refined hand-painted botanical watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.

| File | SHA-256 | Subject |
| --- | --- | --- |
| momiji-v2.png | D0C0EE5BF194DD1B2B852CC5E8A760ABA36C935BC30D549F1C896415B064CFB3 | Three small pale gray Japanese stepping stones curving gently along a short path with five fallen red and amber maple leaves at their edges, a tiny patch of soft green moss on one stone. Only the stones, leaves and moss, no ground surface or landscape. |
| momiji-v2-companion.png | 8680685A01B99D0E077741BC80B705FB73D005BD5B9B28D4F529D0DB53F261B2 | One curled amber maple leaf beside two tiny red maple seed samaras and one little soft green moss tuft. An airy isolated autumn botanical companion, no stones or ground. |
| momiji-v3.png | 6C5BA09773B8D5C861C273E2E429BD5DD662D77E1C9A6552F879F9E536EBC0B9 | A small gracefully arched Japanese wooden garden footbridge, natural pale brown wood and simple low railings, beside a short branch with four vermilion maple leaves. Complete compact bridge visible, no river, land or scenic backdrop. |
| momiji-v3-companion.png | 9EB1E1D6133B4C93D8F7AC90CE53176D9371181A75CC029281502C6CECEBC590 | Two distinct small red maple leaves floating beside three narrow pale blue ripple arcs and one tiny amber leaf. Open transparent spaces, no filled water surface or bridge. |
| momiji-v4.png | 514197F94C4C47225F0D5B07D2C76A62F82648AE58E15FA36E51E6258584F662 | A small hand-tied bouquet of red, amber and muted golden Japanese maple leaves on delicate stems, tied with one thin cream raffia bow. Compact botanical arrangement, varied natural leaf shapes, no vase or ground. |
| momiji-v4-companion.png | AF20F5F50F2CB1D0AA77D79B22B962428A549AC968ED4B07FB8D168028F242D2 | A tiny pair of amber maple leaves with two small brown acorns and a narrow gently curled cream raffia ribbon. Delicate isolated autumn companion, not a full bouquet. |
| momiji-v5.png | 41C16799CA5C3D3538DEE684427BA61A6F81BF9E2DA04C501E92F96A1A1B8711 | A small rounded weathered pale gray Japanese stone water basin with a shallow oval pool, a short bamboo ladle resting diagonally across its rim and one red maple leaf floating inside. Complete basin visible, subtle pale blue water highlights, no garden or ground. |
| momiji-v5-companion.png | 9201658F59D92B1AFABDF863A6A931F44118C156DF9F5AA67850C9835769911E | A small slender bamboo water spout with a single clear water drop hanging from its open tip, beside a short twig bearing two amber maple leaves. No basin, landscape or ground. |

検証状況: unit追加2件は登録前RED→登録後GREEN。全40ファイル257テスト、check/build PASS。production main index-ClfhTGIv.js、532.79kB（既存chunk warningあり）。専用合成profile letterier-momiji-oct2、loopback previewで5シリーズ×5図案×横/縦50ケース、画像decode成功・罫線矩形との交差0。紅葉10用紙と英語375px選択のスクリーンショットを目視し、構図の独立性・本文領域・文字切れを確認。8PNG全て1254×1254、透明/描画pixelあり、四隅alpha=0。5→1ページ追加・Undo、英語5選択肢と巡回preview・dialog横はみ出しなしを実操作。console error/warning 0。

PASS: Fifty actual production-browser cases across five complete series, all five designs and both writing directions decoded the artwork with zero ruling-box intersections. All ten Maple sheet screenshots and the English 375px selection screenshot were visually inspected. All eight original PNGs have painted/transparent pixels and zero corner alpha. Page-add cycle wrap, Undo, translated design selection and narrow dialog preview passed; no console errors/warnings.

新規作成側も tests/browser/stationery-new-series.cjs で桜・菜の花・朝顔・金魚・紅葉×横/縦10ケースの図案5を実作成し、空本文・方向・主役/脇役・次ページ図案1・Undoを確認。初回getByLabelのexact locatorで中断した試験は成功に含めず、実snapshotのcombobox名へ修正して全ケース再実行。保存後の巡回はpack/unpackのunit証拠で、Windows実ファイル保存の証明ではありません。

New-letter creation also passed ten cases for the five complete series and both directions, including empty body, selected artwork, cycle wrap and Undo. An initial exact-label locator timeout was corrected using the observed combobox name and the whole flow rerun. Archive round-trip cycling is unit evidence, not native filesystem proof.

独立reviewはSinger 01a0f901-9fd4-7f31-832e-5586baabfef2。6コード/testファイルと8PNGに静的・限定実行PASS、関連27テスト・browser構文PASS、旧ID維持・未制作moon拒否を確認。意味的な画像差・実browser・後追記docは親の観測として分離。新規作成scriptの修正版も同担当が再読込・構文・SHAを確認し、計7コード/testのhashを親再実測と照合。同IDのcompleted wait受領後native close応答受領、実効モデルUNKNOWN。公開・配布条件、Windows WebView2、PDF・印刷、他15シリーズの追加図案は未確認／未完了。

The independent read-only reviewer passed the bounded static/test scope, old IDs and rejection of unfinished Moon cycling. The parent matched all reviewed code/script hashes. Targeted completed wait and native close were received for the same reviewer ID; effective model UNKNOWN. Parent visual observations and later documentation are separate. Native WebView2, PDF/printing, distribution terms and the remaining fifteen additional series are not complete.

再実行: 専用合成profile・日本語で stationery-artwork-qa.cjs → stationery-cycle-ui.cjs → additional-series-language-alpha.cjs → stationery-new-series.cjs。証跡 output/playwright/momiji-v{1..5}-{horizontal,vertical}.png、momiji-choice-375-en.png。今回保存方式・本文編集・互換IDには変更なし。既存差分とtmpを保持。


## 金魚の追加 / Goldfish additions (2026-10-02 JST)

金魚の図案2〜5の主役・脇役を個別の組み込みImageGen呼出しで生成し、次の8枚を `public/template-motifs/` へ原PNGのまま非上書きコピー。参考画像なし、`transparent_background: true`。図案1と旧IDの素材は保持。実効モデルUNKNOWN、配布前の利用規約・権利確認は未完了。本体Apache-2.0を自動付与しない。

Eight independent built-in ImageGen calls produced the primary and companion motifs for Goldfish designs 2–5. Original PNGs were copied without editing or overwriting; no reference images. Effective model UNKNOWN. Distribution terms remain to be verified; the code license is not automatically applied.

最終プロンプトは次のPrefix、Subject、Suffixを半角スペース1個で連結したもの。

Prefix: Use case: stylized-concept. Asset type: Japanese letter-writing stationery corner motif, ONE original transparent PNG. Subject:

Suffix: Style: refined hand-painted botanical watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.

| File | SHA-256 | Subject |
| --- | --- | --- |
| goldfish-v2.png | F113947DDAEFD543763ECBBE452C31C68B786BAA8E1695BB3B36C2200D7F83F1 | A small Japanese water-lily pond vignette seen from above: one graceful vermilion goldfish swimming beside two pale sage-green round lily pads and a single small cream-white water-lily flower, with a few thin pale blue curved ripples. No filled pond surface, landscape, shoreline or horizon. |
| goldfish-v2-companion.png | 414802DB2755222AE11D5DDC8A6E3BC5C8681A88EF6F3A3E77A8BEA5556DA91B | One small closed cream-white water-lily bud on a gently curved slender green stem beside a single small sage-green lily pad bearing two clear dew drops, with one thin pale blue ripple arc. Delicate isolated pond-side companion motif, no fish and no open flower. No filled water surface or landscape. |
| goldfish-v3.png | E1EE6BB189755712E98C70E5B667637C419158D44B03DAEBAB68DB0E2C449754 | A small rounded clear glass fish bowl with an open rim, containing one orange-red goldfish, a short pale green waterweed sprig and three cream pebbles; restrained pale blue waterline and delicate glass highlights. Complete bowl visible, no table or filled backdrop. |
| goldfish-v3-companion.png | 041BF78A8030F1E496F1D552620D497B8EF3995BFD200576FA5B99F6E1836C55 | A tiny traditional round bamboo-handled goldfish-scooping paper net beside one small ivory dish holding two blue water drops. Delicate Japanese summer still life, no bowl, fish, text or ground. |
| goldfish-v4.png | ECECBF809C410D7E372A2C3CCBB3E4CC6E04799EF7E61C410BC1DFF9930906D7 | Two small graceful goldfish, one vermilion and one pale red-and-white, swimming in opposite curved directions beside a single soft green lotus leaf and a few narrow pale blue ripples. Top-down compact pond motif, no filled water surface. |
| goldfish-v4-companion.png | 41E9DC4D503A66DA4E94F650423E37991513E7B14A17D75F1CB3ED4991534818 | A small pale pink lotus blossom with a golden center beside one little green lotus seed pod on a short slender stem. Compact botanical vignette, no fish, large leaf or backdrop. |
| goldfish-v5.png | 66B5C0BA5D9D664C565B3075B8C6D67AACB736E222AD8132E133FA80D0358FF5 | One little vermilion goldfish gliding between two gently curved pale green waterweed stems with tiny narrow leaves and three small smooth cream pebbles, a few fine pale blue stream ripples. Compact airy vignette, no filled stream surface or landscape. |
| goldfish-v5-companion.png | 9674615F16D981D9F396BE52E3EFD8F94E104CC3F800924A850A670579FE2167 | Three small smooth river pebbles in pale warm gray and cream beside a short green waterweed sprig and one tiny clear blue water drop. Compact isolated stream still life, no fish or filled background. |

検証追補: 金魚5図案×横/縦10ケースを含む4シリーズ40ケースで画像読込・罫線矩形との交差0件。金魚10用紙のスクリーンショットを目視。8素材すべて1254×1254、透明/描画ピクセルあり、四隅alpha=0。英語375pxで5選択肢・巡回プレビュー・ダイアログ横はみ出しなしを確認。ページ追加5→1とUndoを実操作、アーカイブ保存読込後の巡回はunit testで確認。全40ファイル255テスト、check、build PASS（main chunk 532.28kB警告は残る）。新規作成での金魚選択、Windows WebView2、PDF・印刷、他16シリーズの追加図案はこの検証で未確認。証跡 `output/playwright/goldfish-v{1..5}-{horizontal,vertical}.png`、`goldfish-choice-375-en.png`。再実行は `tests/browser/stationery-artwork-qa.cjs` → `stationery-cycle-ui.cjs` → `additional-series-language-alpha.cjs`、専用合成profile・日本語起動が前提。

Goldfish verification: ten horizontal/vertical design cases, decoded alpha for all eight new images, English selection at 375px, page-add cycle wrap and Undo passed. Archive round-trip cycling is unit-tested. All 40 files / 255 tests, check and build passed, with the large-chunk warning remaining. Native WebView2, PDF/printing, Goldfish selection from New letter and the other sixteen additional series are not proven by these checks.

独立読み取り専用レビュー: 金魚登録・unit/browserテスト6ファイルPASS（軽微WARN）。関連3ファイル24テストを担当が別途実行し、8素材のPNGヘッダーと台帳ハッシュ一致を確認。browser実測・後から追記した文書は親の確認として分離する。金魚固有の旧IDテスト、未制作momijiのUI保護、ネイティブ保存は未実施。担当の同ID完了waitとclose応答を受領。

生成日: 2026-10-02（JST）。生成手段: Codex組み込み ImageGen。実効モデル名はツール出力で確認できないため `UNKNOWN`。API/CLIへの切替、外部画像・第三者コードの取込、手動の画像加工は行っていない。透過PNGのalphaを保持してコピーした。旧素材を上書きしていない。

Generated on 2026-10-02 JST using the built-in Codex ImageGen tool. The effective model is UNKNOWN. No CLI/API fallback, external source imagery, or manual image editing was used. Original PNG alpha is preserved; existing assets were not overwritten.

権利・条件: 既存の [ASSETS_LICENSE.md](ASSETS_LICENSE.md) の生成素材と同じ境界で扱う。本体のApache-2.0を素材へ自動付与しない。生成サービスの利用条件、商用利用、改変、再配布、クレジットの条件は配布前に現行規約で要確認。今回の用途はローカルのレタリエ表示・品質検証。公開・配布適合の確認済みを意味しない。

Rights: retain the generated-asset boundary in ASSETS_LICENSE.md; do not automatically apply the code's Apache-2.0 license. Current service terms, commercial use, modification, redistribution, and attribution requirements must be checked before distribution. Integration and visual QA do not constitute distribution approval.

## 採用素材 / Selected assets

すべて `public/template-motifs/`。図案1は既存の `sakura.png` と `sakura-companion.png`。図案2〜5の主役・脇役は各々別の生成。

| File | SHA-256 |
| --- | --- |
| sakura-v2.png | C450C5DF2378D4FF71F4969E843CDF77829AC7EAA2D8AAAE32B3EA0978049C71 |
| sakura-v2-companion.png | 362F94DA57924AC43F1C6CA76A3FE48884CA96515147805B9502EE203B35F991 |
| sakura-v3.png | F2281B0D96BC82D909699BA9EC23EA67B3F836C6C4FAD04CB91FD30153E0EED4 |
| sakura-v3-companion.png | 7AAD06002945E445FA3BE02060778212739325F760151980619827F3EA591B48 |
| sakura-v4.png | 90C7AE45E8F8DBC39DDCBFF7621745B469901B7A8AF3A4E080E6574CF23E8E29 |
| sakura-v4-companion.png | 441B28D0491A4FB9A8D7B915E83721CCDC99184974E9B37D6FAB321224224177 |
| sakura-v5.png | 3B814428ED55C40B5ACE267D220F816EEFEFC500A77DE36D2CB7D155070E4ADD |
| sakura-v5-companion.png | E3BCA0213AB3E821A8C579BFBF771FE041867485D11C8C4055E4632A3F9793F7 |

## 最終プロンプト / Final prompts

`transparent_background: true` を全呼出しに指定。以下は参考画像なしの新規生成。以前の花筏の試案2枚はにじみのため不採用で、プロジェクト参照へ含めていない。

### sakura-v2.png

Use case: stylized-concept. Asset type: isolated watercolor motif for a Japanese stationery corner. Paint a loose graceful crescent of seven pale blush cherry blossom petals and one intact small cherry blossom floating along three very thin muted sage-blue curved water-ripple brushstrokes. Single original vignette, centered in square canvas, all content within 80% canvas with transparent padding. Delicate hand-painted watercolor pigment texture, pale elegant botanical realism. The ONLY painted objects are the petals, flower and narrow ripple strokes. Entire surrounding background and all spaces between objects FULLY TRANSPARENT. No color wash, glow, halo, vignette background, shadow, ground, paper rectangle or checkerboard. No branch, bird, vase, text, logo, frame, ruling or signature. Do not add any blurred light behind the motif.

### 残り7素材のプロンプト組立 / Other seven prompts

各プロンプトは次の共通prefix + 表のSubject + 共通suffix。Subjectはそれぞれ独立して指定した。

Prefix:

> Use case: stylized-concept. Asset type: Japanese letter-writing stationery corner motif, ONE original transparent PNG. Subject:

| File | Subject |
| --- | --- |
| sakura-v2-companion.png | Three isolated pale pink cherry blossom petals floating on two delicate sage-blue rings of water, asymmetrical tiny elegant vignette, without any blossom or branch. |
| sakura-v3.png | A small Japanese white-eye songbird with muted olive-green feathers perched on a delicate short flowering cherry twig. Three pale pink single cherry blossoms and two buds, graceful natural diagonal compact composition. |
| sakura-v3-companion.png | A small empty bird nest woven from fine brown twigs, with one pale pink fallen cherry blossom on its rim and two little fresh green leaves beside it. No bird and no eggs. |
| sakura-v4.png | A loose hand-tied bouquet of double-flowered cherry blossom sprigs with many ruffled light blush petals, cream ribbon, fine brown twig ends, delicate deep pink buds. Compact asymmetric botanical bouquet, not a single-flowered branch. |
| sakura-v4-companion.png | A single fallen double-flowered cherry blossom with densely ruffled pale pink petals lying next to one small curled cream ribbon and one dark pink bud. No stems or bouquet. |
| sakura-v5.png | A traditional small Japanese paper umbrella viewed obliquely from above, pale blush pink washi canopy with fine wooden ribs and a tiny closed cherry flower spray resting against its edge. Refined compact watercolor still life, wooden curved handle visible, no people. |
| sakura-v5-companion.png | A small Japanese folded sensu fan, half-open, cream paper with tiny hand-painted pale cherry flowers and fine tan wooden ribs, accompanied by two fallen blush petals. No umbrella. |

Suffix:

> Style: refined hand-painted botanical watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif, centered within square canvas with generous fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, no paper-background rectangle, no checkerboard, no frame, no text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.

## 検証 / Verification scope

桜5図案×横/縦の10ケースをブラウザーで選択・適用、PNG読込と罫線矩形の交差0件を確認し、全用紙のスクリーンショットを目視した。証跡: `output/playwright/sakura-v{1..5}-{horizontal,vertical}.png`。これは桜シリーズの確認であり、他19シリーズの追加図案、Windows WebView2、PDF・印刷の確認を代替しない。

Five Sakura designs were selected and applied in both writing directions (10 browser cases). PNG loading and zero rule/motif rectangle intersections were checked, and full-paper screenshots were visually inspected. This does not verify the other 19 additional series, Windows WebView2, PDF, or printing.

## 菜の花・朝顔の追加 / Rapeseed and Morning Glory additions

2026-10-02 JSTに各図案2〜5の主役と脇役を独立生成し、16枚の透過PNGを追加。図案1は既存のnanohana/asagaoと各companionを保持。生成手段・UNKNOWNモデル・権利条件は冒頭と同じ。参考画像なし、各呼出し `transparent_background: true`。画像の手動加工・反転や色変更による水増しは行っていない。

Sixteen independently generated transparent PNGs were added for designs 2–5 of the two series. Existing design-1 assets remain unchanged. Tool, UNKNOWN model, and rights limitations are as above.

| File | SHA-256 |
| --- | --- |
| nanohana-v2.png | 61491D50AFA57AAF8EA2156E796BFFEA05F26318190FD323A9F54D07FBFD42F4 |
| nanohana-v2-companion.png | AE40DA48631A7322D9A1AD63CCDE2B3D34020E64C623BDB03F6078E32034EB1B |
| nanohana-v3.png | AF7988D10F9C9F10AAF0BE7DD923046F5248C93C30E05C4B4CBF711585FB95EE |
| nanohana-v3-companion.png | F3B1E9CD03FF95DDE9CB58002E7A4F774F9AD1AD4BAA7804744E5F57F2B48E2C |
| nanohana-v4.png | 6BCB7DD0C9D115F8A0D0585773DAD838DBC8677D003F68EA69B0B1D5B725461A |
| nanohana-v4-companion.png | BF1BDA942DAABFD54738D8E7667AE7BEA3C0BC62C5AE6E5B37E13BACBDEC48BF |
| nanohana-v5.png | 41F795EEFB71C4CBF3CC6A768D5CC5C75BFF6E941BF62BF937DB10C215002FDA |
| nanohana-v5-companion.png | 2C2EF3C67EADAB5792E69EA31AAFC78D38F77D1E6D5C2A605C4A76D3293BA128 |
| asagao-v2.png | E1680CE60270E8F0F955E1E4DAA0A21FEF25E0FD204E592D9B8A2C97376522BE |
| asagao-v2-companion.png | 57180DB7C70C64AFC3AB95FB3DCFB1E19C895A05B9AC993EACC6A79BCC31911E |
| asagao-v3.png | A950633EB0AEA05137366C6DB2161256ACE866D5D7569E8E63D41F1CFFFF6270 |
| asagao-v3-companion.png | 49CB737294B6E338FECD3D66E7BF0697A6F75057A2D039B38ADB94DBA3265CD5 |
| asagao-v4.png | BD8FB7FB761261F171FFAADB011EE28B4567E7321EFD1B140D069A698325760C |
| asagao-v4-companion.png | 805679890E6C0C511D0E498532024703A2D249D8686020CA5E7E5E52F21C618C |
| asagao-v5.png | 0B136F0C139321FCBF1E4BB7331A4F885098A65BB585BC142F4075C1C53A0CE2 |
| asagao-v5-companion.png | 5C889B11194AB86FD4F146BD16CC5477F14D9DD00607C5B822C7D31DBA6FD77D |

### 最終プロンプト組立 / Exact final prompt construction

共通prefix + 各Subject + 共通suffix（境界に半角スペース1個）。他の素材とsuffixが少し異なるため、ここに全文を記録する。

Prefix:

> Use case: stylized-concept. Asset type: Japanese letter-writing stationery corner motif, ONE original transparent PNG. Subject:

| File | Subject |
| --- | --- |
| nanohana-v2.png | A narrow curved little earthen footpath between two delicate sprays of yellow rapeseed blossoms, fresh soft green leaves, a tiny spring wildflower-path vignette. No horizon, sky or large landscape. |
| nanohana-v2-companion.png | A small pale tan gardening boot with a short yellow rapeseed sprig laid beside it and two small fresh leaves. Gentle spring countryside still life, not a path. |
| nanohana-v3.png | A natural small honeybee with golden-brown abdomen and transparent wings hovering beside a graceful spray of four-petaled yellow rapeseed flowers and unopened green buds. Delicate botanical illustration. |
| nanohana-v3-companion.png | A little golden honeycomb fragment beside a clear drop of honey and two loose yellow four-petaled rapeseed blossoms. No bee, jar, text or large background. |
| nanohana-v4.png | A small woven willow flower basket filled with airy sprays of yellow four-petaled rapeseed flowers and gentle green leaves, cream handle and pale linen bow. Elegant spring botanical still life. |
| nanohana-v4-companion.png | A small cream linen bow tied around one yellow rapeseed sprig, with two loose yellow blossoms next to it. No basket. |
| nanohana-v5.png | A miniature cream-and-tan rustic four-bladed countryside windmill with a tiny cluster of yellow rapeseed flowers by its foot. Compact single illustrated vignette, no buildings beyond the windmill, no sky or horizon. |
| nanohana-v5-companion.png | A small pale yellow paper pinwheel on a slender tan stick laid diagonally beside two little rapeseed flowers. Not a windmill building. |
| asagao-v2.png | A graceful airy curved arch of morning-glory vine with two muted blue-violet trumpet-shaped blooms, three small heart-shaped green leaves and curling tendrils. Isolated botanical arch, no trellis or pot. |
| asagao-v2-companion.png | One little rolled violet morning-glory bud beside a fine coiled green tendril and one small heart-shaped leaf with a clear dew drop. No open flower or arch. |
| asagao-v3.png | Two short honey-tan bamboo fence rails crossed by a climbing morning-glory vine, three blue-purple trumpet flowers and heart-shaped green leaves. Compact Japanese garden motif, no horizon or ground backdrop. |
| asagao-v3-companion.png | A short bundle of three bamboo stems tied with a thin cream cord, with one small pale violet morning-glory flower resting beside them. No fence or vine arch. |
| asagao-v4.png | A traditional rounded Japanese uchiwa hand fan with pale cream paper, fine tan bamboo handle and a simple blue-violet morning-glory painting on its paper, next to a small fresh blue morning-glory bloom and green leaf. No text. |
| asagao-v4-companion.png | A small pale blue glass wind chime with a plain cream hanging paper strip and one little detached heart-shaped morning-glory leaf. No painted writing or fan. |
| asagao-v5.png | A little warm terracotta flower pot supporting a short bamboo hoop, a morning-glory vine with two pale blue-purple trumpet flowers and heart-shaped leaves carrying sparkling morning dew. Compact graceful botanical still life. |
| asagao-v5-companion.png | A small cream ceramic saucer holding a few round clear dew drops, with one fresh blue-purple morning-glory flower and a small heart-shaped green leaf resting at the rim. No pot. |

Suffix:

> Style: refined hand-painted botanical watercolor, natural delicate brush texture, pale restrained colors, calm elegant stationery illustration. Composition: one isolated complete motif centered within square canvas, content fits inside 80% of the canvas with fully transparent padding, readable at 46mm. All holes and spaces between objects transparent. No surrounding pigment wash, NO glow, NO blurred halo, NO ground or cast shadow. No solid background, paper-background rectangle, checkerboard, frame, text, lettering, logos, watermark or signature. Not a collage or sheet of multiple assets.

### 検証範囲 / Verification scope

桜・菜の花・朝顔各5図案×横/縦の計30ブラウザーケースで、選択・適用、PNG読込、罫線と図案矩形の交差0件を確認。菜の花・朝顔20用紙のスクリーンショットを目視し、ページ追加時の5→1循環、Undoを実操作した。アーカイブ保存読込後の循環はユニットテストで確認。証跡は `output/playwright/{nanohana,asagao}-v{1..5}-{horizontal,vertical}.png`、再実行手順は `tests/browser/stationery-artwork-qa.cjs` と `stationery-cycle-ui.cjs`。他17シリーズの追加図案、Windows WebView2、ネイティブ保存、PDF・印刷は未確認。

Thirty browser cases covered five designs in both directions for Sakura, Rapeseed, and Morning Glory, including PNG decoding and zero ruling/motif rectangle intersections. All twenty Rapeseed and Morning Glory paper screenshots were visually inspected; page-add cycle wrap and Undo were exercised. Archive round-trip cycling is unit-tested. This does not verify the remaining 17 additional series, native Windows WebView2 file operations, PDF, or printing.

追補: 16素材は全件1254×1254 RGBA。ブラウザーでalphaを復号し、透明・描画ピクセルの両方を確認した。nanohana-v4の左下隅はalpha 1/255、他63隅は0。角の検査は量子化1段階までを許容し、元PNGを加工せず保持する。英語375pxの菜の花・朝顔の5選択肢、プレビュー5→1循環、ダイアログ横はみ出しなしを実操作・目視確認。手順: `tests/browser/additional-series-language-alpha.cjs`。独立読み取り専用コードレビューはPASS（親が並行補完した生成記録は親が16ハッシュ一致を別途検査）。全37テストファイル/209テスト、check、buildはPASS。ただしmain chunk 618.01KBの警告は未解消で、性能達成を意味しない。

Addendum: all sixteen PNGs are 1254×1254 RGBA. Decoded alpha contains both transparent and painted pixels. One corner of nanohana-v4 has alpha 1/255; the other 63 corners have alpha zero. The corner check allows one quantization step; original files are preserved without editing. English 375px selection, cycle previews, and no horizontal dialog overflow were exercised and visually checked. Independent read-only code review passed; the parent separately verified all sixteen provenance hashes. All 37 test files / 209 tests, check, and build passed. The 618.01KB main-chunk warning remains; performance acceptance is not claimed.

