# Phase 4 — Vehicle Detail V2

## Scope

The vehicle detail route keeps its URL, static params, metadata, canonical URL, structured data and lead API context. Only its presentation layer was replaced. Header V2, Footer V2, Catalog V2, Hero, `data/cars.json`, API routes and image manifest schema were not changed.

The page presents a vehicle as a reference point for the selection service, not as stock or an ecommerce product.

## Structure

1. Back navigation to the catalog.
2. Production AI media viewer with placeholder, zoom and accessible lightbox.
3. Service summary with indicative price, benefit and two lead actions.
4. Deterministic vehicle benefits.
5. Six-step selection process.
6. Included services and optional registration.
7. Konstant Auto service principles.
8. Up to four related vehicles.
9. Final personal-calculation CTA.

## Media Contract

Every vehicle image is rendered by `CarImage`, which resolves only through `getProductionAiImages()` and `public/images/catalog/manifest.json`. There is no fallback to `cars.json` image fields, legacy galleries, uploads or external URLs. A missing manifest entry renders `VehicleMediaPlaceholder`.

The resolver currently returns zero or one production image while exposing an array contract for future galleries. A single image does not render a thumbnail strip. The first viewer image is the only priority image; related images remain lazy-loaded through `next/image`.

## Deterministic Content

Benefits are generated from local model-specific and body-type templates in `lib/vehicle-detail.ts`; no AI or invented technical specifications are used. Related vehicles are selected from the current catalog by country, body type and price distance, with source order as a stable tie-breaker.

## Accessibility and Interaction

- One H1 and sequential section headings.
- Native buttons and links with visible `focus-visible` states.
- Dialog V2 provides focus trap, Escape close, scroll locking and focus restoration.
- Touch swipe is supported when multiple media entries become available.
- Reduced-motion preferences are respected.
- Mobile ordering is media, summary, then supporting content.
- A safe-area-aware mobile action bar keeps the primary calculation CTA available throughout the page.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm run build
node tmp/detail-v2-qa.mjs
```

QA covers 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px. It checks H1 count, horizontal overflow, broken images, browser errors, forbidden legacy sources, production media, placeholder behavior, lightbox opening, Escape closing and focus restoration.

Artifacts:

- `tmp/detail-desktop.png`
- `tmp/detail-mobile.png`
- `tmp/detail-gallery.png`
- `tmp/detail-related.png`
- `tmp/detail-qa.json`

## Known Limitations

The current production manifest contains at most one approved image per vehicle. The viewer supports multiple entries, but thumbnail and previous/next controls only become visible after the media contract supplies more than one production image.
