import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const cars = JSON.parse(await fs.readFile(path.join(root, "data", "cars.json"), "utf8"));
const modelImages = JSON.parse(await fs.readFile(path.join(root, "data", "modelImages.generated.json"), "utf8"));
const manifest = JSON.parse(await fs.readFile(path.join(root, "data", "car-image-sources.json"), "utf8"));
const errors = [];
const warnings = [];

function publicPathToFile(src) {
  return path.join(root, "public", src.replace(/^\//, ""));
}

function legacyPath(car) {
  const filename = car.image?.split("/").pop()?.replace(/\.[^.]+$/, "").replaceAll("_", "-");
  return `/images/catalog/${filename || "toyota-camry"}.webp`;
}

for (const car of cars) {
  const priority = manifest[car.slug]?.outputFile?.replace(/^public/, "").replaceAll("\\", "/");
  const src = priority || modelImages[car.slug]?.src || legacyPath(car);
  const file = publicPathToFile(src);
  try {
    const metadata = await sharp(file, { failOn: "error" }).metadata();
    if (!metadata.width || !metadata.height) errors.push(`${car.slug}: zero image dimensions`);
  } catch (error) {
    errors.push(`${car.slug}: ${error}`);
  }
}

for (const [slug, entry] of Object.entries(manifest)) {
  const file = path.join(root, entry.outputFile);
  try {
    const metadata = await sharp(file, { failOn: "error" }).metadata();
    const stats = await fs.stat(file);
    if (metadata.width !== entry.width || metadata.height !== entry.height) {
      errors.push(`${slug}: expected ${entry.width}x${entry.height}, got ${metadata.width}x${metadata.height}`);
    }
    if (metadata.format !== "webp") errors.push(`${slug}: expected WebP, got ${metadata.format}`);
    if (stats.size > 650_000) errors.push(`${slug}: output is ${stats.size} bytes (limit 650000)`);
    if (!entry.verified) warnings.push(`${slug}: source URL is not verified`);
    if (entry.visualStatus !== "accepted-local") warnings.push(`${slug}: ${entry.visualStatus}`);
  } catch (error) {
    errors.push(`${slug}: ${error}`);
  }
}

console.log(JSON.stringify({ cars: cars.length, priorityImages: Object.keys(manifest).length, errors, warnings }, null, 2));
if (errors.length > 0) process.exitCode = 1;

