import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { DIRS, GENERATOR_ROOT, REPO_ROOT, loadModels, loadSettings, readJson, saveModel, writeJson } from './config.mjs';

const execFileAsync = promisify(execFile);
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function importV2() {
  const sourceRoot = path.join(REPO_ROOT, 'tmp', 'generated-catalog-pilot-v2');
  const models = await loadModels();
  const imported = [];
  await fs.mkdir(DIRS.outputs, { recursive: true });
  for (const model of models) {
    const source = path.join(sourceRoot, model.outputFilename);
    const target = path.join(DIRS.outputs, model.outputFilename);
    try { await fs.access(target); continue; } catch {}
    await fs.copyFile(source, target);
    imported.push(model.id);
  }
  return imported;
}

export async function syncCars() {
  const carsPath = path.join(REPO_ROOT, 'data', 'cars.json');
  const cars = await readJson(carsPath);
  const models = await loadModels();
  const bySlug = new Map(models.map((model) => [model.catalogSlug, model]));
  const created = [], missingOutputs = [];
  for (const car of cars) {
    let model = bySlug.get(car.slug);
    if (!model) {
      const id = slugify(`${car.brand}-${car.model}`);
      model = {
        id, catalogSlug: car.slug, manufacturer: car.brand, model: car.model,
        generation: 'TODO: official current generation', chassisCode: 'TODO', years: 'TODO', facelift: 'TODO',
        market: 'TODO', body: car.bodyType || 'TODO', trim: 'TODO', paint: 'factory production color',
        identityCues: [], modelExclusions: ['previous generation', 'concept', 'fantasy design'],
        referenceUrls: [], outputFilename: `${id}.webp`, status: 'draft', approved: false,
      };
      await saveModel(model);
      created.push(id);
    }
    try { await fs.access(path.join(DIRS.outputs, model.outputFilename)); } catch { missingOutputs.push(model.id); }
  }
  const report = { checkedAt: new Date().toISOString(), carsCount: cars.length, createdDraftConfigs: created, missingOutputs, nextAction: created.length ? 'Complete official reference discovery and identity fields; generation remains blocked until then.' : 'Generate missing outputs into staging.' };
  await writeJson(path.join(DIRS.reports, 'sync-report.json'), report);
  return report;
}

export async function approveModel(model, ownerConfirmed) {
  if (!ownerConfirmed) throw new Error('Approval requires --owner-confirmed');
  if (model.status !== 'qa') throw new Error(`${model.id}: approval requires qa status, current status is ${model.status}`);
  const qa = await readJson(path.join(DIRS.qa, `${model.id}.json`));
  if (!qa.deterministicPass) throw new Error(`${model.id}: deterministic QA did not pass`);
  model.status = 'approved'; model.approved = true;
  await saveModel(model);
  return model;
}

export async function promoteModel(model, ownerConfirmed) {
  if (!ownerConfirmed) throw new Error('Production promotion requires --owner-confirmed');
  if (!model.approved || model.status !== 'approved') throw new Error(`${model.id}: only owner-approved models can be promoted`);
  const qa = await readJson(path.join(DIRS.qa, `${model.id}.json`));
  if (!qa.deterministicPass) throw new Error(`${model.id}: deterministic QA did not pass`);
  const targets = ['data/cars.json', 'public/images/catalog/manifest.json'];
  const { stdout } = await execFileAsync('git', ['status', '--porcelain', '--', ...targets], { cwd: REPO_ROOT });
  if (stdout.trim()) throw new Error(`Production targets have uncommitted changes:\n${stdout}`);
  const imageDir = path.join(REPO_ROOT, 'public', 'images', 'catalog');
  const imageTarget = path.join(imageDir, model.outputFilename);
  await fs.mkdir(imageDir, { recursive: true });
  await fs.copyFile(path.join(DIRS.outputs, model.outputFilename), imageTarget);
  const carsPath = path.join(REPO_ROOT, 'data', 'cars.json');
  const cars = await readJson(carsPath);
  const car = cars.find((entry) => entry.slug === model.catalogSlug);
  if (!car) throw new Error(`cars.json does not contain ${model.catalogSlug}`);
  car.image = `/images/catalog/${model.outputFilename}`;
  await writeJson(carsPath, cars);
  const manifestPath = path.join(imageDir, 'manifest.json');
  let manifest = { version: 1, images: {} };
  try { manifest = await readJson(manifestPath); } catch {}
  manifest.images ||= {};
  manifest.images[model.catalogSlug] = { file: model.outputFilename, generation: model.generation, approvedAt: new Date().toISOString() };
  await writeJson(manifestPath, manifest);
  await execFileAsync('git', ['add', '--', path.relative(REPO_ROOT, imageTarget), 'data/cars.json', path.relative(REPO_ROOT, manifestPath)], { cwd: REPO_ROOT });
  await execFileAsync('git', ['commit', '-m', `catalog: promote ${model.manufacturer} ${model.model}`], { cwd: REPO_ROOT });
  model.status = 'production';
  await saveModel(model);
  return { imageTarget, carsPath, manifestPath };
}

async function sha256(file) {
  const hash = createHash('sha256');
  hash.update(await fs.readFile(file));
  return hash.digest('hex');
}

export async function dryRunPilotPromotion() {
  const finalReview = await readJson(path.join(DIRS.reports, 'pilot-final-review.json'));
  const settings = await loadSettings();
  const carsPath = path.resolve(GENERATOR_ROOT, settings.production.carsJson);
  const manifestPath = path.resolve(GENERATOR_ROOT, settings.production.manifest);
  const imageRoot = path.resolve(GENERATOR_ROOT, settings.production.imageDirectory);
  const cars = await readJson(carsPath);
  const models = await loadModels();
  const pilotKeys = new Set(finalReview.entries.map((entry) => `${entry.manufacturer}|${entry.model}`));
  const pilotModels = models.filter((model) => pilotKeys.has(`${model.manufacturer}|${model.model}`));
  const approvedKeys = new Set(finalReview.entries.filter((entry) => entry.status === 'approved').map((entry) => `${entry.manufacturer}|${entry.model}`));
  const batchId = `pilot-v3-${new Date().toISOString().replace(/[:.]/g, '-').replace('Z', '')}`;
  const backupRoot = path.join(GENERATOR_ROOT, 'backups', batchId);
  const promotions = [];
  const excludedModels = [];

  for (const model of pilotModels) {
    const review = finalReview.entries.find((entry) => entry.manufacturer === model.manufacturer && entry.model === model.model);
    if (!approvedKeys.has(`${model.manufacturer}|${model.model}`) || model.status !== 'approved' || !model.approved) {
      excludedModels.push({ manufacturer: model.manufacturer, model: model.model, status: review?.status || model.status, reason: review?.issues?.join(' ') || 'Model is not fully approved.' });
      continue;
    }
    const car = cars.find((entry) => entry.slug === model.catalogSlug);
    if (!car) {
      excludedModels.push({ manufacturer: model.manufacturer, model: model.model, status: 'blocked', reason: `cars.json has no ${model.catalogSlug} entry.` });
      continue;
    }
    if (!String(car.image).startsWith('/images/catalog/')) throw new Error(`${model.id}: unsafe production image path ${car.image}`);
    const productionRelative = car.image.replace(/^\/+/, '').replaceAll('/', path.sep);
    const target = path.resolve(REPO_ROOT, 'public', productionRelative.replace(/^images[\\/]catalog[\\/]/, 'images/catalog/'));
    if (!target.startsWith(`${imageRoot}${path.sep}`)) throw new Error(`${model.id}: production target escapes catalog directory`);
    const staging = path.join(DIRS.outputs, model.outputFilename);
    const backup = path.join(backupRoot, path.basename(target));
    const targetExists = await fs.access(target).then(() => true).catch(() => false);
    const targetStat = targetExists ? await fs.stat(target) : null;
    promotions.push({
      manufacturer: model.manufacturer, model: model.model, generation: model.generation,
      stagingFile: path.relative(REPO_ROOT, staging), stagingSha256: await sha256(staging),
      targetProductionPath: path.relative(REPO_ROOT, target),
      existingFile: { path: path.relative(REPO_ROOT, target), exists: targetExists, bytes: targetStat?.size ?? null, sha256: targetExists ? await sha256(target) : null },
      backupPath: path.relative(REPO_ROOT, backup),
      carsJsonChange: { slug: car.slug, field: 'image', before: car.image, after: car.image, changed: false, reason: 'Preserve the current public URL and replace its file atomically.' },
      manifestChange: { key: car.slug, before: null, after: { file: path.basename(target), generation: model.generation, chassisCode: model.chassisCode, sourceSha256: await sha256(staging), status: 'production' } },
    });
  }

  const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);
  const wouldReplace = promotions.filter((item) => item.existingFile.exists).map((item) => item.targetProductionPath);
  const wouldCreate = promotions.filter((item) => !item.existingFile.exists).map((item) => item.targetProductionPath);
  const report = {
    generatedAt: new Date().toISOString(), dryRun: true, scope: 'owner-reviewed 12-model V2 pilot', batchId,
    productionWritesPerformed: false, gitCommitCreated: false,
    approvedModels: promotions.length, excludedModels,
    productionManifest: { path: path.relative(REPO_ROOT, manifestPath), exists: manifestExists, action: manifestExists ? 'merge approved entries' : 'create manifest with approved entries' },
    carsJson: { path: path.relative(REPO_ROOT, carsPath), action: 'no write required; all existing public image URLs are preserved', changes: promotions.map((item) => item.carsJsonChange) },
    promotions,
    affectedFiles: {
      wouldRead: [path.relative(REPO_ROOT, carsPath), ...promotions.map((item) => item.stagingFile), ...promotions.map((item) => item.existingFile.path)],
      wouldReplace,
      wouldCreate: [...wouldCreate, ...promotions.map((item) => item.backupPath), ...(manifestExists ? [] : [path.relative(REPO_ROOT, manifestPath)])],
      wouldModify: manifestExists ? [path.relative(REPO_ROOT, manifestPath)] : [],
      explicitlyNotTouched: [path.relative(REPO_ROOT, carsPath), 'showcase', 'catalog pages/cards', '.git'],
    },
  };
  await writeJson(path.join(DIRS.reports, 'promotion-dry-run.json'), report);
  return report;
}
