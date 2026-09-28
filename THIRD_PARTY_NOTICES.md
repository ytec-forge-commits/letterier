# 第三者コンポーネント

`public/legal/THIRD_PARTY_NOTICES.txt`に著作権とライセンス全文を収録。アプリ内の「画面設定・使い方」から閲覧できます。MPL対象の未改変対応ソースは同ディレクトリのZIPに同梱します。

CargoはWindows用の通常依存の推移的閉包を保守的に収録し、ビルド時だけに消えるproc-macro等を含む場合があります。npmはブラウザーに取り込む実行時モジュール。開発ツール、OS、WebView2ランタイム、Node専用のoptional canvasバイナリはアプリ本体に同梱しません。フォント・PDF静的資源は各manifestとASSETS_LICENSE.md、IMAGE-FORMATS.mdを参照。

依存更新後は `python scripts/collect-licenses.py` で再生成して差分を確認してください。

|系統|名前|版|元のライセンス|取得元|
|---|---|---|---|---|
|Cargo|adler2|2.0.1|0BSD OR MIT OR Apache-2.0|https://github.com/oyvindln/adler2|
|Cargo|aho-corasick|1.1.5|Unlicense OR MIT|https://github.com/BurntSushi/aho-corasick|
|Cargo|alloc-no-stdlib|2.0.4|BSD-3-Clause|https://github.com/dropbox/rust-alloc-no-stdlib|
|Cargo|alloc-stdlib|0.2.4|BSD-3-Clause|https://github.com/dropbox/rust-alloc-no-stdlib|
|Cargo|anyhow|1.0.104|MIT OR Apache-2.0|https://github.com/dtolnay/anyhow|
|Cargo|base64|0.22.1|MIT OR Apache-2.0|https://github.com/marshallpierce/rust-base64|
|Cargo|bit-set|0.8.0|Apache-2.0 OR MIT|https://github.com/contain-rs/bit-set|
|Cargo|bit-vec|0.8.0|Apache-2.0 OR MIT|https://github.com/contain-rs/bit-vec|
|Cargo|bitflags|1.3.2|MIT/Apache-2.0|https://github.com/bitflags/bitflags|
|Cargo|bitflags|2.13.1|MIT OR Apache-2.0|https://github.com/bitflags/bitflags|
|Cargo|block-buffer|0.10.4|MIT OR Apache-2.0|https://github.com/RustCrypto/utils|
|Cargo|brotli|8.0.4|BSD-3-Clause AND MIT|https://github.com/dropbox/rust-brotli|
|Cargo|brotli-decompressor|5.0.3|BSD-3-Clause/MIT|https://github.com/dropbox/rust-brotli-decompressor|
|Cargo|bs58|0.5.1|MIT/Apache-2.0|https://github.com/Nullus157/bs58-rs|
|Cargo|byteorder|1.5.0|Unlicense OR MIT|https://github.com/BurntSushi/byteorder|
|Cargo|bytes|1.12.1|MIT|https://github.com/tokio-rs/bytes|
|Cargo|camino|1.2.5|MIT OR Apache-2.0|https://github.com/camino-rs/camino|
|Cargo|cargo-platform|0.1.9|MIT OR Apache-2.0|https://github.com/rust-lang/cargo|
|Cargo|cargo_metadata|0.19.2|MIT|https://github.com/oli-obk/cargo_metadata|
|Cargo|cfb|0.7.3|MIT|https://github.com/mdsteele/rust-cfb|
|Cargo|cfg-if|1.0.4|MIT OR Apache-2.0|https://github.com/rust-lang/cfg-if|
|Cargo|chrono|0.4.45|MIT OR Apache-2.0|https://github.com/chronotope/chrono|
|Cargo|cookie|0.18.2|MIT OR Apache-2.0|https://github.com/SergioBenitez/cookie-rs|
|Cargo|cpufeatures|0.2.17|MIT OR Apache-2.0|https://github.com/RustCrypto/utils|
|Cargo|crc32fast|1.5.1|MIT OR Apache-2.0|https://github.com/srijs/rust-crc32fast|
|Cargo|crossbeam-channel|0.5.17|MIT OR Apache-2.0|https://github.com/crossbeam-rs/crossbeam|
|Cargo|crossbeam-utils|0.8.23|MIT OR Apache-2.0|https://github.com/crossbeam-rs/crossbeam|
|Cargo|crypto-common|0.1.7|MIT OR Apache-2.0|https://github.com/RustCrypto/traits|
|Cargo|cssparser|0.36.0|MPL-2.0|https://github.com/servo/rust-cssparser|
|Cargo|cssparser-macros|0.6.1|MPL-2.0|https://github.com/servo/rust-cssparser|
|Cargo|ctor|0.8.0|Apache-2.0 OR MIT|https://github.com/mmastrac/rust-ctor|
|Cargo|ctor-proc-macro|0.0.7|Apache-2.0 OR MIT|https://github.com/mmastrac/rust-ctor|
|Cargo|darling|0.23.0|MIT|https://github.com/TedDriggs/darling|
|Cargo|darling_core|0.23.0|MIT|https://github.com/TedDriggs/darling|
|Cargo|darling_macro|0.23.0|MIT|https://github.com/TedDriggs/darling|
|Cargo|defmt|1.1.1|MIT OR Apache-2.0|https://github.com/knurling-rs/defmt|
|Cargo|defmt-macros|1.1.1|MIT OR Apache-2.0|https://github.com/knurling-rs/defmt|
|Cargo|defmt-parser|1.0.0|MIT OR Apache-2.0|https://github.com/knurling-rs/defmt|
|Cargo|deranged|0.5.8|MIT OR Apache-2.0|https://github.com/jhpratt/deranged|
|Cargo|derive_more|2.1.1|MIT|https://github.com/JelteF/derive_more|
|Cargo|derive_more-impl|2.1.1|MIT|https://github.com/JelteF/derive_more|
|Cargo|digest|0.10.7|MIT OR Apache-2.0|https://github.com/RustCrypto/traits|
|Cargo|dirs|6.0.0|MIT OR Apache-2.0|https://github.com/soc/dirs-rs|
|Cargo|dirs-sys|0.5.0|MIT OR Apache-2.0|https://github.com/dirs-dev/dirs-sys-rs|
|Cargo|displaydoc|0.2.7|MIT OR Apache-2.0|https://github.com/yaahc/displaydoc|
|Cargo|dom_query|0.27.0|MIT|https://github.com/niklak/dom_query|
|Cargo|dpi|0.1.2|Apache-2.0 AND MIT|https://github.com/rust-windowing/winit|
|Cargo|dtoa|1.0.11|MIT OR Apache-2.0|https://github.com/dtolnay/dtoa|
|Cargo|dtoa-short|0.3.5|MPL-2.0|https://github.com/upsuper/dtoa-short|
|Cargo|dtor|0.3.0|Apache-2.0 OR MIT|https://github.com/mmastrac/rust-ctor|
|Cargo|dtor-proc-macro|0.0.6|Apache-2.0 OR MIT|https://github.com/mmastrac/rust-ctor|
|Cargo|dunce|1.0.5|CC0-1.0 OR MIT-0 OR Apache-2.0|https://gitlab.com/kornelski/dunce|
|Cargo|dyn-clone|1.0.20|MIT OR Apache-2.0|https://github.com/dtolnay/dyn-clone|
|Cargo|equivalent|1.0.2|Apache-2.0 OR MIT|https://github.com/indexmap-rs/equivalent|
|Cargo|erased-serde|0.4.10|MIT OR Apache-2.0|https://github.com/dtolnay/erased-serde|
|Cargo|fastrand|2.5.0|Apache-2.0 OR MIT|https://github.com/smol-rs/fastrand|
|Cargo|fdeflate|0.3.7|MIT OR Apache-2.0|https://github.com/image-rs/fdeflate|
|Cargo|flate2|1.1.10|MIT OR Apache-2.0|https://github.com/rust-lang/flate2-rs|
|Cargo|fnv|1.0.7|Apache-2.0 / MIT|https://github.com/servo/rust-fnv|
|Cargo|foldhash|0.2.0|Zlib|https://github.com/orlp/foldhash|
|Cargo|form_urlencoded|1.2.2|MIT OR Apache-2.0|https://github.com/servo/rust-url|
|Cargo|generic-array|0.14.7|MIT|https://github.com/fizyk20/generic-array.git|
|Cargo|getrandom|0.3.4|MIT OR Apache-2.0|https://github.com/rust-random/getrandom|
|Cargo|getrandom|0.4.3|MIT OR Apache-2.0|https://github.com/rust-random/getrandom|
|Cargo|glob|0.3.4|MIT OR Apache-2.0|https://github.com/rust-lang/glob|
|Cargo|hashbrown|0.12.3|MIT OR Apache-2.0|https://github.com/rust-lang/hashbrown|
|Cargo|hashbrown|0.17.1|MIT OR Apache-2.0|https://github.com/rust-lang/hashbrown|
|Cargo|heck|0.5.0|MIT OR Apache-2.0|https://github.com/withoutboats/heck|
|Cargo|hex|0.4.3|MIT OR Apache-2.0|https://github.com/KokaKiwi/rust-hex|
|Cargo|html5ever|0.38.0|MIT OR Apache-2.0|https://github.com/servo/html5ever|
|Cargo|http|1.5.0|MIT OR Apache-2.0|https://github.com/hyperium/http|
|Cargo|ico|0.5.0|MIT|https://github.com/mdsteele/rust-ico|
|Cargo|icu_collections|2.3.0|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|icu_locale_core|2.3.0|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|icu_normalizer|2.3.0|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|icu_normalizer_data|2.3.0|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|icu_properties|2.3.0|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|icu_properties_data|2.3.0|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|icu_provider|2.3.1|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|ident_case|1.0.1|MIT/Apache-2.0|https://github.com/TedDriggs/ident_case|
|Cargo|idna|1.1.0|MIT OR Apache-2.0|https://github.com/servo/rust-url/|
|Cargo|idna_adapter|1.2.2|Apache-2.0 OR MIT|https://github.com/hsivonen/idna_adapter|
|Cargo|indexmap|1.9.3|Apache-2.0 OR MIT|https://github.com/bluss/indexmap|
|Cargo|indexmap|2.14.2|Apache-2.0 OR MIT|https://github.com/indexmap-rs/indexmap|
|Cargo|infer|0.19.0|MIT|https://github.com/bojand/infer|
|Cargo|itoa|1.0.18|MIT OR Apache-2.0|https://github.com/dtolnay/itoa|
|Cargo|jiff|0.2.35|Unlicense OR MIT|https://github.com/BurntSushi/jiff|
|Cargo|jiff-core|0.1.0|Unlicense OR MIT|https://github.com/BurntSushi/jiff|
|Cargo|jiff-tzdb|0.1.8|Unlicense OR MIT|https://github.com/BurntSushi/jiff|
|Cargo|jiff-tzdb-platform|0.1.3|Unlicense OR MIT|https://github.com/BurntSushi/jiff|
|Cargo|json-patch|3.0.1|MIT/Apache-2.0|https://github.com/idubrov/json-patch|
|Cargo|jsonptr|0.6.3|MIT OR Apache-2.0|https://github.com/chanced/jsonptr|
|Cargo|keyboard-types|0.7.0|MIT OR Apache-2.0|https://github.com/pyfisch/keyboard-types|
|Cargo|libc|0.2.189|MIT OR Apache-2.0|https://github.com/rust-lang/libc|
|Cargo|litemap|0.8.3|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|lock_api|0.4.14|MIT OR Apache-2.0|https://github.com/Amanieu/parking_lot|
|Cargo|log|0.4.34|MIT OR Apache-2.0|https://github.com/rust-lang/log|
|Cargo|markup5ever|0.38.0|MIT OR Apache-2.0|https://github.com/servo/html5ever|
|Cargo|memchr|2.8.3|Unlicense OR MIT|https://github.com/BurntSushi/memchr|
|Cargo|mime|0.3.17|MIT OR Apache-2.0|https://github.com/hyperium/mime|
|Cargo|miniz_oxide|0.8.9|MIT OR Zlib OR Apache-2.0|https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide|
|Cargo|miniz_oxide|0.9.1|MIT OR Zlib OR Apache-2.0|https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide|
|Cargo|mio|1.2.3|MIT|https://github.com/tokio-rs/mio|
|Cargo|muda|0.19.3|Apache-2.0 OR MIT|https://github.com/tauri-apps/muda|
|Cargo|new_debug_unreachable|1.0.6|MIT|https://github.com/mbrubeck/rust-debug-unreachable|
|Cargo|num-conv|0.2.2|MIT OR Apache-2.0|https://github.com/jhpratt/num-conv|
|Cargo|num-traits|0.2.19|MIT OR Apache-2.0|https://github.com/rust-num/num-traits|
|Cargo|once_cell|1.21.4|MIT OR Apache-2.0|https://github.com/matklad/once_cell|
|Cargo|option-ext|0.2.0|MPL-2.0|https://github.com/soc/option-ext.git|
|Cargo|parking_lot|0.12.5|MIT OR Apache-2.0|https://github.com/Amanieu/parking_lot|
|Cargo|parking_lot_core|0.9.12|MIT OR Apache-2.0|https://github.com/Amanieu/parking_lot|
|Cargo|percent-encoding|2.3.2|MIT OR Apache-2.0|https://github.com/servo/rust-url/|
|Cargo|phf|0.13.1|MIT|https://github.com/rust-phf/rust-phf|
|Cargo|phf_generator|0.13.1|MIT|https://github.com/rust-phf/rust-phf|
|Cargo|phf_macros|0.13.1|MIT|https://github.com/rust-phf/rust-phf|
|Cargo|phf_shared|0.13.1|MIT|https://github.com/rust-phf/rust-phf|
|Cargo|pin-project-lite|0.2.17|Apache-2.0 OR MIT|https://github.com/taiki-e/pin-project-lite|
|Cargo|plist|1.10.0|MIT|https://github.com/ebarnard/rust-plist/|
|Cargo|png|0.17.16|MIT OR Apache-2.0|https://github.com/image-rs/image-png|
|Cargo|potential_utf|0.1.6|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|powerfmt|0.2.0|MIT OR Apache-2.0|https://github.com/jhpratt/powerfmt|
|Cargo|precomputed-hash|0.1.1|MIT|https://github.com/emilio/precomputed-hash|
|Cargo|proc-macro2|1.0.107|MIT OR Apache-2.0|https://github.com/dtolnay/proc-macro2|
|Cargo|quick-xml|0.41.0|MIT|https://github.com/tafia/quick-xml|
|Cargo|quote|1.0.47|MIT OR Apache-2.0|https://github.com/dtolnay/quote|
|Cargo|raw-window-handle|0.6.2|MIT OR Apache-2.0 OR Zlib|https://github.com/rust-windowing/raw-window-handle|
|Cargo|ref-cast|1.0.27|MIT OR Apache-2.0|https://github.com/dtolnay/ref-cast|
|Cargo|ref-cast-impl|1.0.27|MIT OR Apache-2.0|https://github.com/dtolnay/ref-cast|
|Cargo|regex|1.13.1|MIT OR Apache-2.0|https://github.com/rust-lang/regex|
|Cargo|regex-automata|0.4.18|MIT OR Apache-2.0|https://github.com/rust-lang/regex|
|Cargo|regex-syntax|0.8.11|MIT OR Apache-2.0|https://github.com/rust-lang/regex|
|Cargo|rfd|0.16.0|MIT|https://github.com/PolyMeilex/rfd|
|Cargo|rustc-hash|2.1.3|Apache-2.0 OR MIT|https://github.com/rust-lang/rustc-hash|
|Cargo|same-file|1.0.6|Unlicense/MIT|https://github.com/BurntSushi/same-file|
|Cargo|schemars|0.8.22|MIT|https://github.com/GREsau/schemars|
|Cargo|schemars|0.9.0|MIT|https://github.com/GREsau/schemars|
|Cargo|schemars|1.2.2|MIT|https://github.com/GREsau/schemars|
|Cargo|schemars_derive|0.8.22|MIT|https://github.com/GREsau/schemars|
|Cargo|scopeguard|1.2.0|MIT OR Apache-2.0|https://github.com/bluss/scopeguard|
|Cargo|selectors|0.36.1|MPL-2.0|https://github.com/servo/stylo|
|Cargo|semver|1.0.28|MIT OR Apache-2.0|https://github.com/dtolnay/semver|
|Cargo|serde|1.0.229|MIT OR Apache-2.0|https://github.com/serde-rs/serde|
|Cargo|serde-untagged|0.1.9|MIT OR Apache-2.0|https://github.com/dtolnay/serde-untagged|
|Cargo|serde_core|1.0.229|MIT OR Apache-2.0|https://github.com/serde-rs/serde|
|Cargo|serde_derive|1.0.229|MIT OR Apache-2.0|https://github.com/serde-rs/serde|
|Cargo|serde_derive_internals|0.29.1|MIT OR Apache-2.0|https://github.com/serde-rs/serde|
|Cargo|serde_json|1.0.151|MIT OR Apache-2.0|https://github.com/serde-rs/json|
|Cargo|serde_repr|0.1.21|MIT OR Apache-2.0|https://github.com/dtolnay/serde-repr|
|Cargo|serde_spanned|1.1.1|MIT OR Apache-2.0|https://github.com/toml-rs/toml|
|Cargo|serde_with|3.22.0|MIT OR Apache-2.0|https://github.com/jonasbb/serde_with/|
|Cargo|serde_with_macros|3.22.0|MIT OR Apache-2.0|https://github.com/jonasbb/serde_with/|
|Cargo|serialize-to-javascript|0.1.2|MIT OR Apache-2.0|https://github.com/chippers/serialize-to-javascript|
|Cargo|serialize-to-javascript-impl|0.1.2|MIT OR Apache-2.0|https://github.com/chippers/serialize-to-javascript|
|Cargo|servo_arc|0.4.3|MIT OR Apache-2.0|https://github.com/servo/stylo|
|Cargo|sha2|0.10.9|MIT OR Apache-2.0|https://github.com/RustCrypto/hashes|
|Cargo|simd-adler32|0.3.10|MIT|https://github.com/mcountryman/simd-adler32|
|Cargo|siphasher|1.0.3|MIT/Apache-2.0|https://github.com/jedisct1/rust-siphash|
|Cargo|smallvec|1.16.0|MIT OR Apache-2.0|https://github.com/servo/rust-smallvec|
|Cargo|socket2|0.6.5|MIT OR Apache-2.0|https://github.com/rust-lang/socket2|
|Cargo|softbuffer|0.4.8|MIT OR Apache-2.0|https://github.com/rust-windowing/softbuffer|
|Cargo|stable_deref_trait|1.2.1|MIT OR Apache-2.0|https://github.com/storyyeller/stable_deref_trait|
|Cargo|string_cache|0.9.0|MIT OR Apache-2.0|https://github.com/servo/string-cache|
|Cargo|strsim|0.11.1|MIT|https://github.com/rapidfuzz/strsim-rs|
|Cargo|syn|2.0.119|MIT OR Apache-2.0|https://github.com/dtolnay/syn|
|Cargo|syn|3.0.5|MIT OR Apache-2.0|https://github.com/dtolnay/syn|
|Cargo|synstructure|0.13.2|MIT|https://github.com/mystor/synstructure|
|Cargo|tao|0.35.3|Apache-2.0|https://github.com/tauri-apps/tao|
|Cargo|tauri|2.11.5|Apache-2.0 OR MIT|https://github.com/tauri-apps/tauri|
|Cargo|tauri-codegen|2.6.3|Apache-2.0 OR MIT|https://github.com/tauri-apps/tauri|
|Cargo|tauri-macros|2.6.3|Apache-2.0 OR MIT|https://github.com/tauri-apps/tauri|
|Cargo|tauri-plugin-dialog|2.6.0|Apache-2.0 OR MIT|https://github.com/tauri-apps/plugins-workspace|
|Cargo|tauri-plugin-fs|2.5.2|Apache-2.0 OR MIT|https://github.com/tauri-apps/plugins-workspace|
|Cargo|tauri-plugin-single-instance|2.4.4|Apache-2.0 OR MIT|https://github.com/tauri-apps/plugins-workspace|
|Cargo|tauri-runtime|2.11.3|Apache-2.0 OR MIT|https://github.com/tauri-apps/tauri|
|Cargo|tauri-runtime-wry|2.11.4|Apache-2.0 OR MIT|https://github.com/tauri-apps/tauri|
|Cargo|tauri-utils|2.9.3|Apache-2.0 OR MIT|https://github.com/tauri-apps/tauri|
|Cargo|tempfile|3.27.0|MIT OR Apache-2.0|https://github.com/Stebalien/tempfile|
|Cargo|tendril|0.5.1|MIT OR Apache-2.0|https://github.com/servo/html5ever|
|Cargo|thiserror|1.0.69|MIT OR Apache-2.0|https://github.com/dtolnay/thiserror|
|Cargo|thiserror|2.0.20|MIT OR Apache-2.0|https://github.com/dtolnay/thiserror|
|Cargo|thiserror-impl|1.0.69|MIT OR Apache-2.0|https://github.com/dtolnay/thiserror|
|Cargo|thiserror-impl|2.0.20|MIT OR Apache-2.0|https://github.com/dtolnay/thiserror|
|Cargo|time|0.3.55|MIT OR Apache-2.0|https://github.com/time-rs/time|
|Cargo|time-core|0.1.9|MIT OR Apache-2.0|https://github.com/time-rs/time|
|Cargo|time-macros|0.2.32|MIT OR Apache-2.0|https://github.com/time-rs/time|
|Cargo|tinystr|0.8.4|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|tinyvec|1.13.2|Zlib OR Apache-2.0 OR MIT|https://github.com/Lokathor/tinyvec|
|Cargo|tinyvec_macros|0.1.1|MIT OR Apache-2.0 OR Zlib|https://github.com/Soveu/tinyvec_macros|
|Cargo|tokio|1.53.1|MIT|https://github.com/tokio-rs/tokio|
|Cargo|toml|1.1.5+spec-1.1.0|MIT OR Apache-2.0|https://github.com/toml-rs/toml|
|Cargo|toml_datetime|1.1.1+spec-1.1.0|MIT OR Apache-2.0|https://github.com/toml-rs/toml|
|Cargo|toml_parser|1.1.3+spec-1.1.0|MIT OR Apache-2.0|https://github.com/toml-rs/toml|
|Cargo|toml_writer|1.1.2+spec-1.1.0|MIT OR Apache-2.0|https://github.com/toml-rs/toml|
|Cargo|tracing|0.1.44|MIT|https://github.com/tokio-rs/tracing|
|Cargo|tracing-attributes|0.1.31|MIT|https://github.com/tokio-rs/tracing|
|Cargo|tracing-core|0.1.36|MIT|https://github.com/tokio-rs/tracing|
|Cargo|tray-icon|0.24.2|MIT OR Apache-2.0|https://github.com/tauri-apps/tray-icon|
|Cargo|typeid|1.0.3|MIT OR Apache-2.0|https://github.com/dtolnay/typeid|
|Cargo|typenum|1.20.1|MIT OR Apache-2.0|https://github.com/paholg/typenum|
|Cargo|unic-char-property|0.9.0|MIT/Apache-2.0|https://github.com/open-i18n/rust-unic/|
|Cargo|unic-char-range|0.9.0|MIT/Apache-2.0|https://github.com/open-i18n/rust-unic/|
|Cargo|unic-common|0.9.0|MIT/Apache-2.0|https://github.com/open-i18n/rust-unic/|
|Cargo|unic-ucd-ident|0.9.0|MIT/Apache-2.0|https://github.com/open-i18n/rust-unic/|
|Cargo|unic-ucd-version|0.9.0|MIT/Apache-2.0|https://github.com/open-i18n/rust-unic/|
|Cargo|unicode-ident|1.0.24|(MIT OR Apache-2.0) AND Unicode-3.0|https://github.com/dtolnay/unicode-ident|
|Cargo|unicode-segmentation|1.13.3|MIT OR Apache-2.0|https://github.com/unicode-rs/unicode-segmentation|
|Cargo|url|2.5.8|MIT OR Apache-2.0|https://github.com/servo/rust-url|
|Cargo|urlpattern|0.3.0|MIT|https://github.com/denoland/rust-urlpattern|
|Cargo|utf8_iter|1.0.4|Apache-2.0 OR MIT|https://github.com/hsivonen/utf8_iter|
|Cargo|uuid|1.26.0|Apache-2.0 OR MIT|https://github.com/uuid-rs/uuid|
|Cargo|walkdir|2.5.0|Unlicense/MIT|https://github.com/BurntSushi/walkdir|
|Cargo|web_atoms|0.2.6|MIT OR Apache-2.0|https://github.com/servo/html5ever|
|Cargo|webview2-com|0.38.2|MIT|https://github.com/wravery/webview2-rs|
|Cargo|webview2-com-macros|0.8.1|MIT|https://github.com/wravery/webview2-rs|
|Cargo|webview2-com-sys|0.38.2|MIT|https://github.com/wravery/webview2-rs|
|Cargo|winapi-util|0.1.11|Unlicense OR MIT|https://github.com/BurntSushi/winapi-util|
|Cargo|window-vibrancy|0.6.0|Apache-2.0 OR MIT|https://github.com/tauri-apps/tauri-plugin-vibrancy|
|Cargo|windows|0.61.3|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-collections|0.2.0|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-core|0.61.2|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-future|0.2.1|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-implement|0.60.2|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-interface|0.59.3|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-link|0.1.3|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-link|0.2.1|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-numerics|0.2.0|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-result|0.3.4|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-strings|0.4.2|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-sys|0.59.0|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-sys|0.60.2|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-sys|0.61.2|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-targets|0.52.6|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-targets|0.53.5|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-threading|0.1.0|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows-version|0.1.7|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows_x86_64_msvc|0.52.6|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|windows_x86_64_msvc|0.53.1|MIT OR Apache-2.0|https://github.com/microsoft/windows-rs|
|Cargo|winnow|1.0.4|MIT|https://github.com/winnow-rs/winnow|
|Cargo|writeable|0.6.4|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|wry|0.55.1|Apache-2.0 OR MIT|https://github.com/tauri-apps/wry|
|Cargo|yoke|0.8.3|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|yoke-derive|0.8.2|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|zerofrom|0.1.8|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|zerofrom-derive|0.1.7|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|zerotrie|0.2.5|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|zerovec|0.11.8|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|zerovec-derive|0.11.6|Unicode-3.0|https://github.com/unicode-org/icu4x|
|Cargo|zlib-rs|0.6.7|Zlib|https://github.com/trifectatechfoundation/zlib-rs|
|Cargo|zmij|1.0.23|MIT|https://github.com/dtolnay/zmij|
|npm|@tauri-apps/api|2.11.1|Apache-2.0 OR MIT|https://www.npmjs.com/package/@tauri-apps/api/v/2.11.1|
|npm|@xmldom/xmldom|0.9.12|MIT|https://www.npmjs.com/package/@xmldom/xmldom/v/0.9.12|
|npm|ag-psd|31.0.2|MIT|https://www.npmjs.com/package/ag-psd/v/31.0.2|
|npm|base64-js|1.5.1|MIT|https://www.npmjs.com/package/base64-js/v/1.5.1|
|npm|pako|2.1.0|(MIT AND Zlib)|https://www.npmjs.com/package/pako/v/2.1.0|
|npm|fflate|0.8.3|MIT|https://www.npmjs.com/package/fflate/v/0.8.3|
|npm|pdfjs-dist|6.3.289|Apache-2.0|https://www.npmjs.com/package/pdfjs-dist/v/6.3.289|
|npm|react|19.2.8|MIT|https://www.npmjs.com/package/react/v/19.2.8|
|npm|react-dom|19.2.8|MIT|https://www.npmjs.com/package/react-dom/v/19.2.8|
|npm|scheduler|0.27.0|MIT|https://www.npmjs.com/package/scheduler/v/0.27.0|
