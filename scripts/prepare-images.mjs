import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "reference", "car-source-images");
const catalogDir = path.join(root, "public", "images", "catalog");
const heroDir = path.join(root, "public", "images", "hero");

await fs.mkdir(catalogDir, { recursive: true });
await fs.mkdir(heroDir, { recursive: true });

const files = (await fs.readdir(sourceDir)).filter((file) => /\.(jpe?g|png)$/i.test(file));

for (const file of files) {
  const source = path.join(sourceDir, file);
  const target = path.join(catalogDir, `${path.parse(file).name.replaceAll("_", "-")}.webp`);
  await sharp(source)
    .rotate()
    .resize(1280, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(target);
}

const heroSource = path.join(sourceDir, "audi_a6.jpg");
const desktopBackground = await sharp(heroSource)
  .rotate().resize(2400, 1350, { fit: "cover" }).blur(24).modulate({ brightness: 0.78, saturation: 0.62 }).toBuffer();
const desktopCar = await sharp(heroSource)
  .rotate().resize(1740, 980, { fit: "inside" }).grayscale().tint("#5f666b").modulate({ brightness: 0.68 }).png().toBuffer();
const desktopMeta = await sharp(desktopCar).metadata();
const desktopMask = Buffer.from(`<svg width="${desktopMeta.width}" height="${desktopMeta.height}"><defs><radialGradient id="g" cx="58%" cy="52%" rx="61%" ry="68%"><stop offset="0.68" stop-color="white"/><stop offset="1" stop-color="black" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
const desktopForeground = await sharp(desktopCar).composite([{ input: desktopMask, blend: "dest-in" }]).png().toBuffer();
await sharp(desktopBackground)
  .composite([{ input: desktopForeground, left: 650, top: 190 }])
  .webp({ quality: 88, effort: 6 })
  .toFile(path.join(heroDir, "audi-a6-desktop.webp"));

const mobileBackground = await sharp(heroSource)
  .rotate().resize(780, 1640, { fit: "cover" }).blur(30).modulate({ brightness: 0.82, saturation: 0.58 }).toBuffer();
const mobileCar = await sharp(heroSource)
  .rotate().resize(740, 360, { fit: "inside" }).grayscale().tint("#5f666b").modulate({ brightness: 0.7 }).png().toBuffer();
const mobileMeta = await sharp(mobileCar).metadata();
const mobileMask = Buffer.from(`<svg width="${mobileMeta.width}" height="${mobileMeta.height}"><defs><radialGradient id="g"><stop offset="0.72" stop-color="white"/><stop offset="1" stop-color="black" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
const mobileForeground = await sharp(mobileCar).composite([{ input: mobileMask, blend: "dest-in" }]).png().toBuffer();
await sharp(mobileBackground)
  .composite([{ input: mobileForeground, left: 20, top: 1210 }])
  .webp({ quality: 86, effort: 6 })
  .toFile(path.join(heroDir, "audi-a6-mobile.webp"));

const auditNames = [
  "audi_a6.jpg", "bmw_5_series.jpg", "bmw_x5.jpg", "bmw_x7.jpg",
  "toyota_camry.jpg", "toyota_rav4.jpg", "toyota_land_cruiser.png", "toyota_hilux.jpg",
  "lexus_es.jpg", "lexus_rx.jpg", "porsche_panamera.jpg", "volvo_s60.jpg",
  "mercedes_c_class.jpg", "kia_stinger.jpg", "audi_a4.jpg", "audi_q7.jpg",
];
const tiles = await Promise.all(auditNames.map(async (name, index) => ({
  input: await sharp(path.join(sourceDir, name)).rotate().resize(360, 240, { fit: "cover" }).png().toBuffer(),
  left: (index % 4) * 360,
  top: Math.floor(index / 4) * 240,
})));
await sharp({ create: { width: 1440, height: 960, channels: 3, background: "#d8d8d6" } })
  .composite(tiles)
  .png()
  .toFile(path.join(root, "tmp", "catalog-audit-sheet.png"));

console.log(`Prepared ${files.length} catalog images and hero variants.`);
