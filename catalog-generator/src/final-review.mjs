import fs from 'node:fs/promises';
import path from 'node:path';
import { DIRS, loadModel, saveModel, writeJson, readJson } from './config.mjs';
import { qaAll } from './qa.mjs';
import { createPreview } from './preview.mjs';

const reviews = [
  { id: 'toyota-camry', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. XV80 lighting, lower grille, sedan proportions and XSE fascia are coherent.' },
  { id: 'toyota-rav4', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. Sixth-generation hammerhead/C-shaped lighting and angular Woodland body are coherent.' },
  { id: 'toyota-land-cruiser-300', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. Full-size J300 body, horizontal grille and rectangular lamps are coherent; no J250 cues.' },
  { id: 'toyota-hilux', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. Current AN120/AN130 double-cab facelift identity and Adventure front are coherent.' },
  { id: 'toyota-corolla', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. Current E210 facelift sedan lighting, grille and proportions are coherent.' },
  { id: 'toyota-yaris', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. XP210 five-door hatchback proportions and current European front are coherent.' },
  { id: 'bmw-3-series', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. Smooth lower headlamp contour, inverted-L lighting and current M Sport bumper no longer read as pre-LCI.' },
  { id: 'bmw-x3', visualGenerationMatch: 'needs-review', semanticQa: 'needs-review', generationQa: 'approved', suspectedPreviousGeneration: false, issues: ['Lower central bumper insert is unusually simplified and does not confidently match the production G45 trim detail.'], recommendation: 'Hold from promotion. Compare the lower bumper against an official G45 front view or regenerate this model.' },
  { id: 'bmw-x5', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. Thin arrow-signature headlamps, current grille and LCI M Sport bumper no longer read as pre-LCI.' },
  { id: 'kia-k5', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. DL3 facelift body and Star Map front signature are coherent; no Optima or pre-facelift face.' },
  { id: 'kia-sorento', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. MQ4 facelift vertical lamps, Star Map signature and current grille are coherent.' },
  { id: 'lexus-rx', visualGenerationMatch: 'approved', semanticQa: 'approved', generationQa: 'approved', suspectedPreviousGeneration: false, issues: [], recommendation: 'Approved for owner-confirmed promotion. ALH10 spindle-body front, narrow lamps and fifth-generation proportions are coherent.' },
];

async function main() {
  const reportEntries = [];
  for (const review of reviews) {
    const model = await loadModel(review.id);
    const approved = review.visualGenerationMatch === 'approved' && review.semanticQa === 'approved' && review.generationQa === 'approved';
    model.status = approved ? 'approved' : 'qa';
    model.approved = approved;
    await saveModel(model);
    reportEntries.push({
      manufacturer: model.manufacturer, model: model.model, generation: `${model.generation} / ${model.chassisCode}`,
      status: approved ? 'approved' : 'needs-review', visualGenerationMatch: review.visualGenerationMatch,
      semanticQa: review.semanticQa, generationQa: review.generationQa,
      suspectedPreviousGeneration: review.suspectedPreviousGeneration, suspectedMixedGeneration: false,
      issues: review.issues, recommendation: review.recommendation,
    });
  }

  const finalReport = {
    reviewedAt: new Date().toISOString(), scope: '12 V2 pilot images', reviewer: 'Codex visual review',
    criteria: ['generation identity', 'mixed generation', 'front lighting', 'grille', 'bumpers', 'body proportions', 'door count', 'logos', 'fantasy elements', 'AI artifacts', 'catalog consistency'],
    approvedCount: reportEntries.filter((entry) => entry.status === 'approved').length,
    needsReviewCount: reportEntries.filter((entry) => entry.status === 'needs-review').length,
    entries: reportEntries,
  };
  await writeJson(path.join(DIRS.reports, 'pilot-final-review.json'), finalReport);

  const qaResult = await qaAll();
  const byId = new Map(reviews.map((review) => [review.id, review]));
  for (const entry of qaResult.reports) {
    const review = byId.get(entry.modelId);
    if (!review) continue;
    entry.visualGenerationMatch = review.visualGenerationMatch;
    entry.semanticQa = review.semanticQa;
    entry.generationQa = review.generationQa;
    entry.suspectedPreviousGeneration = review.suspectedPreviousGeneration;
    entry.suspectedMixedGeneration = false;
    entry.issues = review.issues;
    entry.checks.exactlyOneVehicle = { status: 'pass', method: 'final-visual-review' };
    entry.checks.noPeople = { status: 'pass', method: 'final-visual-review' };
    entry.checks.noText = { status: 'pass', method: 'final-visual-review', note: 'No promotional, overlay, watermark or dealer text; authentic vehicle badges are acceptable.' };
    entry.checks.noWatermark = { status: 'pass', method: 'final-visual-review' };
    entry.checks.generationIdentity = { status: review.generationQa === 'approved' ? 'pass' : 'review', method: 'final-visual-review' };
    await writeJson(path.join(DIRS.qa, `${entry.modelId}.json`), entry);
  }
  await writeJson(path.join(DIRS.reports, 'catalog-qa.json'), { checkedAt: new Date().toISOString(), entries: qaResult.reports, consistency: qaResult.consistency, visualReview: { approved: finalReport.approvedCount, needsReview: finalReport.needsReviewCount } });

  const v2QaPath = path.join(path.resolve(DIRS.qa, '..', '..'), 'tmp', 'generated-catalog-pilot-v2', 'qa-report.json');
  const v2Qa = await readJson(v2QaPath);
  for (const entry of v2Qa.entries) {
    const model = reviews.map((review) => ({ review, filename: path.basename(entry.generatedFile) })).find(({ review }) => {
      const configName = review.id === 'toyota-land-cruiser-300' ? 'toyota-land-cruiser-300' : review.id;
      return entry.generatedFile.includes(configName) || (review.id === 'toyota-hilux' && entry.generatedFile.includes('toyota-hilux-current'));
    });
    if (!model) continue;
    entry.visualGenerationMatch = model.review.visualGenerationMatch;
    entry.semanticQa = model.review.semanticQa;
    entry.generationQa = model.review.generationQa;
    entry.suspectedPreviousGeneration = model.review.suspectedPreviousGeneration;
    entry.suspectedMixedGeneration = false;
    entry.issues = model.review.issues;
  }
  await writeJson(v2QaPath, v2Qa);
  const preview = await createPreview();
  console.log(JSON.stringify({ finalReport: path.join(DIRS.reports, 'pilot-final-review.json'), approved: finalReport.approvedCount, needsReview: finalReport.needsReviewCount, preview }, null, 2));
}

main().catch((error) => { console.error(error?.stack || String(error)); process.exitCode = 1; });
