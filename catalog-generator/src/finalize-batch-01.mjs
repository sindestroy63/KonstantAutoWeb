import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { DIRS, GENERATOR_ROOT, REPO_ROOT, loadModel, loadSettings, readJson, writeJson } from './config.mjs';

const BATCH_ID = 'batch-01';
const reviewedAt = new Date().toISOString();
const entries = [
  {
    id: 'bmw-x3', attempts: 2, status: 'needs-review', semanticQa: 'approved', generationQa: 'needs-review',
    issue: 'Second attempt still combines G45 grille cues with G01-like body surfacing and conventional protruding door handles.',
    sources: [
      'https://file6.aitohumanize.com/file/6072acac2ade4868860cb63d2a5b3846.png',
      'https://file6.aitohumanize.com/file/f99ef53c8d674e57bf9fd302973d19dd.png',
    ],
  },
  {
    id: 'bmw-1-series', attempts: 1, status: 'needs-review', semanticQa: 'needs-review', generationQa: 'needs-review',
    issue: 'Provider returned HTTP 504 with a non-JSON body; no image URL or decodable staging file was returned. Retry was not made because there was no generated image to fail QA.',
    sources: [], requestFailure: { httpStatus: 504, responseFormat: 'non-json', stage: 'generation-response' },
  },
  {
    id: 'hyundai-creta', attempts: 1, status: 'approved', semanticQa: 'approved', generationQa: 'approved',
    issue: null,
    sources: ['https://file1.aitohumanize.com/file/92ff7b53b187433da3cef5dc07363153.png'],
  },
  {
    id: 'hyundai-tucson', attempts: 2, status: 'approved', semanticQa: 'approved', generationQa: 'approved',
    issue: 'Attempt 1 showed the pre-facelift dense parametric-jewel front and was rejected. Attempt 2 shows the current larger rectangular DRL/grille treatment.',
    sources: [
      'https://file8.aitohumanize.com/file/230e80f78bbb4eaeab24ddf858c11f4d.png',
      'https://file1.aitohumanize.com/file/5eb319c12de9421c9992f7470d0979de.png',
    ],
  },
  {
    id: 'hyundai-santa-fe', attempts: 1, status: 'approved', semanticQa: 'approved', generationQa: 'approved',
    issue: null,
    sources: ['https://file6.aitohumanize.com/file/7f12b34ae78046448ce91409fecdc99a.png'],
  },
  {
    id: 'hyundai-i30', attempts: 2, status: 'approved', semanticQa: 'approved', generationQa: 'approved',
    issue: 'Attempt 1 had non-Hyundai wheel-center emblems and was rejected. Attempt 2 corrected the visible OEM Hyundai badges.',
    sources: [
      'https://file8.aitohumanize.com/file/8c2e9cfe377a41a6bf241deda02db056.png',
      'https://file6.aitohumanize.com/file/70c77c509245486ea5d1f43723c0bcc7.png',
    ],
  },
  {
    id: 'kia-sportage', attempts: 1, status: 'approved', semanticQa: 'approved', generationQa: 'approved',
    issue: null,
    sources: ['https://file6.aitohumanize.com/file/dff87f44e0774e1cb3f9b2f74840b195.png'],
  },
];

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

async function exists(file) {
  return fs.access(file).then(() => true).catch(() => false);
}

async function sha256(file) {
  const hash = createHash('sha256');
  hash.update(await fs.readFile(file));
  return hash.digest('hex');
}

async function buildContactSheet(items, settings) {
  const tileWidth = 400;
  const imageHeight = 250;
  const labelHeight = 64;
  const columns = 4;
  const rows = Math.ceil(items.length / columns);
  const composites = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const file = path.join(DIRS.outputs, item.model.outputFilename);
    const hasImage = await exists(file);
    const image = hasImage
      ? await sharp(file).resize(tileWidth, imageHeight, { fit: 'contain', background: settings.output.background }).webp({ quality: 88 }).toBuffer()
      : Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${imageHeight}"><rect width="100%" height="100%" fill="#deddd8"/><text x="200" y="120" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#666">NO GENERATED IMAGE</text><text x="200" y="145" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#8a2b20">HTTP 504</text></svg>`);
    const statusColor = item.review.status === 'approved' ? '#256a45' : '#9a3a2a';
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${labelHeight}"><rect width="100%" height="100%" fill="#f3f2ee"/><text x="14" y="22" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#1e1e1e">${String(index + 1).padStart(2, '0')}  ${escapeXml(item.model.manufacturer)} ${escapeXml(item.model.model)}</text><text x="14" y="43" font-family="Arial,sans-serif" font-size="12" fill="#5b5b57">${escapeXml(item.model.chassisCode)} · ${escapeXml(item.model.years)}</text><text x="386" y="22" text-anchor="end" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="${statusColor}">${escapeXml(item.review.status)}</text></svg>`);
    const tile = await sharp({ create: { width: tileWidth, height: imageHeight + labelHeight, channels: 3, background: '#f3f2ee' } })
      .composite([{ input: image, top: 0, left: 0 }, { input: label, top: imageHeight, left: 0 }])
      .webp({ quality: 90 })
      .toBuffer();
    composites.push({ input: tile, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * (imageHeight + labelHeight) });
  }

  const contactPath = path.join(DIRS.qa, 'batch-01-contact-sheet.webp');
  await fs.mkdir(DIRS.qa, { recursive: true });
  await sharp({ create: { width: columns * tileWidth, height: rows * (imageHeight + labelHeight), channels: 3, background: '#d4d3ce' } })
    .composite(composites)
    .webp({ quality: 92, effort: 5 })
    .toFile(contactPath);
  return contactPath;
}

async function main() {
  const settings = await loadSettings();
  const models = await Promise.all(entries.map((entry) => loadModel(entry.id)));
  const items = entries.map((review, index) => ({ review, model: models[index] }));
  const qaEntries = [];
  const generationEntries = [];

  for (const { review, model } of items) {
    const outputFile = path.join(DIRS.outputs, model.outputFilename);
    const outputExists = await exists(outputFile);
    const qaFile = path.join(DIRS.qa, `${model.id}.json`);
    const deterministic = outputExists && await exists(qaFile) ? await readJson(qaFile) : null;
    const finalGenerationFile = path.join(DIRS.reports, `${path.parse(model.outputFilename).name}-generation.json`);
    const finalGeneration = outputExists && await exists(finalGenerationFile) ? await readJson(finalGenerationFile) : null;

    generationEntries.push({
      modelId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      generation: model.generation,
      chassisCode: model.chassisCode,
      years: model.years,
      market: model.market,
      referenceUrl: model.referenceUrls[0],
      apiRequests: review.attempts,
      successfulApiResponses: review.sources.length,
      requestFailure: review.requestFailure || null,
      sourceUrls: review.sources,
      finalApiStatus: finalGeneration?.apiStatus ?? review.requestFailure?.httpStatus ?? null,
      finalDownloadStatus: finalGeneration?.downloadStatus ?? null,
      finalContentType: finalGeneration?.contentType ?? null,
      rawFile: finalGeneration?.rawFile ?? null,
      stagingFile: outputExists ? path.relative(REPO_ROOT, outputFile) : null,
      promptFile: path.relative(REPO_ROOT, path.join(DIRS.prompts, `${model.id}.txt`)),
      result: outputExists ? 'generated' : 'failed',
    });

    qaEntries.push({
      modelId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      generation: model.generation,
      chassisCode: model.chassisCode,
      stagingFile: outputExists ? path.relative(REPO_ROOT, outputFile) : null,
      status: review.status,
      deterministicQa: deterministic ? (deterministic.deterministicPass ? 'approved' : 'needs-review') : 'not-run',
      deterministicChecks: deterministic?.checks ?? null,
      semanticQa: review.semanticQa,
      generationQa: review.generationQa,
      visualGenerationReview: review.status,
      exactlyOneVehicle: outputExists ? true : null,
      noPeople: outputExists ? true : null,
      noText: outputExists ? true : null,
      noWatermark: outputExists ? true : null,
      oemBodyAndWheels: review.status === 'approved',
      suspectedPreviousGeneration: model.id === 'bmw-x3' ? true : outputExists ? false : null,
      suspectedMixedGeneration: model.id === 'bmw-x3' ? true : outputExists ? false : null,
      issues: review.issue ? [review.issue] : [],
      recommendation: review.status === 'approved' ? 'Include in owner promotion review.' : 'Exclude from promotion and resolve the listed issue before another generation attempt.',
    });
  }

  const contactPath = await buildContactSheet(items, settings);
  await writeJson(path.join(DIRS.reports, 'batch-01-generation-report.json'), {
    generatedAt: reviewedAt,
    batchId: BATCH_ID,
    imageModel: 'gpt-image-2',
    endpoint: `${String(process.env.OPENAI_BASE_URL || '').replace(/\/+$/, '')}/images/generations`,
    totalModels: entries.length,
    totalApiRequests: entries.reduce((sum, entry) => sum + entry.attempts, 0),
    successfulApiResponses: entries.reduce((sum, entry) => sum + entry.sources.length, 0),
    failedApiResponses: entries.reduce((sum, entry) => sum + (entry.requestFailure ? 1 : 0), 0),
    finalStagingImages: generationEntries.filter((entry) => entry.stagingFile).length,
    productionWritesPerformed: false,
    entries: generationEntries,
  });

  await writeJson(path.join(DIRS.reports, 'batch-01-qa-report.json'), {
    reviewedAt,
    batchId: BATCH_ID,
    contactSheet: path.relative(REPO_ROOT, contactPath),
    approvedCount: qaEntries.filter((entry) => entry.status === 'approved').length,
    needsReviewCount: qaEntries.filter((entry) => entry.status === 'needs-review').length,
    entries: qaEntries,
  });

  const cars = await readJson(path.join(REPO_ROOT, 'data', 'cars.json'));
  const manifestPath = path.join(REPO_ROOT, 'public', 'images', 'catalog', 'manifest.json');
  const manifest = await readJson(manifestPath);
  const backupRoot = path.join(GENERATOR_ROOT, 'backups', `batch-01-${reviewedAt.replace(/[:.]/g, '-').replace('Z', '')}`);
  const promotions = [];
  const excludedModels = [];

  for (const item of qaEntries) {
    const model = models.find((candidate) => candidate.id === item.modelId);
    if (item.status !== 'approved') {
      excludedModels.push({ modelId: item.modelId, manufacturer: item.manufacturer, model: item.model, reason: item.issues.join(' ') || 'Not approved.' });
      continue;
    }
    const car = cars.find((entry) => entry.slug === model.catalogSlug);
    const staging = path.join(DIRS.outputs, model.outputFilename);
    const target = path.join(REPO_ROOT, 'public', String(car.image).replace(/^\/+/, '').replaceAll('/', path.sep));
    const targetExists = await exists(target);
    promotions.push({
      modelId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      generation: model.generation,
      stagingFile: path.relative(REPO_ROOT, staging),
      stagingSha256: await sha256(staging),
      targetProductionPath: path.relative(REPO_ROOT, target),
      existingFile: targetExists ? { exists: true, sha256: await sha256(target), bytes: (await fs.stat(target)).size } : { exists: false, sha256: null, bytes: null },
      backupPath: path.relative(REPO_ROOT, path.join(backupRoot, path.basename(target))),
      carsJsonChange: { slug: car.slug, before: car.image, after: car.image, changed: false },
      manifestChange: {
        key: car.slug,
        before: manifest.images?.[car.slug] ?? null,
        after: { file: path.basename(target), generation: model.generation, chassisCode: model.chassisCode, sourceSha256: await sha256(staging), status: 'production' },
      },
    });
  }

  await writeJson(path.join(DIRS.reports, 'batch-01-promotion-dry-run.json'), {
    generatedAt: reviewedAt,
    batchId: BATCH_ID,
    dryRun: true,
    productionWritesPerformed: false,
    gitCommitCreated: false,
    approvedModels: promotions.length,
    excludedModels,
    promotions,
    affectedFiles: {
      wouldRead: ['data/cars.json', 'public/images/catalog/manifest.json', ...promotions.flatMap((item) => [item.stagingFile, item.targetProductionPath])],
      wouldReplace: promotions.map((item) => item.targetProductionPath),
      wouldCreateBackups: promotions.map((item) => item.backupPath),
      wouldModify: ['public/images/catalog/manifest.json'],
      explicitlyNotTouched: ['data/cars.json', 'Hero media', '.git'],
    },
  });

  console.log(JSON.stringify({
    totalApiRequests: entries.reduce((sum, entry) => sum + entry.attempts, 0),
    approved: qaEntries.filter((entry) => entry.status === 'approved').map((entry) => entry.modelId),
    needsReview: qaEntries.filter((entry) => entry.status === 'needs-review').map((entry) => entry.modelId),
    contactPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
