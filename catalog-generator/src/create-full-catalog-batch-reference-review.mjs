import path from 'node:path';
import { DIRS, loadModel, readJson, writeJson } from './config.mjs';

const batch = Number(process.argv[2]);
const modelIds = process.argv.slice(3);
if (!Number.isInteger(batch) || batch < 1 || !modelIds.length) {
  throw new Error('Usage: node create-full-catalog-batch-reference-review.mjs <batch> <model-id...>');
}

const entries = [];
for (const modelId of modelIds) {
  const model = await loadModel(modelId);
  const reference = await readJson(path.join(DIRS.references, `${modelId}.json`));
  if (reference.blocked) throw new Error(`${modelId}: unresolved reference`);
  entries.push({
    modelId,
    manufacturer: model.manufacturer,
    model: model.model,
    generation: model.generation,
    modelYears: model.years,
    chassisCode: model.chassisCode,
    market: model.market,
    body: model.body,
    trim: model.trim,
    facelift: model.facelift,
    mustHave: model.identityCues,
    mustNotHave: model.modelExclusions,
    officialReferenceUrls: model.referenceUrls,
    fallbackReferenceUrls: model.fallbackReferenceUrls || [],
    resolvedReferenceUrl: reference.referenceUrl,
    referenceQuality: reference.referenceQuality || model.referenceQuality || 'official',
    confidenceLevel: model.confidenceLevel,
    status: 'reference-approved',
  });
}

const output = path.join(DIRS.reports, `full-catalog-batch-${String(batch).padStart(2, '0')}-reference-review.json`);
await writeJson(output, { batch, reviewedAt: new Date().toISOString(), entries });
console.log(output);
