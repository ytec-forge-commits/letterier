# Letterier（レタリエ）

A local Windows application for writing letters directly on stationery, arranging images and signatures, and exporting PDF or printing. [日本語](README.md)

Windows 10/11 x64 and Microsoft WebView2 Runtime are required. The interface switches between Japanese and English. Japanese horizontal and vertical writing and English horizontal writing are supported. Letters and images stay on the PC during normal use. Current candidate version: 2.0.0. Validation and distribution preparation are in progress; this candidate is not yet published.

## Use

Use the startup **New letter** dialog or **Home → New letter**, choose stationery, click the paper and type. Twenty designs are available; line width can change near artwork to avoid overlapping it. A4, B5 and postcard sizes are available. Text flows between pages and around positioned objects. Choose a default font before writing, format a selection, or apply formatting to one page or the whole letter. Add an image with **Insert → Photo / Image** or **Text box**. Objects support movement, resizing, rotation, opacity, stacking and flow/page anchoring. Each text box can use horizontal or vertical writing independently.

Home offers character spacing from 0 to 12 pt. Layout offers a default body size from 6 to 72 pt while preserving explicitly assigned sizes. The bottom-right slider adjusts zoom from 50% to 125%. Dismissible popups close on outside clicks. The next launch restores the saved normal window size and maximized state, adjusting to the visible area if the display arrangement changes.

Use **File → Save as…** to save a `.binsen` document. Recovery data is saved locally while editing. **PDF / Print** previews and exports PDF or prints through Windows, with actual size, fit and cancel choices for printable-area warnings. The 21 color-only interface themes and larger control text do not change printed stationery.

Printing defaults to fitting the entire sheet inside the printer's printable area. The Print preview reflects the selected scale and unprintable margins; its dotted guide is never printed. Actual-size printing can clip decorations near physical paper edges. The PDF preview and exported PDF always use actual page dimensions, independently of printer scaling.

## Data and recovery

`.binsen` stores only the current document and embedded assets. **History** keeps 50 ordinary revisions plus protected versions, previews before restoring, and protects the state before restoration. A `.binsenbak` export includes history. Recent documents reopen local recovery copies; reopen the original file explicitly to keep saving to it. Automatic recovery never overwrites the original file. Failures show a warning and retry up to three times after 5, 15, and 30 seconds. Save important work by name and keep a backup on separate media. When switching or closing, choosing Save stops the operation if saving fails or the destination dialog is cancelled. Normal startup does not silently reopen the last letter; open it explicitly from the recovery notice.

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
