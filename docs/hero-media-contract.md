# Hero media contract

Hero media is independent from Unified Vehicle Media and the production catalog manifest.

## Required files

- `public/hero-cars/hero-desktop.webp` — 1672×941 px, desktop 16:9 composition.
- `public/hero-cars/hero-mobile.webp` — 1024×1536 px, mobile 2:3 composition.

Both files must be WebP. They are intentionally not registered in
`public/images/catalog/manifest.json` and must not be resolved through
`CarImage`, `getCarMedia`, or `getProductionAiImage`.

The Hero image layer is enabled only when both files exist. If either file is
missing, the page keeps the existing neutral `#c9cac7` Hero background. A
catalog vehicle is never substituted automatically.

## Composition guidance

- Keep important content clear of the left-hand text area on desktop.
- Keep the subject within the central/lower part of the mobile crop.
- Avoid embedded text, logos used as copy, and interface elements.
- Export in sRGB and optimize WebP without changing the required pixel size.

Final assets are supplied manually; the catalog generation pipeline must not
create or promote Hero images.
