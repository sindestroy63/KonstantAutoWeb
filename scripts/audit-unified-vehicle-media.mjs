import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const cars = JSON.parse(await fs.readFile(path.join(root, "data", "cars.json"), "utf8"));
const manifest = JSON.parse(await fs.readFile(path.join(root, "public", "images", "catalog", "manifest.json"), "utf8"));
const productionEntries = manifest.images || {};

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(directory, recursive = false) {
  if (!(await exists(directory))) return [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isFile()) files.push(target);
    if (recursive && entry.isDirectory()) files.push(...await listFiles(target, true));
  }
  return files;
}

const approved = [];
const requiresGeneration = [];
for (const car of cars) {
  const entry = productionEntries[car.slug];
  const validEntry = entry?.status === "production" && /^[a-z0-9-]+\.webp$/i.test(entry.file || "");
  const absoluteFile = validEntry ? path.join(root, "public", "images", "catalog", entry.file) : null;
  if (validEntry && await exists(absoluteFile)) {
    approved.push({
      slug: car.slug,
      manufacturer: car.brand,
      model: car.model,
      country: car.country,
      bodyType: car.bodyType,
      image: `/images/catalog/${entry.file}`,
      status: "production-ai",
    });
  } else {
    requiresGeneration.push({
      slug: car.slug,
      manufacturer: car.brand,
      model: car.model,
      country: car.country,
      bodyType: car.bodyType,
      status: "queued",
      reason: validEntry ? "production-file-missing" : "missing-production-ai",
      pipeline: {
        referenceCheck: "required",
        promptBuild: "pending",
        generation: "pending",
        semanticQa: "pending",
        generationQa: "pending",
        ownerApproval: "pending",
        promotion: "blocked-until-approved",
      },
    });
  }
}

const runtimeRoots = ["app", "components", "lib"];
const runtimeFiles = (await Promise.all(runtimeRoots.map((directory) => listFiles(path.join(root, directory), true))))
  .flat()
  .filter((file) => /\.(?:ts|tsx|js|mjs|css)$/.test(file));
const forbiddenPatterns = [
  /\/cars\//g,
  /\/images\/catalog\/priority\//g,
  /\/images\/catalog\/models\//g,
  /\/images\/hero\//g,
  /modelImages\.generated/g,
  /car-image-sources/g,
];
const forbiddenRuntimeReferences = [];
for (const file of runtimeFiles) {
  const source = await fs.readFile(file, "utf8");
  for (const pattern of forbiddenPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) {
      forbiddenRuntimeReferences.push({
        file: path.relative(root, file).replaceAll("\\", "/"),
        pattern: pattern.source,
      });
    }
  }
}

const productionFiles = new Set(approved.map((item) => path.basename(item.image)));
const rootCatalogWebps = (await listFiles(path.join(root, "public", "images", "catalog")))
  .filter((file) => file.endsWith(".webp"));
const retainedLegacyFiles = {
  catalogRootNotInProductionManifest: rootCatalogWebps.filter((file) => !productionFiles.has(path.basename(file))).length,
  priorityDirectory: (await listFiles(path.join(root, "public", "images", "catalog", "priority"))).length,
  modelsDirectory: (await listFiles(path.join(root, "public", "images", "catalog", "models"))).length,
  heroDirectory: (await listFiles(path.join(root, "public", "images", "hero"))).length,
};

const report = {
  generatedAt: new Date().toISOString(),
  policy: {
    soleVehicleImageSource: "public/images/catalog/manifest.json entries with status=production",
    missingImageBehavior: "render-neutral-placeholder-and-create-generation-task",
    automaticLegacyFallback: false,
    deleteLegacyOnlyAtCoveragePercent: 100,
  },
  counts: {
    totalModels: cars.length,
    productionAiModels: approved.length,
    legacyModelsInRuntime: 0,
    modelsRequiringGeneration: requiresGeneration.length,
    coveragePercent: Number(((approved.length / cars.length) * 100).toFixed(2)),
  },
  approvedModels: approved,
  legacyModelsInRuntime: [],
  modelsRequiringGeneration: requiresGeneration.map(({ pipeline: _pipeline, ...task }) => task),
  forbiddenRuntimeReferences,
  retainedLegacyFiles,
  legacyDeletion: {
    allowed: requiresGeneration.length === 0 && forbiddenRuntimeReferences.length === 0,
    performed: false,
    reason: requiresGeneration.length === 0 ? "awaiting-explicit-owner-promotion" : "coverage-below-100-percent",
  },
};

const queue = {
  version: 1,
  generatedAt: report.generatedAt,
  source: "data/cars.json",
  targetManifest: "public/images/catalog/manifest.json",
  taskCount: requiresGeneration.length,
  tasks: requiresGeneration,
};

await fs.mkdir(path.join(root, "catalog-generator", "reports"), { recursive: true });
await fs.mkdir(path.join(root, "catalog-generator", "manifests"), { recursive: true });
await fs.writeFile(path.join(root, "catalog-generator", "reports", "unified-vehicle-media.json"), `${JSON.stringify(report, null, 2)}\n`);
await fs.writeFile(path.join(root, "catalog-generator", "manifests", "generation-queue.json"), `${JSON.stringify(queue, null, 2)}\n`);

console.log(JSON.stringify({ counts: report.counts, forbiddenRuntimeReferences, retainedLegacyFiles, legacyDeletion: report.legacyDeletion }, null, 2));
if (forbiddenRuntimeReferences.length > 0) process.exitCode = 1;
