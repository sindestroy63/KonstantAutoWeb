import path from 'node:path';
import { DIRS, loadModel, readJson, writeJson } from './config.mjs';
import { generateModel } from './generate.mjs';

const modelId = process.argv[2];
if (!modelId) throw new Error('Usage: node generate-full-catalog-model.mjs <model-id>');
const usagePath = path.join(DIRS.reports, 'full-catalog-api-usage.json');
const usage = await readJson(usagePath);
try {
  const report = await generateModel(await loadModel(modelId));
  usage.totalApiRequests += 1 + (report.infrastructureRetries || 0);
  usage.imageResponsesReceived += 1;
  usage.successfulResponses += 1;
  usage.infrastructureErrors += report.infrastructureRetries || 0;
  usage.events.push({ at: new Date().toISOString(), modelId, status: 'image-received', infrastructureRetries: report.infrastructureRetries || 0 });
  usage.updatedAt = new Date().toISOString();
  await writeJson(usagePath, usage);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  usage.totalApiRequests += 1;
  usage.infrastructureErrors += 1;
  usage.events.push({ at: new Date().toISOString(), modelId, status: 'failed-before-image', error: error.message });
  usage.updatedAt = new Date().toISOString();
  await writeJson(usagePath, usage);
  throw error;
}
