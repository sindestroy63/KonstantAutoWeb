# Konstant Catalog Generation System v3

Staging-only catalog image pipeline. It builds prompts from compact model facts, validates official references, generates through `gpt-image-2`, normalizes images, runs deterministic QA, and creates a contact sheet plus HTML preview.

## Commands

Run commands from the repository root:

```powershell
node catalog-generator/src/cli.mjs prompt --model bmw-3-series
node catalog-generator/src/cli.mjs references
node catalog-generator/src/cli.mjs generate --model bmw-3-series
node catalog-generator/src/cli.mjs qa
node catalog-generator/src/cli.mjs preview
node catalog-generator/src/cli.mjs pipeline --model bmw-3-series
node catalog-generator/src/cli.mjs sync
node catalog-generator/src/cli.mjs promotion-dry-run
```

Generation requires `OPENAI_API_KEY` and `OPENAI_BASE_URL`. The key is read only from the process environment and is never written to disk. Generated source URLs are recorded in staging reports and never copied into production manifests.

`sync` only scaffolds missing model configs as `draft`. It does not generate or promote them.

Production promotion is deliberately separate and cannot run without both an approved model state and explicit owner confirmation:

```powershell
node catalog-generator/src/cli.mjs promote --model bmw-3-series --owner-confirmed
```

The promotion command is implemented for the future workflow but must only be run after owner approval. It refuses unapproved items and dirty target files. It does not run automatically.

`promotion-dry-run` reads `reports/pilot-final-review.json`, includes only fully approved pilot models, preserves existing `cars.json` image URLs, and writes the proposed replacements, backups, manifest entries and complete file impact to `reports/promotion-dry-run.json`. It never copies images, edits production, stages git files or creates a commit.

## Lifecycle

`draft -> generated -> qa -> approved -> production`

Only `draft -> generated -> qa` are automatic. Owner approval must be recorded explicitly before promotion.

## QA scope

Dimensions, format, aspect ratio, corner background, vehicle scale, and horizon consistency are deterministic Sharp-based checks. One-car, people, text, watermark, generation identity, and body defects require an optional vision adapter or manual owner review and remain `pending` without one.
