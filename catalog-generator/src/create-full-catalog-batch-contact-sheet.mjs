import path from 'node:path';
import sharp from 'sharp';
import { DIRS, loadModel, loadSettings } from './config.mjs';

const batch = Number(process.argv[2]);
const modelIds = process.argv.slice(3);
if (!Number.isInteger(batch) || batch < 1 || !modelIds.length) {
  throw new Error('Usage: node create-full-catalog-batch-contact-sheet.mjs <batch> <model-id...>');
}

const settings = await loadSettings();
const width = 400;
const imageHeight = 250;
const labelHeight = 50;
const columns = 2;
const tiles = [];

for (let index = 0; index < modelIds.length; index += 1) {
  const model = await loadModel(modelIds[index]);
  const image = await sharp(path.join(DIRS.outputs, model.outputFilename))
    .resize(width, imageHeight, { fit: 'contain', background: settings.output.background })
    .webp({ quality: 90 })
    .toBuffer();
  const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${labelHeight}"><rect width="100%" height="100%" fill="#f3f2ee"/><text x="14" y="21" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#1e1e1e">${String(index + 1).padStart(2, '0')}  ${model.manufacturer} ${model.model}</text><text x="14" y="40" font-family="Arial,sans-serif" font-size="12" fill="#5b5b57">${model.chassisCode} | ${model.years}</text></svg>`);
  tiles.push({
    input: await sharp({ create: { width, height: imageHeight + labelHeight, channels: 3, background: '#f3f2ee' } })
      .composite([{ input: image, top: 0, left: 0 }, { input: label, top: imageHeight, left: 0 }])
      .webp({ quality: 92 })
      .toBuffer(),
    left: (index % columns) * width,
    top: Math.floor(index / columns) * (imageHeight + labelHeight),
  });
}

const rows = Math.ceil(modelIds.length / columns);
const output = path.join(DIRS.qa, `full-catalog-batch-${String(batch).padStart(2, '0')}-contact-sheet.webp`);
await sharp({ create: { width: columns * width, height: rows * (imageHeight + labelHeight), channels: 3, background: '#deddd8' } })
  .composite(tiles)
  .webp({ quality: 92, effort: 5 })
  .toFile(output);
console.log(output);
