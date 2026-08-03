import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { DIRS, REPO_ROOT, loadModel, readJson, saveModel, writeJson } from './config.mjs';

const batch = Number(process.argv[2]);
if (!Number.isInteger(batch) || batch < 1) throw new Error('Usage: node promote-full-catalog-batch.mjs <batch-number>');
const prefix = `full-catalog-batch-${String(batch).padStart(2, '0')}`;
const semanticPath = path.join(DIRS.reports, `${prefix}-semantic-qa.json`);
const semantic = await readJson(semanticPath);
const approved = semantic.entries.filter((entry) => entry.status === 'approved' && entry.generationQa === 'approved' && entry.semanticQa === 'approved');
if (!approved.length || approved.length !== semantic.entries.length) throw new Error(`${prefix}: every entry must be fully approved before promotion`);

const manifestPath = path.join(REPO_ROOT, 'public', 'images', 'catalog', 'manifest.json');
const carsPath = path.join(REPO_ROOT, 'data', 'cars.json');
const imageRoot = path.dirname(manifestPath);
const manifest = await readJson(manifestPath);
const cars = await readJson(carsPath);
const carsBefore = createHash('sha256').update(await fs.readFile(carsPath)).digest('hex');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupRoot = path.join(REPO_ROOT, 'catalog-generator', 'backups', `${prefix}-${timestamp}`);
const plans = [];

for (const review of approved) {
  const model = await loadModel(review.modelId);
  const qa = await readJson(path.join(DIRS.qa, `${model.id}.json`));
  if (!qa.deterministicPass) throw new Error(`${model.id}: deterministic QA is not passing`);
  for (const key of ['exactlyOneVehicle', 'noPeople', 'noText', 'noWatermark']) qa.checks[key] = { status: 'pass', method: 'agent-visual-review' };
  qa.checks.generationIdentity = { status: 'approved', method: 'agent-visual-review' };
  qa.semanticQa = 'approved'; qa.generationQa = 'approved'; qa.finalStatus = 'production-approved';
  await writeJson(path.join(DIRS.qa, `${model.id}.json`), qa);
  const car = cars.find((entry) => entry.slug === model.catalogSlug);
  if (!car) throw new Error(`${model.id}: missing cars.json slug ${model.catalogSlug}`);
  const file = String(car.image || '').match(/^\/images\/catalog\/([a-z0-9-]+\.webp)$/i)?.[1] || `${model.catalogSlug.replaceAll('_', '-')}.webp`;
  const staging = path.join(DIRS.outputs, model.outputFilename);
  const production = path.join(imageRoot, file);
  const stagingSha256 = createHash('sha256').update(await fs.readFile(staging)).digest('hex');
  const metadata = await sharp(staging, { failOn: 'error' }).metadata();
  if (metadata.width !== 1600 || metadata.height !== 1000 || metadata.format !== 'webp') throw new Error(`${model.id}: invalid staging image`);
  plans.push({ review, model, staging, production, file, stagingSha256, replacesExisting: await fs.access(production).then(() => true).catch(() => false) });
}

const dryRun = {
  generatedAt: new Date().toISOString(), batch, productionWritesPerformed: false,
  models: plans.map(({ model, staging, production, file, stagingSha256, replacesExisting }) => ({ modelId: model.id, catalogSlug: model.catalogSlug, stagingFile: path.relative(REPO_ROOT, staging), targetProductionPath: path.relative(REPO_ROOT, production), file, stagingSha256, replacesExisting, backupPath: path.relative(REPO_ROOT, path.join(backupRoot, 'production', file)) })),
  affectedFiles: [path.relative(REPO_ROOT, manifestPath), ...plans.map(({ production }) => path.relative(REPO_ROOT, production))],
  explicitlyUnchanged: ['data/cars.json', 'app', 'components', 'Hero', 'SEO', 'API', '.git'],
};
await writeJson(path.join(DIRS.reports, `${prefix}-promotion-dry-run.json`), dryRun);

await fs.mkdir(path.join(backupRoot, 'production'), { recursive: true });
await fs.mkdir(path.join(backupRoot, 'model-configs'), { recursive: true });
await fs.copyFile(manifestPath, path.join(backupRoot, 'manifest.json'));
for (const { model, production, file, replacesExisting } of plans) {
  await fs.copyFile(path.join(DIRS.models, `${model.id}.json`), path.join(backupRoot, 'model-configs', `${model.id}.json`));
  if (replacesExisting) await fs.copyFile(production, path.join(backupRoot, 'production', file));
}

const promoted = [];
for (const plan of plans) {
  await fs.copyFile(plan.staging, plan.production);
  const productionSha256 = createHash('sha256').update(await fs.readFile(plan.production)).digest('hex');
  if (productionSha256 !== plan.stagingSha256) throw new Error(`${plan.model.id}: SHA mismatch after copy`);
  manifest.images[plan.model.catalogSlug] = {
    file: plan.file, generation: plan.model.generation, chassisCode: plan.model.chassisCode,
    sourceSha256: plan.stagingSha256, status: 'production', stagingFile: path.relative(REPO_ROOT, plan.staging), promotedAt: new Date().toISOString(),
  };
  plan.model.status = 'production'; plan.model.approved = true; plan.model.approvalStatus = 'production-approved';
  await saveModel(plan.model);
  promoted.push({ modelId: plan.model.id, catalogSlug: plan.model.catalogSlug, productionFile: path.relative(REPO_ROOT, plan.production), sha256: productionSha256, verified: true });
}
manifest.modelCount = Object.values(manifest.images).filter((entry) => entry.status === 'production').length;
manifest.generatedAt = new Date().toISOString();
await writeJson(manifestPath, manifest);
const carsAfter = createHash('sha256').update(await fs.readFile(carsPath)).digest('hex');
if (carsAfter !== carsBefore) throw new Error('cars.json changed during manifest-only promotion');
const report = { generatedAt: new Date().toISOString(), batch, backupRoot: path.relative(REPO_ROOT, backupRoot), promoted, manifestProductionEntries: manifest.modelCount, carsJsonSha256Before: carsBefore, carsJsonSha256After: carsAfter, carsJsonUnchanged: true, gitCommitCreated: false };
await writeJson(path.join(DIRS.reports, `${prefix}-promotion-report.json`), report);
const usagePath = path.join(DIRS.reports, 'full-catalog-api-usage.json');
const usage = await readJson(usagePath);
usage.promotedCount += promoted.length;
usage.qaFailures += semantic.entries.reduce((total, entry) => total + Math.max(0, Number(entry.attempts || 1) - 1), 0);
usage.updatedAt = new Date().toISOString();
await writeJson(usagePath, usage);
console.log(JSON.stringify(report, null, 2));
