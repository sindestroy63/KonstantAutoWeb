import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { DIRS, loadSettings, saveModel, writeJson } from './config.mjs';
import { buildPrompt } from './prompt-builder.mjs';
import { checkReference } from './reference-check.mjs';

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function rawExtension(contentType, sourceUrl) {
  const mime = String(contentType).split(';')[0].trim().toLowerCase();
  if (mime === 'image/png') return '.png';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/webp') return '.webp';
  const ext = path.extname(new URL(sourceUrl).pathname).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.img';
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requestGeneration(endpoint, apiKey, body) {
  const diagnostics = [];
  let infrastructureRetries = 0;
  for (let requestIndex = 0; requestIndex < 7; requestIndex += 1) {
    let response;
    let text;
    try {
      response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 420000);
      text = await response.text();
    } catch (error) {
      diagnostics.push({ requestIndex, kind: 'network', message: error.message });
      if (infrastructureRetries >= 3) throw new Error(`Generation infrastructure retries exhausted: ${error.message}`);
      infrastructureRetries += 1;
      await wait(2000 * (2 ** (infrastructureRetries - 1)));
      continue;
    }

    let payload = null;
    try { payload = JSON.parse(text); } catch {}
    diagnostics.push({ requestIndex, httpStatus: response.status, responseFormat: payload ? 'json' : 'non-json' });
    if (response.ok && payload) return { response, payload, infrastructureRetries, diagnostics };

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('retry-after'));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : Math.min(60000, 5000 * (2 ** requestIndex));
      await wait(delay);
      continue;
    }
    if ([500, 502, 503, 504].includes(response.status)) {
      if (infrastructureRetries >= 3) throw new Error(`Generation infrastructure retries exhausted: HTTP ${response.status}`);
      infrastructureRetries += 1;
      await wait(2000 * (2 ** (infrastructureRetries - 1)));
      continue;
    }
    if (!payload) throw new Error(`Generation returned non-JSON: HTTP ${response.status}`);
    throw new Error(`Generation failed: HTTP ${response.status}: ${payload?.error?.message || text.slice(0, 240)}`);
  }
  throw new Error('Generation retry budget exhausted after repeated HTTP 429 responses');
}

async function requestEdit(endpoint, apiKey, prompt, referenceBytes, referenceType) {
  const diagnostics = [];
  let infrastructureRetries = 0;
  for (let requestIndex = 0; requestIndex < 7; requestIndex += 1) {
    const form = new FormData();
    form.append('model', 'gpt-image-2');
    form.append('prompt', prompt);
    form.append('n', '1');
    form.append('size', '1536x1024');
    form.append('quality', 'high');
    form.append('output_format', 'png');
    form.append('image', new Blob([referenceBytes], { type: referenceType }), `reference.${referenceType.includes('png') ? 'png' : 'jpg'}`);
    let response;
    let text;
    try {
      response = await fetchWithTimeout(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form }, 420000);
      text = await response.text();
    } catch (error) {
      diagnostics.push({ requestIndex, kind: 'network', message: error.message });
      if (infrastructureRetries >= 3) throw new Error(`Edit infrastructure retries exhausted: ${error.message}`);
      infrastructureRetries += 1;
      await wait(2000 * (2 ** (infrastructureRetries - 1)));
      continue;
    }
    let payload = null;
    try { payload = JSON.parse(text); } catch {}
    diagnostics.push({ requestIndex, httpStatus: response.status, responseFormat: payload ? 'json' : 'non-json' });
    if (response.ok && payload) return { response, payload, infrastructureRetries, diagnostics };
    if (response.status === 429) { await wait(Math.min(60000, 5000 * (2 ** requestIndex))); continue; }
    if ([500, 502, 503, 504].includes(response.status)) {
      if (infrastructureRetries >= 3) throw new Error(`Edit infrastructure retries exhausted: HTTP ${response.status}`);
      infrastructureRetries += 1;
      await wait(2000 * (2 ** (infrastructureRetries - 1)));
      continue;
    }
    throw new Error(`Edit failed: HTTP ${response.status}: ${payload?.error?.message || text.slice(0, 240)}`);
  }
  throw new Error('Edit retry budget exhausted');
}

async function downloadReferenceImage(url) {
  const response = await fetchWithTimeout(url, { headers: { 'User-Agent': 'Konstant-Catalog-Generator/4.1' } }, 180000);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.toLowerCase().startsWith('image/')) throw new Error(`Reference image download failed: HTTP ${response.status}, Content-Type ${contentType}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(bytes, { failOn: 'error' }).metadata();
  if (bytes.length < 10000 || !metadata.width || !metadata.height) throw new Error('Reference image failed validation');
  return { bytes, contentType: contentType.split(';')[0], metadata };
}

export async function generateModel(model) {
  if (model.status === 'approved' || model.status === 'production') throw new Error(`${model.id}: ${model.status} models cannot be regenerated; explicitly return the config to draft after owner approval`);
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = String(process.env.OPENAI_BASE_URL || '').replace(/\/+$/, '');
  if (!apiKey) throw new Error('OPENAI_API_KEY is unavailable');
  if (!baseUrl) throw new Error('OPENAI_BASE_URL is unavailable');
  const settings = await loadSettings();
  if (settings.model !== 'gpt-image-2') throw new Error(`Unsupported model in settings: ${settings.model}`);

  const reference = await checkReference(model);
  const prompt = await buildPrompt(model, reference);
  const generationMode = model.referenceImageUrl ? 'official-reference-edit' : 'text-generation';
  const endpoint = `${baseUrl}${model.referenceImageUrl ? '/images/edits' : '/images/generations'}`;
  const referenceImage = model.referenceImageUrl ? await downloadReferenceImage(model.referenceImageUrl) : null;
  const generation = referenceImage
    ? await requestEdit(endpoint, apiKey, prompt, referenceImage.bytes, referenceImage.contentType)
    : await requestGeneration(endpoint, apiKey, { model: 'gpt-image-2', prompt, n: 1, size: '1536x1024', quality: 'high', output_format: 'png' });
  const apiResponse = generation.response;
  const payload = generation.payload;
  const sourceUrl = payload?.data?.[0]?.url;
  if (!sourceUrl) throw new Error('Generation response does not contain data[0].url');

  let download = await fetchWithTimeout(sourceUrl, { method: 'GET' }, 180000);
  if (download.status === 401 || download.status === 403) download = await fetchWithTimeout(sourceUrl, { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` } }, 180000);
  const contentType = download.headers.get('content-type') || '';
  if (!download.ok || !contentType.toLowerCase().startsWith('image/')) throw new Error(`Image download failed: HTTP ${download.status}, Content-Type ${contentType}`);
  const bytes = Buffer.from(await download.arrayBuffer());
  const rawMetadata = await sharp(bytes, { failOn: 'error' }).metadata();
  if (bytes.length < 10000 || !rawMetadata.width || !rawMetadata.height || !rawMetadata.format) throw new Error('Downloaded file failed image validation');

  await fs.mkdir(DIRS.raw, { recursive: true });
  await fs.mkdir(DIRS.outputs, { recursive: true });
  const outputStem = path.parse(model.outputFilename).name;
  const rawPath = path.join(DIRS.raw, `${outputStem}${rawExtension(contentType, sourceUrl)}`);
  const outputPath = path.join(DIRS.outputs, model.outputFilename);
  await fs.writeFile(rawPath, bytes);
  const bg = settings.output.background;
  await sharp(bytes, { failOn: 'error' })
    .resize(settings.output.width, settings.output.height, { fit: 'contain', position: 'centre', background: bg })
    .flatten({ background: bg }).webp({ quality: settings.output.quality, effort: 5 }).toFile(outputPath);
  const outputMetadata = await sharp(outputPath, { failOn: 'error' }).metadata();
  if (outputMetadata.width !== settings.output.width || outputMetadata.height !== settings.output.height || outputMetadata.format !== 'webp') throw new Error('Normalized output validation failed');

  const report = {
    generatedAt: new Date().toISOString(), modelId: model.id, manufacturer: model.manufacturer, model: model.model,
    apiRequestCount: 1, infrastructureRetries: generation.infrastructureRetries, infrastructureDiagnostics: generation.diagnostics,
    requestedYears: model.years, requestedGeneration: model.generation, requestedChassisCode: model.chassisCode,
    modelUsed: 'gpt-image-2', generationMode, endpoint, referenceUrl: reference.referenceUrl, referenceImageUrl: model.referenceImageUrl || null,
    apiStatus: apiResponse.status, downloadStatus: download.status, contentType, sourceUrl,
    rawFile: path.relative(process.cwd(), rawPath), generatedFile: path.relative(process.cwd(), outputPath),
    rawMetadata: { format: rawMetadata.format, width: rawMetadata.width, height: rawMetadata.height },
    outputMetadata: { format: outputMetadata.format, width: outputMetadata.width, height: outputMetadata.height },
    promptFile: path.relative(process.cwd(), path.join(DIRS.prompts, `${model.id}.txt`)),
  };
  await writeJson(path.join(DIRS.reports, `${outputStem}-generation.json`), report);
  model.status = 'generated';
  model.approved = false;
  await saveModel(model);
  return report;
}
