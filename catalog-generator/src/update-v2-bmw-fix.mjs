import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { DIRS, REPO_ROOT, readJson, writeJson } from './config.mjs';

const V2 = path.join(REPO_ROOT, 'tmp', 'generated-catalog-pilot-v2');
const BACKGROUND = { r: 232, g: 232, b: 229 };
const replacements = [
  { id: 'bmw-3-series', manufacturer: 'BMW', model: '3 Series', filename: 'bmw-3-series-g20-lci.webp', label: 'BMW 3 Series / G20 LCI' },
  { id: 'bmw-x5', manufacturer: 'BMW', model: 'X5', filename: 'bmw-x5-g05-lci.webp', label: 'BMW X5 / G05 LCI' },
];
const all = [
  ['toyota-camry-2026-xv80.webp', 'Toyota Camry / XV80'], ['toyota-rav4-2026.webp', 'Toyota RAV4 / 2026 sixth generation'],
  ['toyota-land-cruiser-300.webp', 'Toyota Land Cruiser 300 / J300'], ['bmw-x3-g45.webp', 'BMW X3 / G45'],
  ['toyota-hilux-current.webp', 'Toyota Hilux / AN120-AN130'], ['toyota-corolla-e210-facelift.webp', 'Toyota Corolla / E210 facelift'],
  ['toyota-yaris-xp210.webp', 'Toyota Yaris / XP210'], ['bmw-3-series-g20-lci.webp', 'BMW 3 Series / G20 LCI'],
  ['bmw-x5-g05-lci.webp', 'BMW X5 / G05 LCI'], ['kia-k5-2026-facelift.webp', 'Kia K5 / DL3 facelift'],
  ['kia-sorento-mq4-facelift.webp', 'Kia Sorento / MQ4 facelift'], ['lexus-rx-alh10.webp', 'Lexus RX / ALH10'],
];

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function createContactSheet() {
  const composites = [];
  for (let index = 0; index < all.length; index += 1) {
    const [filename, labelText] = all[index];
    const image = await sharp(path.join(V2, filename)).resize(400, 250, { fit: 'contain', background: BACKGROUND }).webp({ quality: 88 }).toBuffer();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="44"><rect width="100%" height="100%" fill="#f3f2ee"/><text x="14" y="28" font-family="Arial,sans-serif" font-size="16" font-weight="600" fill="#202020">${String(index + 1).padStart(2, '0')}  ${escapeXml(labelText)}</text></svg>`);
    const tile = await sharp({ create: { width: 400, height: 294, channels: 3, background: '#f3f2ee' } }).composite([{ input: image, left: 0, top: 0 }, { input: label, left: 0, top: 250 }]).webp({ quality: 90 }).toBuffer();
    composites.push({ input: tile, left: (index % 4) * 400, top: Math.floor(index / 4) * 294 });
  }
  await sharp({ create: { width: 1600, height: 882, channels: 3, background: '#deddd8' } }).composite(composites).webp({ quality: 92, effort: 5 }).toFile(path.join(V2, 'contact-sheet.webp'));
}

async function main() {
  const changed = [];
  const stage2 = await readJson(path.join(V2, 'generation-report-stage-2.json'));
  const combined = await readJson(path.join(V2, 'generation-report.json'));
  const qa = await readJson(path.join(V2, 'qa-report.json'));
  const backupDir = path.join(DIRS.outputs, 'rejected');
  await fs.mkdir(backupDir, { recursive: true });
  for (const item of replacements) {
    const source = path.join(DIRS.outputs, item.filename);
    const target = path.join(V2, item.filename);
    await fs.copyFile(target, path.join(backupDir, `v2-before-v3-${item.filename}`));
    await fs.copyFile(source, target);
    const metadata = await sharp(target, { failOn: 'error' }).metadata();
    if (metadata.width !== 1600 || metadata.height !== 1000 || metadata.format !== 'webp') throw new Error(`${item.id}: copied V2 output failed validation`);
    const v3 = await readJson(path.join(DIRS.reports, `${item.id}-generation.json`));
    const replacementReport = {
      ...v3, generatedFile: path.relative(process.cwd(), target),
      replacementReason: 'Catalog Generation System v3 identity correction',
      replacedAt: new Date().toISOString(),
    };
    for (const report of [stage2, combined]) {
      const index = report.entries.findIndex((entry) => entry.manufacturer === item.manufacturer && entry.model === item.model);
      if (index < 0) throw new Error(`${item.id}: entry missing from V2 generation report`);
      report.entries[index] = replacementReport;
    }
    const qaEntry = qa.entries.find((entry) => entry.generatedFile.endsWith(item.filename));
    if (!qaEntry) throw new Error(`${item.id}: entry missing from V2 QA report`);
    qaEntry.generatedFile = path.relative(process.cwd(), target);
    qaEntry.visualGenerationMatch = 'pending';
    qaEntry.suspectedPreviousGeneration = false;
    qaEntry.suspectedMixedGeneration = false;
    qaEntry.replacedByV3At = new Date().toISOString();
    changed.push({ modelId: item.id, target: path.relative(process.cwd(), target), metadata: { width: metadata.width, height: metadata.height, format: metadata.format } });
  }
  await writeJson(path.join(V2, 'generation-report-stage-2.json'), stage2);
  await writeJson(path.join(V2, 'generation-report.json'), combined);
  await writeJson(path.join(V2, 'qa-report.json'), qa);
  await createContactSheet();
  await writeJson(path.join(DIRS.reports, 'v2-bmw-fix.json'), { completedAt: new Date().toISOString(), model: 'gpt-image-2', changed, productionChanged: false });
  console.log(JSON.stringify({ changed, contactSheet: path.relative(process.cwd(), path.join(V2, 'contact-sheet.webp')) }, null, 2));
}

main().catch((error) => { console.error(error?.stack || String(error)); process.exitCode = 1; });
