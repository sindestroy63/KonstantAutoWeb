# Phase 2: Header, Footer and Catalog V2

## Status

Phase 2 migrates the shared header and footer and the production `/catalog` presentation to Design System V2. The catalog data flow, filtering, URLs, pagination, metadata, structured data, APIs and analytics contracts remain unchanged.

The vehicle detail page, lead modal and home page were not redesigned in this phase.

### Phase 2.1 visual polish

The acceptance pass refined presentation only: the desktop header now uses the same compact height before and after scrolling, the scrolled state starts after a small threshold, catalog columns are explicitly constrained at desktop breakpoints, vehicle images use non-cropping contain framing with a consistent inset, card title/fact zones have stable heights, and the mobile filter actions remain reachable with safe-area padding. No catalog contract or production image changed.

## Production components replaced

- `app/layout.tsx` selects `HeaderV2` and `FooterV2` by default.
- `app/catalog/page.tsx` selects `CatalogPageV2` by default while keeping data loading, filtering and pagination on the server.
- `CatalogCardV2` replaces only the catalog listing card presentation. It receives the existing public car fields and links to the existing `/catalog/[slug]` route.
- The desktop filters preserve the existing query keys: `brand`, `bodyType`, `country`, `q` and `page`.
- The mobile filter UI is a lazy-loaded V2 bottom sheet. Draft values remain mounted after first opening so closing the sheet does not discard a selection.

## V1 retained and rollback

The following V1 components remain in place and were not deleted:

- `components/Header.tsx`
- `components/Footer.tsx`
- `app/catalog/CatalogClient.tsx`
- `app/catalog/CarCard.tsx`
- `app/catalog/CatalogFilters.tsx`
- `app/catalog/CatalogSkeleton.tsx`

Rollback does not require restoring files from Git:

```powershell
$env:KONSTANT_UI_VERSION = "v1"
npm.cmd run build
npm.cmd run start
```

For development, set the same environment variable before `npm.cmd run dev`. Remove it or set it to `v2` and restart to enable V2 again. The build-time switch is intentionally minimal and is defined in `lib/ui-version.ts`.

The automated rollback smoke test confirmed that V1 header, catalog page and catalog filters are rendered when the switch is set to `v1`.

## Unchanged contracts

- `data/cars.json` and its schema
- Catalog API and lead-form API
- Routes, slugs and URL query parameters
- Filtering functions and result ordering
- Pagination size and behavior
- SEO metadata, canonical URL and breadcrumb structured data
- Existing production images
- Detail-page links and page behavior

The V2 adapter adds no synthetic catalog fields. Year, generation and status are not shown because the current data model does not provide them. Price presentation uses the existing `budgetMin` and `budgetMax` values.

## Architecture and performance

- Catalog cards, result grid, empty state and pagination remain server-rendered.
- Client code is limited to filter controls, active-filter removal, reset and dialogs.
- The mobile filter sheet is split into a lazy chunk and loaded only after first opening.
- Only the first visible catalog image has `priority`; the remaining cards use lazy loading.
- `ResponsiveImage` reserves a stable aspect ratio and provides the existing image fallback without layout shift.
- No UI dependency was added.

The final production build generated 161 pages. `/catalog` is `6.52 kB` with `115 kB` First Load JS. The Phase 1 reference was approximately `112 kB`; the approximately `3 kB` increase covers accessible filter state, active-filter controls and dialogs.

## Verification

Commands completed successfully:

- `npm run typecheck`
- `npm run lint` with no warnings or errors
- `npm run build`
- V1 rollback smoke test

Browser QA covered `/catalog` at 320, 375, 768, 1024, 1280 and 1440 px. It found no horizontal overflow, broken images, duplicate H1 elements or browser errors. One priority and eleven lazy images were present on the first unfiltered page.

Phase 2.1 measurements:

- Grid columns: 1 at 320/375 px, 2 at 768 px, 3 at 1024/1280 px and 4 at 1440 px.
- Card widths: 288 px at 320, 343 px at 375, 336 px at 768, 296 px at 1024, 360 px at 1280 and 317 px at 1440.
- Inter-card gap remained 20 px at all multi-column checkpoints.
- All catalog images reported `object-fit: contain`, the shared 0.94 framing scale and bounds fully inside their media frames.
- Sticky header height remained 65 px before and after scrolling, with `top: 0` and `position: sticky`.
- The 375 px mobile filter sheet measured 617 px high; its action bar remained fully visible within the 844 px viewport and retained scroll lock/focus return behavior.

Filtering checks:

- Unfiltered catalog: 148 results
- Brand `Toyota`: 9 results
- Body type `Sedan`: 37 results
- Country `Japan`: 37 results
- Search `Camry`: 2 results
- Combined Toyota + Sedan + Japan: 3 results
- Impossible search: empty state with 0 results
- Reset returns to `/catalog`
- Direct query URLs restore the selected filters
- The first detail link resolves to `/catalog/toyota_camry`

Interaction and accessibility checks:

- Exactly one H1 on every tested catalog state
- Header keyboard order and visible `:focus-visible` styles verified
- Mobile menu focus trap, Escape, scroll lock and focus return verified
- Mobile menu closes after navigation and contains phone and primary CTA
- Mobile filters expose associated labels, Escape, scroll lock, focus return, reset and apply actions
- Result changes are announced through `aria-live`
- Hover effects are restricted to hover-capable devices
- Reduced-motion behavior is inherited from Design System V2 tokens

QA evidence:

- `tmp/phase-2-catalog-qa.json`
- `tmp/phase-2-catalog-desktop.png`
- `tmp/phase-2-catalog-mobile.png`
- `tmp/phase-2-catalog-mobile-filters.png`
- `tmp/phase-2-catalog-empty.png`

## Known limitations

- The current car records have no real year, generation or availability-status fields, so the card cannot display them without changing the data contract.
- Sorting remains the existing default order. Adding a sorting control would introduce new behavior and was outside this presentation-only migration.
- Existing production images were deliberately preserved.
- Header active state covers route-level Catalog and Contacts. Tracking active hash sections on the home page would require new client behavior and was not added.
- Visual polish, density and image framing still require owner review on representative physical devices.

## Files

Production integration:

- `app/layout.tsx`
- `app/catalog/page.tsx`
- `lib/ui-version.ts`

Header and footer V2:

- `components/site-v2/HeaderV2.tsx`
- `components/site-v2/HeaderV2.module.css`
- `components/site-v2/FooterV2.tsx`
- `components/site-v2/FooterV2.module.css`

Catalog V2:

- `components/catalog-v2/CatalogPageV2.tsx`
- `components/catalog-v2/CatalogPageV2.module.css`
- `components/catalog-v2/CatalogResultsV2.tsx`
- `components/catalog-v2/CatalogClientV2.tsx`
- `components/catalog-v2/CatalogClientV2.module.css`
- `components/catalog-v2/CatalogCardV2.tsx`
- `components/catalog-v2/CatalogCardV2.module.css`
- `components/catalog-v2/MobileCatalogFiltersV2.tsx`

Design System V2 integration updates:

- `components/ui-v2/core/DesignSystemProvider.tsx`
- `components/ui-v2/core/tokens.module.css`
- `components/ui-v2/layout/Layout.tsx`
- `components/ui-v2/overlays/Dialog.tsx`
- `components/ui-v2/overlays/LazyDialog.tsx`
- `components/ui-v2/index.ts`
- `components/ui-v2/README.md`

Documentation and QA:

- `docs/phase-2-catalog-migration.md`
- `tmp/phase-2-catalog-qa.mjs`
- `tmp/phase-2-catalog-qa.json`
- `tmp/phase-2-rollback-smoke.mjs`
- `tmp/phase-2-rollback-smoke.json`
- `tmp/phase-2-catalog-desktop.png`
- `tmp/phase-2-catalog-mobile.png`
- `tmp/phase-2-catalog-mobile-filters.png`
- `tmp/phase-2-catalog-empty.png`

## Manual acceptance questions

- Is the compact header height and sticky scrolled state visually balanced on desktop and mobile?
- Is the card density appropriate at 1024, 1280 and 1440 px, especially the choice of three versus four columns?
- Does `contain` image framing leave the right amount of neutral space around vehicles with different proportions?
- Is the mobile bottom sheet height comfortable on 320 and 375 px devices?
- Is the hierarchy between price, specifications and the `Подробнее` action strong enough without making every card feel CTA-heavy?
