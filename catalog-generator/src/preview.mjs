import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { DIRS, loadModels, loadSettings } from './config.mjs';

const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const escapeXml = escapeHtml;

export async function createPreview() {
  const settings = await loadSettings();
  const models = await loadModels();
  let reviewByModel = new Map();
  try {
    const review = JSON.parse(await fs.readFile(path.join(DIRS.reports, 'pilot-final-review.json'), 'utf8'));
    reviewByModel = new Map(review.entries.map((entry) => [`${entry.manufacturer}|${entry.model}`, entry]));
  } catch {}
  const available = [];
  for (const model of models) {
    const file = path.join(DIRS.outputs, model.outputFilename);
    try { await fs.access(file); available.push({ model, file, review: reviewByModel.get(`${model.manufacturer}|${model.model}`) }); } catch {}
  }
  if (!available.length) throw new Error('No staging outputs available for preview');
  const tileWidth = 400, imageHeight = 250, labelHeight = 48, columns = 4;
  const rows = Math.ceil(available.length / columns);
  const composites = [];
  for (let index = 0; index < available.length; index += 1) {
    const { model, file, review } = available[index];
    const displayStatus = review?.status || model.status;
    const image = await sharp(file).resize(tileWidth, imageHeight, { fit: 'contain', background: settings.output.background }).webp({ quality: 88 }).toBuffer();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${labelHeight}"><rect width="100%" height="100%" fill="#f3f2ee"/><text x="14" y="21" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#1e1e1e">${String(index + 1).padStart(2, '0')}  ${escapeXml(model.manufacturer)} ${escapeXml(model.model)}</text><text x="14" y="39" font-family="Arial,sans-serif" font-size="12" fill="#5b5b57">${escapeXml(model.chassisCode)}  |  ${escapeXml(displayStatus)}</text></svg>`);
    const tile = await sharp({ create: { width: tileWidth, height: imageHeight + labelHeight, channels: 3, background: '#f3f2ee' } }).composite([{ input: image, top: 0, left: 0 }, { input: label, top: imageHeight, left: 0 }]).webp({ quality: 90 }).toBuffer();
    composites.push({ input: tile, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * (imageHeight + labelHeight) });
  }
  const contactPath = path.join(DIRS.qa, 'contact-sheet.webp');
  await fs.mkdir(DIRS.qa, { recursive: true });
  await sharp({ create: { width: columns * tileWidth, height: rows * (imageHeight + labelHeight), channels: 3, background: '#deddd8' } }).composite(composites).webp({ quality: 92, effort: 5 }).toFile(contactPath);

  const cards = available.map(({ model, review }) => { const displayStatus = review?.status || model.status; const issues = review?.issues?.length ? `<p>${escapeHtml(review.issues.join(' '))}</p>` : ''; return `<article data-status="${escapeHtml(displayStatus)}"><img loading="lazy" src="../outputs/${encodeURIComponent(model.outputFilename)}" alt="${escapeHtml(model.manufacturer)} ${escapeHtml(model.model)}"><div><strong>${escapeHtml(model.manufacturer)} ${escapeHtml(model.model)}</strong><span>${escapeHtml(model.years)} / ${escapeHtml(model.chassisCode)}</span><mark>${escapeHtml(displayStatus)}</mark>${issues}</div></article>`; }).join('\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Konstant Catalog QA</title><style>*{box-sizing:border-box}body{margin:0;background:#e7e7e3;color:#20201e;font-family:Arial,sans-serif}header{position:sticky;top:0;z-index:2;padding:16px 24px;background:#20201eee;color:#fff;display:flex;gap:20px;align-items:center}h1{font-size:18px;margin:0}button{border:1px solid #777;background:#333;color:#fff;padding:7px 10px;cursor:pointer}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1px;background:#c8c8c3}article{background:#f4f4f1}img{display:block;width:100%;aspect-ratio:8/5;object-fit:contain;background:#e8e8e5}article div{padding:12px 14px;display:grid;grid-template-columns:1fr auto;gap:5px 12px}strong{font-size:15px}span{font-size:12px;color:#666}p{grid-column:1/3;margin:5px 0 0;font-size:12px;line-height:1.4;color:#8a2b20}mark{grid-row:1/3;grid-column:2;background:#deded8;padding:4px 8px;align-self:center}article[hidden]{display:none}</style></head><body><header><h1>Konstant Catalog QA / ${available.length} models</h1><button data-filter="all">All</button><button data-filter="approved">Approved</button><button data-filter="needs-review">Needs review</button></header><main>${cards}</main><script>document.querySelectorAll('button').forEach(b=>b.onclick=()=>document.querySelectorAll('article').forEach(a=>a.hidden=b.dataset.filter!=='all'&&a.dataset.status!==b.dataset.filter));</script></body></html>`;
  const htmlPath = path.join(DIRS.qa, 'catalog-preview.html');
  await fs.writeFile(htmlPath, html, 'utf8');
  return { count: available.length, contactPath, htmlPath };
}
