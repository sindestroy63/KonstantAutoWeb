import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cars = JSON.parse(await fs.readFile("data/cars.json", "utf8"));
const requested = process.argv.find((arg) => arg.startsWith("--slugs="))?.split("=")[1]?.split(",").filter(Boolean);
const failedOnly = process.argv.includes("--failed");
const outputDir = path.resolve("public/images/catalog/models");
const auditPath = path.resolve("tmp/wikimedia-model-audit.json");
const mappingPath = path.resolve("data/modelImages.generated.json");
await fs.mkdir(outputDir, { recursive: true });

const existingAudit = await fs.readFile(auditPath, "utf8").then(JSON.parse).catch(() => ({}));
const existingMapping = await fs.readFile(mappingPath, "utf8").then(JSON.parse).catch(() => ({}));
const audit = { ...existingAudit };
const mapping = { ...existingMapping };
const selectedCars = requested?.length
  ? cars.filter((car) => requested.includes(car.slug))
  : failedOnly ? cars.filter((car) => !audit[car.slug]?.replacement) : cars;

const negative = /rear|interior|dashboard|engine|badge|logo|police|taxi|race|racing|wreck|damaged|side view|back view|model car|toy|drawing|sketch|diagram|salon/i;
const positive = /front|three.quarter|3.4|facelift/i;
const stripHtml = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
const decodeHtml = (value = "") => value.replaceAll("&amp;", "&").replaceAll("&#39;", "'").replaceAll("&quot;", '"').replaceAll("&#95;", "_");
const queryOverrides = {
  toyota_camry: "2025 Toyota Camry front",
  toyota_rav4: "2022 Toyota RAV4 front",
  toyota_land_cruiser: "2023 Toyota Land Cruiser front",
  toyota_hilux: "2021 Toyota Hilux front",
};

function score(page, car) {
  const info = page.imageinfo?.[0];
  if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime || "")) return -Infinity;
  if (!info.extmetadata?.LicenseShortName?.value) return -Infinity;
  const text = `${page.title} ${stripHtml(info.extmetadata?.ImageDescription?.value)}`.toLowerCase();
  const tokens = `${car.brand} ${car.model}`.toLowerCase().split(/\s+/).filter((token) => token.length > 1);
  let result = tokens.reduce((sum, token) => sum + (text.includes(token) ? 18 : -16), 0);
  if (negative.test(text)) result -= 90;
  if (positive.test(text)) result += 24;
  if (/202[0-6]/.test(text)) result += 34;
  if (/19[5-9]\d|200\d|201[0-4]/.test(text)) result -= 35;
  const ratio = info.width / info.height;
  if (ratio >= 1.35 && ratio <= 2.2) result += 24;
  else if (ratio < 1.1) result -= 45;
  if (info.width >= 2200) result += 16;
  if (/quality|featured/.test(info.extmetadata?.Assessments?.value || "")) result += 20;
  return result;
}

async function findImage(car) {
  const pages = [];
  const queries = queryOverrides[car.slug]
    ? [queryOverrides[car.slug]]
    : [`${car.brand} ${car.model} front`, `${car.brand} ${car.model}`];
  for (const query of queries) {
    const params = new URLSearchParams({
      action: "query", generator: "search", gsrsearch: query, gsrnamespace: "6", gsrlimit: "20",
      prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "2000", format: "json", origin: "*",
    });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { "User-Agent": "KonstantAutoAssetAudit/1.0" } });
    if (!response.ok) throw new Error(`Commons API ${response.status}`);
    const json = await response.json();
    pages.push(...Object.values(json.query?.pages || {}));
  }
  const ranked = pages.map((page) => ({ page, score: score(page, car) })).filter((item) => Number.isFinite(item.score)).sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 0 ? ranked[0] : null;
}

function scoreTitle(title, car) {
  const text = decodeURIComponent(title).replaceAll("_", " ").toLowerCase();
  const tokens = `${car.brand} ${car.model}`.toLowerCase().split(/\s+/).filter((token) => token.length > 1);
  let result = tokens.reduce((sum, token) => sum + (text.includes(token) ? 20 : -18), 0);
  if (negative.test(text)) result -= 90;
  if (positive.test(text)) result += 24;
  if (/202[0-6]/.test(text)) result += 34;
  if (/19[5-9]\d|200\d|201[0-4]/.test(text)) result -= 35;
  return result;
}

function getLicense(html) {
  if (/creativecommons\.org\/publicdomain\/zero\/1\.0/i.test(html)) return "CC0";
  const shareAlike = html.match(/creativecommons\.org\/licenses\/by-sa\/([0-9.]+)/i);
  if (shareAlike) return `CC BY-SA ${shareAlike[1]}`;
  const attribution = html.match(/creativecommons\.org\/licenses\/by\/([0-9.]+)/i);
  if (attribution) return `CC BY ${attribution[1]}`;
  if (/public domain/i.test(html)) return "Public domain";
  return "";
}

async function findImageHtml(car) {
  const query = queryOverrides[car.slug] || `${car.brand} ${car.model} front`;
  const url = `https://commons.wikimedia.org/w/index.php?${new URLSearchParams({ search: query, title: "Special:MediaSearch", type: "image" })}`;
  const searchResponse = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!searchResponse.ok) throw new Error(`Commons HTML search ${searchResponse.status}`);
  const searchHtml = await searchResponse.text();
  const links = [...searchHtml.matchAll(/href="(https:\/\/commons\.wikimedia\.org\/wiki\/File:[^"]+)"/g)]
    .map((match) => decodeHtml(match[1]))
    .filter((value, index, values) => values.indexOf(value) === index)
    .map((value) => ({ value, score: scoreTitle(value, car) }))
    .sort((a, b) => b.score - a.score);
  for (const candidate of links.slice(0, 5)) {
    if (candidate.score < 0) continue;
    const pageResponse = await fetch(candidate.value, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!pageResponse.ok) continue;
    const html = await pageResponse.text();
    const sourceUrl = decodeHtml(html.match(/class="fullImageLink"[^>]*>\s*<a href="([^"]+)"/i)?.[1] || "");
    const license = getLicense(html);
    if (!sourceUrl || !license || !/\.(jpe?g|png|webp)(\?|$)/i.test(sourceUrl)) continue;
    const authorCell = html.match(/fileinfotpl(?:&#95;|_)aut[^>]*>.*?<\/td>\s*<td[^>]*>(.*?)<\/td>/is)?.[1] || "";
    return {
      page: {
        title: decodeURIComponent(candidate.value.split("/wiki/")[1] || ""),
        imageinfo: [{
          url: sourceUrl,
          descriptionurl: candidate.value,
          mime: /\.png(\?|$)/i.test(sourceUrl) ? "image/png" : "image/jpeg",
          extmetadata: { LicenseShortName: { value: license }, Artist: { value: decodeHtml(stripHtml(authorCell)) } },
        }],
      },
      score: candidate.score,
    };
  }
  return null;
}

async function processCar(car) {
  try {
    let found;
    if (failedOnly) {
      found = await findImageHtml(car);
    } else {
      try {
        found = await findImage(car);
      } catch (error) {
        if (!String(error).includes("429")) throw error;
        found = await findImageHtml(car);
      }
    }
    if (!found) {
      delete mapping[car.slug];
      audit[car.slug] = { model: `${car.brand} ${car.model}`, currentFile: car.image, replacement: false, reason: "No reliable free Commons result" };
      return;
    }
    const info = found.page.imageinfo[0];
    const url = info.thumburl || info.url;
    let response;
    for (let attempt = 0; attempt < 4; attempt++) {
      response = await fetch(url, { headers: { "User-Agent": "KonstantAutoAssetAudit/1.0" } });
      if (response.ok || response.status !== 429) break;
      await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
    }
    if (!response?.ok) throw new Error(`Image download ${response?.status}`);
    const input = Buffer.from(await response.arrayBuffer());
    const sourceMeta = await sharp(input).metadata();
    const target = path.join(outputDir, `${car.slug.replaceAll("_", "-")}.webp`);
    await sharp(input).rotate().resize(1600, 1000, { fit: "contain", background: "#e9e8e4", withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(target);
    const meta = await sharp(target).metadata();
    const license = stripHtml(info.extmetadata.LicenseShortName?.value || "");
    const author = stripHtml(info.extmetadata.Artist?.value || info.extmetadata.Credit?.value || "Unknown");
    mapping[car.slug] = {
      src: `/images/catalog/models/${path.basename(target)}`,
      alt: `${car.brand} ${car.model}`,
      fit: "contain",
      position: "50% 50%",
    };
    audit[car.slug] = {
      model: `${car.brand} ${car.model}`,
      currentFile: car.image,
      newFile: mapping[car.slug].src,
      source: info.descriptionurl,
      sourceFile: info.url,
      author,
      license,
      sourceResolution: `${info.width || sourceMeta.width}x${info.height || sourceMeta.height}`,
      outputResolution: `${meta.width}x${meta.height}`,
      replacement: true,
      score: found.score,
    };
  } catch (error) {
    delete mapping[car.slug];
    audit[car.slug] = { model: `${car.brand} ${car.model}`, currentFile: car.image, replacement: false, reason: String(error) };
  }
}

const concurrency = 2;
let cursor = 0;
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (cursor < selectedCars.length) {
    const car = selectedCars[cursor++];
    await processCar(car);
    await new Promise((resolve) => setTimeout(resolve, 350));
    process.stdout.write(`${cursor}/${selectedCars.length} ${car.slug}\n`);
  }
}));

await fs.writeFile(auditPath, JSON.stringify(audit, null, 2));
await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
console.log(`Saved ${Object.keys(mapping).length} model mappings.`);
