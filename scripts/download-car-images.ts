/**
 * Скачивает по одному релевантному изображению для каждой машины из data/catalog.json
 * (или data/cars.json) через Wikipedia REST API и Wikimedia Commons.
 * Сохраняет в public/cars/<slug>.<ext> и обновляет поле image в JSON.
 * Расширение определяется по Content-Type или URL (.jpg / .png / .webp).
 * Задержка 300–900 мс между запросами.
 */

import * as fs from "fs";
import * as path from "path";

const DELAY_MS_MIN = 300;
const DELAY_MS_MAX = 900;
const USER_AGENT = "KonstantAuto-ImageDownloader/1.0 (https://konstant-auto.ru)";

type CarRecord = {
  slug: string;
  brand: string;
  model: string;
  image?: string;
  [key: string]: unknown;
};

type WikiSummary = {
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
  title?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return Math.floor(Math.random() * (DELAY_MS_MAX - DELAY_MS_MIN + 1)) + DELAY_MS_MIN;
}

function getDataPath(scriptDir: string): { path: string; exists: boolean } {
  const dataDir = path.join(scriptDir, "..", "data");
  const catalogPath = path.join(dataDir, "catalog.json");
  const carsPath = path.join(dataDir, "cars.json");
  if (fs.existsSync(catalogPath)) return { path: catalogPath, exists: true };
  if (fs.existsSync(carsPath)) return { path: carsPath, exists: true };
  return { path: carsPath, exists: false };
}

function getCars(dataPath: string): CarRecord[] {
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw) as unknown;
  if (!Array.isArray(data)) throw new Error("JSON must be an array of cars");
  return data as CarRecord[];
}

/** Проверяет, что image уже задан и файл существует (любое расширение). */
function shouldSkip(car: CarRecord, projectRoot: string): boolean {
  const img = car.image;
  if (!img || typeof img !== "string") return false;
  if (!img.startsWith("/cars/")) return false;
  const fullPath = path.join(projectRoot, "public", img.replace(/^\//, ""));
  return fs.existsSync(fullPath);
}

/** Wikipedia REST: page/summary. TITLE в URL — с подчёркиваниями. */
function wikiSummaryUrl(wikiHost: string, title: string): string {
  const safe = title.replace(/\s+/g, "_");
  return `https://${wikiHost}/api/rest_v1/page/summary/${encodeURIComponent(safe)}`;
}

async function fetchWikiSummary(wikiHost: string, title: string): Promise<WikiSummary | null> {
  const url = wikiSummaryUrl(wikiHost, title);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as WikiSummary;
  } catch {
    return null;
  }
}

/** Из summary берём originalimage.source или thumbnail.source. */
function getImageUrlFromSummary(summary: WikiSummary): string | null {
  const orig = summary.originalimage?.source;
  if (orig) return orig;
  return summary.thumbnail?.source ?? null;
}

/** Перебор вариантов заголовков и хостов для Wikipedia. */
async function fetchImageUrlFromWikipedia(brand: string, model: string): Promise<string | null> {
  const titles = [
    `${brand} ${model}`,
    `${brand} ${model} (automobile)`,
    `${brand} ${model} (car)`,
    `${brand} ${model} (auto)`,
  ];
  const hosts = ["en.wikipedia.org", "ru.wikipedia.org"];

  for (const host of hosts) {
    for (const title of titles) {
      const summary = await fetchWikiSummary(host, title);
      if (!summary) continue;
      const url = getImageUrlFromSummary(summary);
      if (url) return url;
    }
  }
  return null;
}

/** Wikimedia Commons search — один результат, thumbnail. */
async function fetchImageUrlFromCommons(brand: string, model: string): Promise<string | null> {
  const query = `${brand} ${model} car`;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1000",
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    };
    const pages = data.query?.pages;
    if (!pages || typeof pages !== "object") return null;
    const first = Object.values(pages)[0];
    return first?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/** Получить URL изображения: сначала Wikipedia, потом Commons. */
async function findImageUrl(brand: string, model: string): Promise<string | null> {
  const fromWiki = await fetchImageUrlFromWikipedia(brand, model);
  if (fromWiki) return fromWiki;
  return fetchImageUrlFromCommons(brand, model);
}

/** Расширение по Content-Type или по URL. */
function getExtension(contentType: string | null, imageUrl: string): string {
  if (contentType) {
    if (contentType.includes("image/jpeg") || contentType.includes("image/jpg")) return "jpg";
    if (contentType.includes("image/png")) return "png";
    if (contentType.includes("image/webp")) return "webp";
  }
  try {
    const pathname = new URL(imageUrl).pathname;
    const lower = pathname.toLowerCase();
    if (lower.endsWith(".png")) return "png";
    if (lower.endsWith(".webp")) return "webp";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  } catch {
    // ignore
  }
  return "jpg";
}

async function downloadImageToBuffer(imageUrl: string): Promise<{ buffer: ArrayBuffer; contentType: string | null } | null> {
  try {
    const res = await fetch(imageUrl, {
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    if (!buffer.byteLength) return null;
    const contentType = res.headers.get("content-type");
    return { buffer, contentType };
  } catch {
    return null;
  }
}

function writeFileSyncSafe(filePath: string, data: ArrayBuffer): boolean {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(data));
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const scriptDir = __dirname;
  const projectRoot = path.join(scriptDir, "..");

  const { path: dataPath, exists } = getDataPath(scriptDir);
  if (!exists) {
    console.error("Not found: data/catalog.json or data/cars.json");
    process.exit(1);
  }

  const cars = getCars(dataPath);
  const carsDir = path.join(projectRoot, "public", "cars");
  fs.mkdirSync(carsDir, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let noImageFound = 0;

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    if (!car.slug || !car.brand || !car.model) {
      console.warn(`[skip] invalid record at index ${i}`);
      continue;
    }

    if (shouldSkip(car, projectRoot)) {
      skipped++;
      await sleep(randomDelay());
      continue;
    }

    const imageUrl = await findImageUrl(car.brand, car.model);
    if (!imageUrl) {
      console.warn(`[no image] ${car.slug} (${car.brand} ${car.model})`);
      noImageFound++;
      await sleep(randomDelay());
      continue;
    }

    const result = await downloadImageToBuffer(imageUrl);
    if (!result) {
      console.warn(`[failed] ${car.slug} (download)`);
      failed++;
      await sleep(randomDelay());
      continue;
    }

    const ext = getExtension(result.contentType, imageUrl);
    const outPath = path.join(projectRoot, "public", "cars", `${car.slug}.${ext}`);
    if (!writeFileSyncSafe(outPath, result.buffer)) {
      console.warn(`[failed] ${car.slug} (write)`);
      failed++;
      await sleep(randomDelay());
      continue;
    }

    car.image = `/cars/${car.slug}.${ext}`;
    downloaded++;
    await sleep(randomDelay());
  }

  fs.writeFileSync(dataPath, JSON.stringify(cars, null, 2), "utf-8");

  console.log("---");
  console.log(`total: ${cars.length}`);
  console.log(`downloaded: ${downloaded}`);
  console.log(`skipped: ${skipped}`);
  console.log(`failed: ${failed}`);
  console.log(`noImageFound: ${noImageFound}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
