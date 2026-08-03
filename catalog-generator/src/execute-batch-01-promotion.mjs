import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DIRS, REPO_ROOT, loadModel, readJson, saveModel, writeJson } from './config.mjs';

const DRY_RUN_PATH = path.join(DIRS.reports, 'batch-01-promotion-dry-run.json');
const REPORT_PATH = path.join(DIRS.reports, 'batch-01-promotion-report.json');
const APPROVED_IDS = new Set(['hyundai-creta', 'hyundai-tucson', 'hyundai-santa-fe', 'hyundai-i30', 'kia-sportage']);
const EXCLUDED_IDS = new Set(['bmw-x3', 'bmw-1-series']);

async function sha256(file) {
  const hash = createHash('sha256');
  hash.update(await fs.readFile(file));
  return hash.digest('hex');
}

async function assertHash(file, expected, label) {
  const actual = await sha256(file);
  if (actual !== expected) throw new Error(`${label} SHA-256 mismatch: ${file}\nexpected ${expected}\nactual   ${actual}`);
  return actual;
}

function assertWithin(root, target, label) {
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes allowed root: ${target}`);
}

async function main() {
  const dryRun = await readJson(DRY_RUN_PATH);
  if (!dryRun.dryRun || dryRun.approvedModels !== 5 || dryRun.promotions?.length !== 5) throw new Error('Unexpected Batch 1 promotion plan');
  if (dryRun.productionWritesPerformed) throw new Error('Dry-run unexpectedly records production writes');

  const promotionIds = new Set(dryRun.promotions.map((item) => item.modelId));
  if (promotionIds.size !== APPROVED_IDS.size || [...APPROVED_IDS].some((id) => !promotionIds.has(id))) throw new Error('Promotion scope does not match the five approved models');
  if (dryRun.promotions.some((item) => EXCLUDED_IDS.has(item.modelId))) throw new Error('Excluded BMW model appears in promotion plan');
  if ([...EXCLUDED_IDS].some((id) => !dryRun.excludedModels?.some((item) => item.modelId === id))) throw new Error('Both BMW exclusions must be explicit');

  const imageRoot = path.join(REPO_ROOT, 'public', 'images', 'catalog');
  const manifestPath = path.join(imageRoot, 'manifest.json');
  const carsPath = path.join(REPO_ROOT, 'data', 'cars.json');
  const manifestBefore = await readJson(manifestPath);
  const manifestHashBefore = await sha256(manifestPath);
  const carsHashBefore = await sha256(carsPath);
  const bmwPaths = [...EXCLUDED_IDS].map((id) => path.join(imageRoot, `${id}.webp`));
  const bmwHashesBefore = Object.fromEntries(await Promise.all(bmwPaths.map(async (file) => [path.basename(file), await sha256(file)])));
  const backupRoot = path.resolve(REPO_ROOT, path.dirname(dryRun.promotions[0].backupPath));
  assertWithin(path.join(REPO_ROOT, 'catalog-generator', 'backups'), backupRoot, 'Backup root');

  const prepared = [];
  for (const item of dryRun.promotions) {
    const staging = path.resolve(REPO_ROOT, item.stagingFile);
    const target = path.resolve(REPO_ROOT, item.targetProductionPath);
    const backup = path.resolve(REPO_ROOT, item.backupPath);
    const modelPath = path.join(DIRS.models, `${item.modelId}.json`);
    const modelBackup = path.join(backupRoot, 'model-configs', `${item.modelId}.json`);
    assertWithin(DIRS.outputs, staging, `${item.modelId} staging`);
    assertWithin(imageRoot, target, `${item.modelId} target`);
    assertWithin(backupRoot, backup, `${item.modelId} backup`);
    if (!item.existingFile?.exists || !item.existingFile.sha256) throw new Error(`${item.modelId}: expected an existing production target`);
    await assertHash(staging, item.stagingSha256, `${item.modelId} staging`);
    await assertHash(target, item.existingFile.sha256, `${item.modelId} production before promotion`);
    const model = await loadModel(item.modelId);
    if (model.status !== 'qa' || model.approved) throw new Error(`${item.modelId}: expected reviewed QA staging state before owner promotion`);
    prepared.push({ item, staging, target, backup, modelPath, modelBackup, model, originalModel: structuredClone(model) });
  }

  const manifestBackup = path.join(backupRoot, 'manifest.json');
  await fs.mkdir(path.dirname(manifestBackup), { recursive: true });
  await fs.copyFile(manifestPath, manifestBackup);
  await assertHash(manifestBackup, manifestHashBefore, 'Manifest backup');

  for (const entry of prepared) {
    await fs.mkdir(path.dirname(entry.backup), { recursive: true });
    await fs.copyFile(entry.target, entry.backup);
    await assertHash(entry.backup, entry.item.existingFile.sha256, `${entry.item.modelId} image backup`);
    await fs.mkdir(path.dirname(entry.modelBackup), { recursive: true });
    await fs.copyFile(entry.modelPath, entry.modelBackup);
    await assertHash(entry.modelBackup, await sha256(entry.modelPath), `${entry.item.modelId} config backup`);
  }

  const changedTargets = [];
  const changedModels = [];
  try {
    for (const entry of prepared) {
      await fs.copyFile(entry.staging, entry.target);
      await assertHash(entry.target, entry.item.stagingSha256, `${entry.item.modelId} promoted image`);
      changedTargets.push(entry);
    }

    const promotedAt = new Date().toISOString();
    const mergedImages = { ...(manifestBefore.images || {}) };
    for (const entry of prepared) {
      mergedImages[entry.item.manifestChange.key] = {
        ...entry.item.manifestChange.after,
        stagingFile: entry.item.stagingFile,
        promotedAt,
      };
    }
    if ([...EXCLUDED_IDS].some((id) => mergedImages[id.replaceAll('-', '_')])) throw new Error('Excluded BMW model would be added to manifest');
    const manifestAfter = {
      ...manifestBefore,
      batchId: `batch-01-${promotedAt.replace(/[:.]/g, '-').replace('Z', '')}`,
      generatedAt: promotedAt,
      modelCount: Object.keys(mergedImages).length,
      images: mergedImages,
    };
    await writeJson(manifestPath, manifestAfter);

    for (const entry of prepared) {
      entry.model.status = 'production';
      entry.model.approved = true;
      entry.model.production = {
        batchId: manifestAfter.batchId,
        file: entry.item.targetProductionPath,
        sha256: entry.item.stagingSha256,
        promotedAt,
      };
      await saveModel(entry.model);
      changedModels.push(entry);
    }
  } catch (error) {
    for (const entry of changedTargets.reverse()) await fs.copyFile(entry.backup, entry.target);
    await fs.copyFile(manifestBackup, manifestPath);
    for (const entry of changedModels) await saveModel(entry.originalModel);
    throw error;
  }

  const verification = [];
  for (const entry of prepared) {
    verification.push({
      modelId: entry.item.modelId,
      productionFile: entry.item.targetProductionPath,
      expectedSha256: entry.item.stagingSha256,
      actualSha256: await assertHash(entry.target, entry.item.stagingSha256, `${entry.item.modelId} final production`),
      backupFile: path.relative(REPO_ROOT, entry.backup),
      backupSha256: await assertHash(entry.backup, entry.item.existingFile.sha256, `${entry.item.modelId} final backup`),
      modelConfigBackup: path.relative(REPO_ROOT, entry.modelBackup),
    });
  }

  const manifestAfter = await readJson(manifestPath);
  if (manifestAfter.modelCount !== 16 || Object.keys(manifestAfter.images || {}).length !== 16) throw new Error('Manifest must contain the previous 11 plus five Batch 1 entries');
  for (const item of dryRun.promotions) {
    const entry = manifestAfter.images[item.manifestChange.key];
    if (!entry || entry.sourceSha256 !== item.stagingSha256 || entry.status !== 'production') throw new Error(`${item.modelId}: manifest verification failed`);
  }
  for (const [key, value] of Object.entries(manifestBefore.images || {})) {
    if (!manifestAfter.images[key] || JSON.stringify(manifestAfter.images[key]) !== JSON.stringify(value)) throw new Error(`Existing manifest entry changed unexpectedly: ${key}`);
  }
  if (await sha256(carsPath) !== carsHashBefore) throw new Error('cars.json changed unexpectedly');
  for (const file of bmwPaths) await assertHash(file, bmwHashesBefore[path.basename(file)], `${path.basename(file)} excluded image`);

  const report = {
    completedAt: new Date().toISOString(),
    batchId: manifestAfter.batchId,
    promotedModels: prepared.length,
    excludedModels: dryRun.excludedModels,
    gitCommitCreated: false,
    carsJson: { path: path.relative(REPO_ROOT, carsPath), changed: false, sha256: carsHashBefore },
    excludedProductionImages: bmwPaths.map((file) => ({ path: path.relative(REPO_ROOT, file), changed: false, sha256: bmwHashesBefore[path.basename(file)] })),
    manifest: {
      path: path.relative(REPO_ROOT, manifestPath),
      previousModelCount: Object.keys(manifestBefore.images || {}).length,
      modelCount: manifestAfter.modelCount,
      previousSha256: manifestHashBefore,
      sha256: await sha256(manifestPath),
      backupPath: path.relative(REPO_ROOT, manifestBackup),
      backupSha256: await assertHash(manifestBackup, manifestHashBefore, 'Final manifest backup'),
    },
    verification,
    actuallyChangedProductionFiles: [...prepared.map(({ item }) => item.targetProductionPath), path.relative(REPO_ROOT, manifestPath)],
    createdBackupFiles: [manifestBackup, ...prepared.flatMap((entry) => [entry.backup, entry.modelBackup])].map((file) => path.relative(REPO_ROOT, file)),
    changedModelConfigs: prepared.map(({ item }) => path.relative(REPO_ROOT, path.join(DIRS.models, `${item.modelId}.json`))),
  };
  await writeJson(REPORT_PATH, report);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
