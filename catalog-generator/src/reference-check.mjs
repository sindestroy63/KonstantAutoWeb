import path from 'node:path';
import { DIRS, GENERATOR_ROOT, readJson, writeJson } from './config.mjs';

function hostMatches(host, allowed) {
  return host === allowed || host.endsWith(`.${allowed}`);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, redirect: 'follow', signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

export async function checkReference(model) {
  const policy = await readJson(path.join(GENERATOR_ROOT, 'manifests', 'reference-policy.json'));
  const allowed = policy.manufacturers[model.manufacturer] || [];
  if (!allowed.length) throw new Error(`${model.id}: no official-domain policy for ${model.manufacturer}`);
  const attempts = [];
  for (const referenceUrl of model.referenceUrls || []) {
    const host = new URL(referenceUrl).hostname.toLowerCase();
    if (policy.blockedHosts.some((blocked) => hostMatches(host, blocked))) {
      attempts.push({ url: referenceUrl, status: 'blocked-host' });
      continue;
    }
    if (!allowed.some((domain) => hostMatches(host, domain))) {
      attempts.push({ url: referenceUrl, status: 'not-official-domain' });
      continue;
    }
    try {
      let response;
      try {
        response = await fetchWithTimeout(referenceUrl, { method: 'HEAD' });
      } catch {
        response = await fetchWithTimeout(referenceUrl, {
          method: 'GET',
          headers: { Range: 'bytes=0-2047', 'User-Agent': 'Konstant-Catalog-Reference-Check/3.0' },
        });
      }
      if (response.status === 403 || response.status === 405) {
        response = await fetchWithTimeout(referenceUrl, {
          method: 'GET',
          headers: { Range: 'bytes=0-2047', 'User-Agent': 'Konstant-Catalog-Reference-Check/3.0' },
        });
      }
      const finalHost = new URL(response.url).hostname.toLowerCase();
      const finalHostOfficial = allowed.some((domain) => hostMatches(finalHost, domain));
      const responseConfirmed = response.ok && finalHostOfficial;
      attempts.push({
        url: referenceUrl,
        finalUrl: response.url,
        httpStatus: response.status,
        status: responseConfirmed ? 'confirmed' : response.ok ? 'redirected-outside-official-domain' : 'http-error',
      });
      if (responseConfirmed) {
        const snapshot = {
          checkedAt: new Date().toISOString(), manufacturer: model.manufacturer, model: model.model,
          requestedYear: model.years, generation: model.generation, chassisCode: model.chassisCode,
          market: model.market, referenceUrl, finalUrl: response.url, httpStatus: response.status,
          officialDomain: host, confirmedBodyCues: model.identityCues, attempts,
        };
        await writeJson(path.join(DIRS.references, `${model.id}.json`), snapshot);
        return snapshot;
      }
    } catch (error) {
      attempts.push({ url: referenceUrl, status: 'network-error', error: error.message });
    }
  }
  const officialMediaUrl = model.referenceImageUrl || model.officialMediaUrls?.[0];
  if (officialMediaUrl) {
    const mediaHost = new URL(officialMediaUrl).hostname.toLowerCase();
    const officialMedia = allowed.some((domain) => hostMatches(mediaHost, domain));
    if (officialMedia) {
      const snapshot = {
        checkedAt: new Date().toISOString(), manufacturer: model.manufacturer, model: model.model,
        requestedYear: model.years, generation: model.generation, chassisCode: model.chassisCode,
        market: model.market, referenceUrl: model.referenceUrls?.[0] || model.referenceImageUrl,
        referenceImageUrl: officialMediaUrl, officialDomain: mediaHost,
        referenceQuality: 'official-media-confirmed', confirmedBodyCues: model.identityCues, attempts,
      };
      await writeJson(path.join(DIRS.references, `${model.id}.json`), snapshot);
      return snapshot;
    }
  }
  if (model.referenceQuality === 'secondary-confirmed' && (model.fallbackReferenceUrls || []).length >= 2) {
    const snapshot = {
      checkedAt: new Date().toISOString(), manufacturer: model.manufacturer, model: model.model,
      requestedYear: model.years, generation: model.generation, chassisCode: model.chassisCode,
      market: model.market, referenceUrl: model.referenceUrls?.[0] || model.fallbackReferenceUrls[0],
      fallbackReferenceUrls: model.fallbackReferenceUrls, referenceQuality: 'secondary-confirmed',
      confirmedBodyCues: model.identityCues, attempts,
    };
    await writeJson(path.join(DIRS.references, `${model.id}.json`), snapshot);
    return snapshot;
  }
  const blocked = { checkedAt: new Date().toISOString(), modelId: model.id, blocked: true, reason: 'No confirmed official manufacturer reference', attempts };
  await writeJson(path.join(DIRS.references, `${model.id}.json`), blocked);
  throw new Error(`${model.id}: official manufacturer reference is unconfirmed; generation blocked`);
}
