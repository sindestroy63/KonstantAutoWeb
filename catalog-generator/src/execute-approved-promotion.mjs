import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DIRS, REPO_ROOT, loadModel, saveModel, readJson, writeJson } from './config.mjs';

const DRY_RUN_PATH = path.join(DIRS.reports, 'promotion-dry-run.json');
const REPORT_PATH = path.join(DIRS.reports, 'promotion-report.json');

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

function modelIdFromStaging(stagingFile) {
  return path.basename(stagingFile, path.extname(stagingFile))
    .replace('-2026-xv80', '').replace('-2026', '')
    .replace('-current', '').replace('-e210-facelift', '').replace('-xp210', '')
    .replace('-g20-lci', '').replace('-g05-lci', '').replace('-mq4-facelift', '')
    .replace('-alh10', '').replace('-facelift', '');
}

async function main() {
  const dryRun = await readJson(DRY_RUN_PATH);
  if (!dryRun.dryRun || dryRun.approvedModels !== 11 || dryRun.promotions?.length !== 11) throw new Error('Promotion dry-run is not the expected 11-model approved plan');
  if (!dryRun.excludedModels?.some((item) => item.manufacturer === 'BMW' && item.model === 'X3')) throw new Error('BMW X3 is not explicitly excluded by the dry-run');
  if (dryRun.promotions.some((item) => item.manufacturer === 'BMW' && item.model === 'X3')) throw new Error('BMW X3 must not be promoted');

  const manifestPath = path.resolve(REPO_ROOT, dryRun.productionManifest.path);
  const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);
  if (manifestExists !== dryRun.productionManifest.exists) throw new Error('Production manifest state changed after dry-run; aborting');

  const carsPath = path.resolve(REPO_ROOT, dryRun.carsJson.path);
  const carsHashBefore = await sha256(carsPath);
  const bmwX3Path = path.join(REPO_ROOT, 'public', 'images', 'catalog', 'bmw-x3.webp');
  const bmwX3HashBefore = await sha256(bmwX3Path);
  const prepared = [];

  for (const item of dryRun.promotions) {
    const staging = path.resolve(REPO_ROOT, item.stagingFile);
    const target = path.resolve(REPO_ROOT, item.targetProductionPath);
    const backup = path.resolve(REPO_ROOT, item.backupPath);
    await assertHash(staging, item.stagingSha256, `${item.manufacturer} ${item.model} staging`);
    await assertHash(target, item.existingFile.sha256, `${item.manufacturer} ${item.model} current production`);
    const modelId = modelIdFromStaging(item.stagingFile);
    const model = await loadModel(modelId);
    if (!model.approved || model.status !== 'approved') throw new Error(`${modelId}: config is no longer approved`);
    prepared.push({ item, staging, target, backup, modelId, model, originalModel: structuredClone(model) });
  }

  // Complete and validate every backup before modifying the first production image.
  for (const entry of prepared) {
    await fs.mkdir(path.dirname(entry.backup), { recursive: true });
    await fs.copyFile(entry.target, entry.backup);
    await assertHash(entry.backup, entry.item.existingFile.sha256, `${entry.item.manufacturer} ${entry.item.model} backup`);
  }

  const changedTargets = [];
  let manifestCreated = false;
  const manifestTemp = `${manifestPath}.promotion-tmp`;
  try {
    for (const entry of prepared) {
      await fs.copyFile(entry.staging, entry.target);
      await assertHash(entry.target, entry.item.stagingSha256, `${entry.item.manufacturer} ${entry.item.model} promoted production`);
      changedTargets.push(entry);
    }

    const images = Object.fromEntries(prepared.map(({ item }) => [item.manifestChange.key, {
      ...item.manifestChange.after,
      stagingFile: item.stagingFile,
      promotedAt: new Date().toISOString(),
    }]));
    if (Object.keys(images).length !== 11 || images.bmw_x3) throw new Error('Manifest scope is not exactly the 11 approved models');
    const manifest = { version: 1, batchId: dryRun.batchId, generatedAt: new Date().toISOString(), modelCount: 11, images };
    await writeJson(manifestTemp, manifest);
    await fs.rename(manifestTemp, manifestPath);
    manifestCreated = true;

    for (const entry of prepared) {
      entry.model.status = 'production';
      entry.model.approved = true;
      entry.model.production = { batchId: dryRun.batchId, file: entry.item.targetProductionPath, sha256: entry.item.stagingSha256, promotedAt: new Date().toISOString() };
      await saveModel(entry.model);
    }
  } catch (error) {
    for (const entry of changedTargets.reverse()) await fs.copyFile(entry.backup, entry.target);
    if (manifestCreated) await fs.rm(manifestPath, { force: true });
    await fs.rm(manifestTemp, { force: true });
    for (const entry of prepared) await saveModel(entry.originalModel);
    throw error;
  }

  const verification = [];
  for (const entry of prepared) {
    verification.push({
      model: `${entry.item.manufacturer} ${entry.item.model}`,
      productionFile: entry.item.targetProductionPath,
      expectedSha256: entry.item.stagingSha256,
      actualSha256: await assertHash(entry.target, entry.item.stagingSha256, `${entry.item.manufacturer} ${entry.item.model} final verification`),
      backupFile: entry.item.backupPath,
      backupSha256: await assertHash(entry.backup, entry.item.existingFile.sha256, `${entry.item.manufacturer} ${entry.item.model} final backup verification`),
    });
  }
  const carsHashAfter = await sha256(carsPath);
  const bmwX3HashAfter = await sha256(bmwX3Path);
  if (carsHashAfter !== carsHashBefore) throw new Error('cars.json changed unexpectedly');
  if (bmwX3HashAfter !== bmwX3HashBefore) throw new Error('BMW X3 production image changed unexpectedly');

  const report = {
    completedAt: new Date().toISOString(), batchId: dryRun.batchId, promotedModels: 11,
    excludedModels: dryRun.excludedModels, gitCommitCreated: false,
    carsJson: { path: dryRun.carsJson.path, changed: false, sha256: carsHashAfter },
    bmwX3: { path: path.relative(REPO_ROOT, bmwX3Path), changed: false, sha256: bmwX3HashAfter },
    manifest: { path: path.relative(REPO_ROOT, manifestPath), modelCount: 11, sha256: await sha256(manifestPath) },
    verification,
    actuallyChangedProductionFiles: [...prepared.map(({ item }) => item.targetProductionPath), path.relative(REPO_ROOT, manifestPath)],
    createdBackupFiles: prepared.map(({ item }) => item.backupPath),
    changedModelConfigs: prepared.map(({ modelId }) => `catalog-generator\\manifests\\models\\${modelId}.json`),
  };
  await writeJson(REPORT_PATH, report);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => { console.error(error?.stack || String(error)); process.exitCode = 1; });
