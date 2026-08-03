import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { DIRS, loadModels, loadSettings, saveModel, writeJson } from './config.mjs';

async function analyzeImage(file, settings) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const sampleStep = 2;
  const columnEdges = new Uint16Array(Math.ceil(info.width / sampleStep));
  const rowEdges = new Uint16Array(Math.ceil(info.height / sampleStep));
  let cornerR = 0, cornerG = 0, cornerB = 0, cornerCount = 0;
  const cornerW = Math.round(info.width * 0.08), cornerH = Math.round(info.height * 0.08);
  const pixel = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  for (let y = 0; y < info.height; y += sampleStep) {
    for (let x = 0; x < info.width; x += sampleStep) {
      const i = (y * info.width + x) * info.channels;
      const inCorner = (x < cornerW || x >= info.width - cornerW) && y < cornerH;
      if (inCorner) { cornerR += data[i]; cornerG += data[i + 1]; cornerB += data[i + 2]; cornerCount += 1; }
      if (x + sampleStep >= info.width || y + sampleStep >= info.height || y < info.height * 0.12 || y > info.height * 0.94) continue;
      const right = pixel(x + sampleStep, y), down = pixel(x, y + sampleStep);
      const contrast = Math.max(
        Math.abs(data[i] - right[0]), Math.abs(data[i + 1] - right[1]), Math.abs(data[i + 2] - right[2]),
        Math.abs(data[i] - down[0]), Math.abs(data[i + 1] - down[1]), Math.abs(data[i + 2] - down[2]),
      );
      if (contrast >= 18) {
        columnEdges[Math.floor(x / sampleStep)] += 1;
        rowEdges[Math.floor(y / sampleStep)] += 1;
      }
    }
  }
  const maxObjectColumnEdges = (info.height / sampleStep) * 0.25;
  const activeColumns = [...columnEdges].map((count, index) => ({ count, value: index * sampleStep })).filter(({ count }) => count >= 3 && count <= maxObjectColumnEdges).map(({ value }) => value);
  const activeRows = [...rowEdges].map((count, index) => ({ count, value: index * sampleStep })).filter(({ count }) => count >= 10).map(({ value }) => value);
  const minX = activeColumns[0], maxX = activeColumns.at(-1), minY = activeRows[0], maxY = activeRows.at(-1);
  const meanCorner = [cornerR, cornerG, cornerB].map((value) => value / Math.max(1, cornerCount));
  const cornerLuminance = (meanCorner[0] + meanCorner[1] + meanCorner[2]) / 3;
  const cornerNeutralityDelta = Math.max(...meanCorner) - Math.min(...meanCorner);
  const detected = Number.isFinite(minX) && Number.isFinite(maxX) && Number.isFinite(minY) && Number.isFinite(maxY);
  return {
    width: info.width, height: info.height,
    backgroundCornerRgb: meanCorner.map((value) => Number(value.toFixed(1))),
    backgroundCornerLuminance: Number(cornerLuminance.toFixed(1)),
    backgroundCornerNeutralityDelta: Number(cornerNeutralityDelta.toFixed(1)),
    foregroundBounds: detected ? { minX, maxX, minY, maxY } : null,
    foregroundWidthPercent: detected ? Number((((maxX - minX + 1) / info.width) * 100).toFixed(1)) : null,
    horizonPercent: detected ? Number((((maxY + 1) / info.height) * 100).toFixed(1)) : null,
  };
}

export async function qaModel(model) {
  const settings = await loadSettings();
  const file = path.join(DIRS.outputs, model.outputFilename);
  const metadata = await sharp(file, { failOn: 'error' }).metadata();
  const analysis = await analyzeImage(file, settings);
  const checks = {
    dimensions: { status: metadata.width === settings.output.width && metadata.height === settings.output.height ? 'pass' : 'fail', actual: `${metadata.width}x${metadata.height}` },
    format: { status: metadata.format === settings.output.format ? 'pass' : 'fail', actual: metadata.format },
    aspectRatio: { status: Math.abs(metadata.width / metadata.height - settings.output.width / settings.output.height) < 0.001 ? 'pass' : 'fail', actual: Number((metadata.width / metadata.height).toFixed(3)) },
    background: { status: analysis.backgroundCornerLuminance >= 165 && analysis.backgroundCornerLuminance <= 245 && analysis.backgroundCornerNeutralityDelta <= 15 ? 'pass' : 'review', actualRgb: analysis.backgroundCornerRgb, luminance: analysis.backgroundCornerLuminance, neutralityDelta: analysis.backgroundCornerNeutralityDelta },
    scale: { status: analysis.foregroundWidthPercent >= 74 && analysis.foregroundWidthPercent <= 88 ? 'pass' : 'review', actualPercent: analysis.foregroundWidthPercent, targetPercent: '78-84', tolerancePercent: '74-88' },
    horizon: { status: analysis.horizonPercent >= 72 && analysis.horizonPercent <= 93 ? 'pass' : 'review', actualPercent: analysis.horizonPercent, tolerancePercent: '72-93' },
    exactlyOneVehicle: { status: 'pending', method: 'manual-or-vision-adapter' },
    noPeople: { status: 'pending', method: 'manual-or-vision-adapter' },
    noText: { status: 'pending', method: 'manual-or-vision-adapter' },
    noWatermark: { status: 'pending', method: 'manual-or-vision-adapter' },
    generationIdentity: { status: 'pending', method: 'owner-review' },
  };
  const deterministicPass = Object.values(checks).filter((c) => c.method === undefined).every((c) => c.status === 'pass');
  const report = { checkedAt: new Date().toISOString(), modelId: model.id, file: path.relative(process.cwd(), file), deterministicPass, analysis, checks };
  await writeJson(path.join(DIRS.qa, `${model.id}.json`), report);
  if (model.status !== 'approved' && model.status !== 'production') {
    model.status = 'qa';
    model.approved = false;
  }
  await saveModel(model);
  return report;
}

export async function qaAll() {
  const reports = [];
  for (const model of await loadModels()) {
    try { await fs.access(path.join(DIRS.outputs, model.outputFilename)); reports.push(await qaModel(model)); } catch {}
  }
  const scales = reports.map((r) => r.analysis.foregroundWidthPercent).filter(Number.isFinite);
  const horizons = reports.map((r) => r.analysis.horizonPercent).filter(Number.isFinite);
  const consistency = {
    scaleRange: scales.length ? [Math.min(...scales), Math.max(...scales)] : null,
    horizonRange: horizons.length ? [Math.min(...horizons), Math.max(...horizons)] : null,
    scaleConsistent: scales.length > 1 ? Math.max(...scales) - Math.min(...scales) <= 10 : 'insufficient-sample',
    horizonConsistent: horizons.length > 1 ? Math.max(...horizons) - Math.min(...horizons) <= 10 : 'insufficient-sample',
  };
  await writeJson(path.join(DIRS.reports, 'catalog-qa.json'), { checkedAt: new Date().toISOString(), entries: reports, consistency });
  return { reports, consistency };
}
