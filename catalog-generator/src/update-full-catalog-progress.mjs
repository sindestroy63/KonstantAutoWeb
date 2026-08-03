import fs from 'node:fs/promises';
import path from 'node:path';
import { DIRS, REPO_ROOT, readJson, writeJson } from './config.mjs';

const currentlyProcessing = process.argv[2] || null;
const cars = await readJson(path.join(REPO_ROOT, 'data', 'cars.json'));
const manifest = await readJson(path.join(REPO_ROOT, 'public', 'images', 'catalog', 'manifest.json'));
const usage = await readJson(path.join(DIRS.reports, 'full-catalog-api-usage.json'));
const exceptions = await readJson(path.join(DIRS.reports, 'full-catalog-exceptions.json'));
const production = new Set(Object.entries(manifest.images || {}).filter(([, entry]) => entry.status === 'production').map(([slug]) => slug));
const remainingModels = cars.filter((car) => !production.has(car.slug)).map((car) => ({ slug: car.slug, manufacturer: car.brand, model: car.model }));
const report = {
  updatedAt: new Date().toISOString(), totalModels: cars.length, productionApproved: production.size,
  remaining: remainingModels.length, currentlyProcessing, retryQueue: [], exceptionQueue: exceptions.exceptionQueue,
  totalApiRequests: usage.totalApiRequests, successfulResponses: usage.successfulResponses,
  infrastructureErrors: usage.infrastructureErrors, qaFailures: usage.qaFailures, promotedCount: usage.promotedCount,
  remainingModels,
};
await writeJson(path.join(DIRS.reports, 'full-catalog-progress.json'), report);
await writeJson(path.join(DIRS.reports, 'full-catalog-coverage.json'), {
  checkedAt: report.updatedAt, totalCatalogModels: cars.length, productionAiImages: production.size,
  missingProductionAiImages: remainingModels.length, coveragePercent: Number(((production.size / cars.length) * 100).toFixed(2)),
  missingSlugs: remainingModels.map((entry) => entry.slug),
});
console.log(JSON.stringify({ total: cars.length, production: production.size, remaining: remainingModels.length, currentlyProcessing }, null, 2));
