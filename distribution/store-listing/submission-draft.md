# Letterier Microsoft Store submission draft

Prepared: 2026-09-14 (JST)

This is a local preparation note. It does not authorize starting or saving a Partner Center submission, uploading the package, or submitting it for certification.

## Partner Center identity

- Reserved product name: レタリエ
- English display name: Letterier
- Store ID: `9NQVWSFS92R8`
- Store URL: `https://apps.microsoft.com/detail/9NQVWSFS92R8`
- Package identity name: `Y-TEC.46945B17A33AA`
- Publisher: `CN=F7BD381A-C29C-41A4-B039-8E9962198E21`
- Publisher display name: `Y-TEC`
- Package family name: `Y-TEC.46945B17A33AA_y7q84f7nwz24j`

The name reservation expires after the period shown by Partner Center. Confirm the current expiration date before the final submission if work is resumed later.

## Intended availability

These values are a proposal and must be checked against the exact Partner Center wording before saving.

- Markets: all available markets, including future markets
- Audience: public
- Discoverability: available and discoverable in Microsoft Store
- Release: as soon as certification and publishing complete
- Stop acquisition: never
- Base price: Free
- Free trial: none
- Device family: Windows 10/11 Desktop, x64
- Future device families: let Microsoft decide

Rationale: Letterier is an Apache-2.0 open-source freeware application with no paid features or in-app purchases.

## Properties

- Primary category: Productivity (`仕事効率化`)
- Secondary category: none
- Personal information: expected **No** for app-specific collection or transmission
  - Letter contents, imported images, local history, and settings stay on the user's PC.
  - The user can explicitly save to a network location or print to a network printer; Letterier does not independently transmit that data.
  - Answer only after reading the exact Partner Center definition shown in the form.
- Privacy policy: `https://github.com/ytec-forge-commits/letterier/blob/main/PRIVACY.md`
- Japanese website: `https://ytec.cloudfree.jp/forge/projects/letterier/`
- English website: `https://ytec.cloudfree.jp/forge/en/projects/letterier/`
- Japanese support: `https://ytec.cloudfree.jp/forge/contact/`
- English support: `https://ytec.cloudfree.jp/forge/en/contact/`
- Purchases outside Microsoft Store commerce: No
- Accessibility-tested declaration: leave unchecked unless a complete accessibility conformance test is separately recorded
- Pen/ink: No
- Generative AI: No
- Special hardware requirements: none

## Age rating questionnaire

- Use the IARC questionnaire; no existing certificate is supplied.
- App type: all other app types.
- Expected content answers: no violence, fear, sexuality, gambling, controlled substances, profanity, public user-generated content, or unrestricted web browsing.

Each answer must follow the exact wording displayed by IARC. Do not infer an answer for a question not covered above.

## Store package

- Upload candidate: `output/msix-20260914-164911/LetterAtelier-1.0.4.0-x64-unsigned.msix`
- SHA-256: `2A924737E8A550973C05153D76488178C70F300E71E995009CCEFADE0964B352`
- Package architecture: x64
- Version: 1.0.4.0
- Windows App Certification Kit: overall PASS on 2026-09-14
- Optional WACK check: `Blocked executables` reported FAIL, while the report's overall result remained PASS
- File association: `.binsen`, with a document icon distinct from the app icon

The Microsoft Store re-signs accepted packages. This candidate intentionally uses the Partner Center identity and is not the separately self-signed direct-distribution package.

## Listing sources and images

- Japanese copy: `distribution/store-listing/listing-ja.md`
- English copy: `distribution/store-listing/listing-en.md`
- Certification notes: `distribution/store-listing/certification-notes.md`
- Store logo: `distribution/store-listing/images/store-logo-300.png` (300 x 300)
- Japanese screenshots: `ja-01-stationery.png` through `ja-04-text-box.png`
- English screenshots: `en-01-stationery.png` through `en-04-settings.png`
- Screenshot size: 1536 x 960 PNG
- Screenshot data: synthetic spring/cherry-blossom letter text only; no personal data

## Protected Partner Center actions

Obtain a fresh, explicit confirmation immediately before each externally mutating stage:

1. Start the first submission and save availability/properties/age-rating declarations.
2. Upload the MSIX and save Japanese/English listings and images.
3. Select **Submit for certification**.

Before the final submission, verify the package hash, current draft state, pricing, markets, age-rating answers, and all public URLs one more time.
