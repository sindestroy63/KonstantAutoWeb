import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const manifestPath = path.join(root, "data", "car-image-sources.json");
const reportPath = path.join(root, "tmp", "catalog-image-processing.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const report = [];

for (const [slug, entry] of Object.entries(manifest)) {
  const inputPath = path.join(root, entry.originalFile);
  const outputPath = path.join(root, entry.outputFile);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const source = sharp(inputPath, { failOn: "error" }).rotate();
  const sourceMetadata = await source.metadata();
  const lowResolution =
    (sourceMetadata.width ?? 0) < entry.width ||
    (sourceMetadata.height ?? 0) < entry.height;

  await source
    .toColorspace("srgb")
    .resize(entry.width, entry.height, {
      fit: "contain",
      position: "centre",
      background: "#efefec",
      withoutEnlargement: true,
    })
    .webp({ quality: 84, effort: 5, smartSubsample: true })
    .toFile(outputPath);

  const outputMetadata = await sharp(outputPath).metadata();
  const stats = await fs.stat(outputPath);
  report.push({
    slug,
    input: entry.originalFile,
    output: entry.outputFile,
    sourceDimensions: `${sourceMetadata.width}x${sourceMetadata.height}`,
    outputDimensions: `${outputMetadata.width}x${outputMetadata.height}`,
    bytes: stats.size,
    lowResolution,
    verifiedSource: entry.verified,
    visualStatus: entry.visualStatus,
  });

  const warning = lowResolution ? " [source below target; not upscaled]" : "";
  console.log(`${slug}: ${outputMetadata.width}x${outputMetadata.height}, ${stats.size} bytes${warning}`);
}

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Prepared ${report.length} priority catalog images.`);

