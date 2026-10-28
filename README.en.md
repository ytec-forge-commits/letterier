# Letterier（レタリエ）

A local Windows application for writing letters directly on stationery, arranging images and signatures, and exporting PDF or printing. [日本語](README.md)

Windows 10/11 x64 and Microsoft WebView2 Runtime are required. The interface switches between Japanese and English. Japanese horizontal and vertical writing and English horizontal writing are supported. Letters and images are processed locally; normal use requires no internet connection.

This update is **2.1.0**. Check each distribution channel for its publication or Store submission status. See the [English user manual](docs/manual/en/README.md) for illustrated instructions.

The following describes the earlier 1.0.4 review. Review folders and SHA-256 identify them separately from earlier official artifacts with the same version number. Mixed-size field input and upright vertical PDF text were fixed; Windows saving, explicit recovery, and thirteen multi-paper PDFs (twenty-five pages) were checked. See the [save](docs/SAVE-RECOVERY-VALIDATION.md) and [output](docs/NATIVE-OUTPUT-VALIDATION.md) records for scope and unverified scenarios. This does not attest to physical printing, the OS-close unsaved guard, or completion of the full independent review.

Letterier is freeware; its original source code is licensed under Apache License 2.0. It supports 64-bit Windows 10 and 11 and uses Microsoft WebView2 Runtime. See the [distribution information](distribution/README-VECTOR.txt) for installation, removal, third-party works, and author contact details. Support is available through [Y-TEC Forge contact](https://ytec.cloudfree.jp/forge/en/contact/).

## Unpublished development changes (2026-10-27)

Under **Home → Page appearance**, **Print page numbers** places horizontal page numbers at the bottom center of each sheet. Editing, output previews, PDF and printing share the numbers. Selecting an output range preserves original page numbers. Enabling numbers reserves at least 16 mm at the bottom for the body; documents with small margins may reflow. Existing documents keep this option off.

**Align line ends** distributes extra character spacing across wrapped horizontal or vertical lines. Paragraph endings, manual line/page breaks, and the final line remain unexpanded. It inserts no spaces into the body and preserves explicit formatting. Existing documents keep this option off.

Selecting a font in bulk formatting now enables **Set font**. The current page follows keyboard navigation as well as clicks. After Undo/Redo, changed text or formatting is highlighted for about five seconds; removal is shown with a position marker. The affected location is brought into view. Editing or moving the cursor clears the marker. Markers are never saved, printed, or exported to PDF.

Editing avoids duplicate layout computation, skips unchanged editable pages and unnecessary localization scans in Japanese, and indexes caret locations within each page. On Windows, MS-IME uses its standard vertical candidate window for vertical body text. Google Japanese Input uses an app-rendered vertical window for conversion candidates and predictions expanded with Tab, including click-to-confirm and candidate paging. Google's automatic suggestions retain their standard horizontal window. If the native connection fails, the app explains the fallback and restores the previous input method. Text boxes retain their existing input method.

Undo and Redo are temporarily disabled during IME composition. Confirm with Enter or cancel with Esc to use them again.

Koibumi Penji is not bundled. Fudegurume's [official terms](https://fudegurume.jp/support/fg/qa/aboutproduct/fw_02005_26.html) prohibit redistribution and restrict PDF embedding. Reconsideration requires a separate embedding and redistribution permission.

## Use

Sakura, Rapeseed, Morning Glory, Goldfish, Maple, Moon, Snow Garden, Camellia, Mimosa, Tulip, Seaside Blue, Lemon Letter, Autumn Leaves, Woodland Harvest, Snow Crystal, Christmas Wreath, White Washi, Indigo Ichimatsu, Classic Letter, and Pastel Dots offer five distinct designs each through **Design**, with optional cycling on following pages. Range application starts from the selected design and preserves pages outside the range. Design 1 of Washi, Classic, and Dots retains its original vector decoration; additional designs use distinct artwork. Generation prompts, asset hashes, and verification scope are recorded in [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md).

Choose stationery from **New letter** at startup, click the paper and type. **Change stationery** changes an existing letter's design. Twenty series offer five designs each and support following-page cycling. A4, B5 and postcard sizes are available. Text flows between pages and around positioned objects. Choose **Default font** under Layout before writing. Home supports selection formatting and **Change body formatting…** for one page or the whole body, optionally including text boxes while preserving color, bold, italic, and underline. Add an image with **Photo / Image** or a **Text box**. Objects support movement, resizing, rotation, opacity, stacking and flow/page anchoring. Each text box can use horizontal or vertical writing independently. Holding an object near the top or bottom edge while dragging auto-scrolls the document and lets it move to another page.

Under **Layout → Background, rules, and margins…**, new letters default to automatic rule spacing and thickness based on font size. Larger text gets the spacing it needs. Turn automatic adjustment off to use manual values; legacy documents are not silently opted in. **Target full-width characters per line** is a guide based on the default font, not a fixed count for mixed sizes or Latin text. Wrapping uses actual widths; page limits clamp oversized targets, and changes that cannot fit even one glyph are refused.

Drag the background preview to move it and use corner handles for proportional resizing, or choose Fill the page, Fit the entire image, or Reset position and size. Save custom stationery with **Save current stationery…** and select it under **My templates** in New letter or Change stationery. **Update registration from this stationery…** replaces the registration without changing existing letters. Apply a design to all pages, this page, or a range while preserving body text, formatting, and your added photos.

Drag selected body text to another position to move it while preserving its fonts, sizes, colors, and other formatting. Hold Ctrl when dropping to copy instead. Objects anchored to moved text keep their association; page-fixed items stay in place. Copying body text does not duplicate images or text boxes. One Undo reverses the operation.

Use **File → Save as…** to save a `.binsen` document. Recovery data is saved locally while editing. **PDF / Print** previews and exports PDF or prints through Windows, with actual size, fit and cancel choices for printable-area warnings. The 21 color-only interface themes and larger control text do not change stationery artwork or printed output.

Printing defaults to fitting the entire sheet inside the printer's printable area. The Print preview reflects the selected scale and unprintable margins; its dotted guide is never printed. Actual-size printing can clip decorations near physical paper edges. The PDF preview and exported PDF always use actual page dimensions, independently of printer scaling.

## Data and recovery

See the [save and recovery validation record](docs/SAVE-RECOVERY-VALIDATION.md) for work-in-progress tests, fixes, and unverified scenarios.

`.binsen` stores only the current document and embedded assets. **History** keeps 50 ordinary revisions plus protected versions, previews before restoring, and protects the state before restoration. A `.binsenbak` export includes history. Recent documents reopen local recovery copies; reopen the original file explicitly to keep saving to it.

Automatic recovery saves never overwrite the original file. Use **Save** or **Save as** for file saving. Before creating, switching documents, or closing, unsaved changes offer Save, Don't Save, and Cancel. Choosing Save stops the operation if file saving fails or the destination dialog is cancelled. Don't Save explicitly continues without preserving those changes in the file; recovery data is not guaranteed. Save important work by name and keep a backup on separate media. Normal startup does not automatically reopen the previous letter; available recovery data can be opened explicitly from its notice.

Ctrl+S saves, Ctrl+Shift+S saves as, Ctrl+Z undoes, Ctrl+Y redoes, and Ctrl+Enter inserts a page break. Ctrl+A inside the paper selects the body.

Twenty handwriting fonts are bundled. Installed Windows fonts can also be used; missing font names are preserved while a fallback is displayed. Image support includes raster images, a static SVG subset, GIF/WebP frame selection, flattened 8-bit RGB PSD, PDF-compatible AI/PDF page selection, and HEIC when Windows codecs support it. See [format details](IMAGE-FORMATS.md). Text, rulings, and static SVG remain vector in PDF. Generated stationery motifs and imported raster artwork are embedded as images; Letterier does not flatten the whole sheet into one image. Imported AI/PDF pages are rasterized. Word files, PSD layer editing, cloud sync and mobile use are outside scope.

## More space on a laptop (unpublished development build)

Use **Collapse toolbar** at the right end of the tabs, or Ctrl+F1, to hide the large command panel. Save, Undo/Redo and tabs remain available. Choosing a tab opens its panel again.

**Reading view** hides the tools and side panels and shows the letter without editing controls. Its footer provides page navigation, fit width, whole-page fitting and zoom; PDF / Print remains available. **Back to editing** or Esc restores the editor's scroll position, zoom and collapsed state. Confirm or cancel IME composition before switching. These display choices last for the current app session and do not change body text, print dimensions or the document format.

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

See [distribution](distribution/README.md) for Store and direct-download preparation. Source is public on [GitHub](https://github.com/ytec-forge-commits/letterier); Forge and Microsoft Store distribution remain pending final review.

Original code is [Apache-2.0](LICENSE). [Third-party notices](THIRD_PARTY_NOTICES.md), [asset terms](ASSETS_LICENSE.md), [brand policy](BRAND_POLICY.md), [scope exceptions](LICENSE_EXCEPTIONS.md), [privacy](PRIVACY.md), and the [code-signing policy](CODE_SIGNING_POLICY.md) apply separately. Full notices and unmodified MPL corresponding source are included in `public/legal/` and the distribution's legal directory.
