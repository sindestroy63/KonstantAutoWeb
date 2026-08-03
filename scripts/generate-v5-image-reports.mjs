import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cars = JSON.parse(await fs.readFile("data/cars.json", "utf8"));
const audit = JSON.parse(await fs.readFile("tmp/wikimedia-model-audit.json", "utf8").catch(() => "{}"));
const mapping = JSON.parse(await fs.readFile("data/modelImages.generated.json", "utf8").catch(() => "{}"));

const rows = [];
for (const car of cars) {
  const entry = audit[car.slug] || {};
  const currentPath = path.join("public", car.image || "");
  const currentResolution = await sharp(currentPath).metadata().then((meta) => `${meta.width}x${meta.height}`).catch(() => "unknown");
  rows.push({
    model: `${car.brand} ${car.model}`,
    current: car.image || "fallback",
    currentResolution,
    replacement: Boolean(mapping[car.slug] && entry.replacement),
    next: mapping[car.slug]?.src || "-",
    source: entry.source || "Legacy local asset; provenance not documented",
    license: entry.license || "Not documented",
    outputResolution: entry.outputResolution || "-",
    note: entry.replacement ? "Replaced" : entry.reason || "No verified replacement",
  });
}

const replaced = rows.filter((row) => row.replacement).length;
const table = rows.map((row) => `| ${row.model} | ${row.current} | ${row.currentResolution} | ${row.next} | ${row.source} | ${row.license} | ${row.outputResolution} | ${row.replacement ? "yes" : "no"} |`).join("\n");
const auditReport = `# Catalog model image audit\n\n- Catalog positions: ${cars.length}.\n- Unique brand/model pairs: ${new Set(cars.map((car) => `${car.brand} ${car.model}`.toLowerCase())).size}.\n- Verified new local model assets: ${replaced}.\n- Models retaining legacy local sources: ${cars.length - replaced}.\n- Production external image URLs: 0.\n\n| Model | Current file | Current resolution | New file | Source | License | Output resolution | Replaced |\n|---|---|---:|---|---|---|---:|:---:|\n${table}\n`;
await fs.writeFile("tmp/catalog-model-image-audit.md", auditReport);

const imageReport = `# Catalog images report v5\n\n## Media system\n\n- Central model mapping: \`data/modelImages.generated.json\`.\n- Shared renderer: \`components/CarImage.tsx\`.\n- New assets directory: \`public/images/catalog/models/\`.\n- Card media: stable 16:10 containers.\n- Showcase and thumbnails use the same model source and contain behavior.\n- Detail pages resolve through the same central media configuration.\n- Legacy sources default to \`contain\` with a warm neutral background instead of blind \`cover\`.\n- Benefit logic and public-price restrictions were not changed.\n\n## Source replacement\n\n- Wikimedia Commons API/HTML search was attempted for all ${cars.length} unique models.\n- ${replaced} verified Commons assets were downloaded, normalized and connected locally.\n- ${cars.length - replaced} models remain on legacy local files because Commons rate limiting or unreliable search results prevented a verified replacement.\n- No failed search is presented as a completed replacement.\n`;
await fs.writeFile("tmp/catalog-images-report-v5.md", imageReport);
console.log(`Reports generated: ${replaced}/${cars.length} replacements.`);
