# Letterier（レタリエ）

A local Windows application for writing letters directly on stationery, arranging images and signatures, and exporting PDF or printing. [日本語](README.md)

Windows 10/11 x64 and Microsoft WebView2 Runtime are required. The interface switches between Japanese and English. Japanese horizontal and vertical writing and English horizontal writing are supported. Letters and images stay on the PC during normal use. Current version: 1.0.3.

## Use

Choose stationery with **Choose stationery**, click the paper and type. Twenty designs keep their decoration outside the fixed writing area. A4, B5 and postcard sizes are available. Text flows between pages and around positioned objects. Choose a default font before writing, format a selection, or apply the default to one page or the whole letter. Add an image with **Photo / Image** or a **Text box**. Objects support movement, resizing, rotation, opacity, stacking and flow/page anchoring.

Use **File → Save as…** to save a `.binsen` document. Recovery data is saved locally while editing. **PDF / Print** previews and exports PDF or prints through Windows, with actual size, fit and cancel choices for printable-area warnings. The 21 color-only interface themes and larger control text do not change printed stationery.

Printing defaults to fitting the entire sheet inside the printer's printable area. The Print preview reflects the selected scale and unprintable margins; its dotted guide is never printed. Actual-size printing can clip decorations near physical paper edges. The PDF preview and exported PDF always use actual page dimensions, independently of printer scaling.

## Data and recovery

`.binsen` stores only the current document and embedded assets. **History** keeps 50 ordinary revisions plus protected versions, previews before restoring, and protects the state before restoration. A `.binsenbak` export includes history. Recent documents reopen local recovery copies; reopen the original file explicitly to keep saving to it. Save important work by name and keep a backup on separate media. The app reports save failures and prevents closing when the final save fails.

Ctrl+S saves, Ctrl+Shift+S saves as, Ctrl+Z undoes, Ctrl+Y redoes, and Ctrl+Enter inserts a page break. Ctrl+A inside the paper selects the body.

Twenty handwriting fonts are bundled. Installed Windows fonts can also be used; missing font names are preserved while a fallback is displayed. Image support includes raster images, a static SVG subset, GIF/WebP frame selection, flattened 8-bit RGB PSD, PDF-compatible AI/PDF page selection, and HEIC when Windows codecs support it. See [format details](IMAGE-FORMATS.md). Text, rulings, and static SVG remain vector in PDF. Generated stationery motifs and raster artwork are embedded as images; the whole sheet is not flattened into one image. Imported AI/PDF pages are rasterized. Word files, PSD layer editing, cloud sync and mobile use are outside scope.

## Build

Validated toolchain: Node.js 22+, Rust 1.93.1, Windows C++ Build Tools and Windows SDK.

```powershell
npm ci
npm test
npm run check
npm run test:native
npm run build:native
```

Run development with `npm run tauri -- dev`. Outputs are `.local/frontend` and `.local/cargo-target`. Browser regression scripts are under `tests/browser`; browser IndexedDB is test storage separate from Windows app data. Generate notices with `python scripts/collect-licenses.py` after fetching dependencies. Pinned fonts and PDF resources are already local; acquisition scripts are under `scripts/`.

See [distribution](distribution/README.md) for Store and direct-download preparation. Source is public on [GitHub](https://github.com/ytec-forge-commits/letterier); Forge and Microsoft Store packages remain pending final review and signing.

Original code is [Apache-2.0](LICENSE). [Third-party notices](THIRD_PARTY_NOTICES.md), [asset terms](ASSETS_LICENSE.md), [brand policy](BRAND_POLICY.md), [scope exceptions](LICENSE_EXCEPTIONS.md) and [privacy](PRIVACY.md) apply separately. Full notices and unmodified MPL corresponding source are included in `public/legal/` and the distribution's legal directory.
