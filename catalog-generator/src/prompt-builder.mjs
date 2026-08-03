import fs from 'node:fs/promises';
import path from 'node:path';
import { DIRS, GENERATOR_ROOT, loadSettings } from './config.mjs';

const REQUIRED = ['manufacturer', 'model', 'years', 'generation', 'chassisCode', 'facelift', 'market', 'body', 'trim'];

export async function buildPrompt(model, reference) {
  const missing = REQUIRED.filter((field) => !model[field] || String(model[field]).includes('TODO'));
  if (missing.length) throw new Error(`${model.id}: unresolved identity fields: ${missing.join(', ')}`);
  const settings = await loadSettings();
  const negatives = JSON.parse(await fs.readFile(path.join(GENERATOR_ROOT, 'manifests', 'brand-negative-prompts.json'), 'utf8'));
  const brandNegative = [...(negatives._default || []), ...(negatives[model.manufacturer] || [])];
  const c = settings.composition;
  const prompt = [
    'Use case: product-mockup. Asset type: identity-critical automotive catalog photograph.',
    `Manufacturer: ${model.manufacturer}. Model: ${model.model}. Model years: ${model.years}.`,
    `Generation: ${model.generation}. Chassis code: ${model.chassisCode}. Facelift status: ${model.facelift}.`,
    `Regional specification: ${model.market}. Body style: ${model.body}. Trim: ${model.trim}. Paint: ${model.paint || 'factory production color'}.`,
    `Exact production identity cues: ${model.identityCues.join('; ')}.`,
    `Official manufacturer reference confirms: ${(reference.confirmedBodyCues || model.identityCues).join('; ')}.`,
    ...(model.referenceImageUrl ? ['Image 1 is an official manufacturer identity reference. Preserve its exact serial-production generation, body shell, headlights, grille, bumper, door handles, glazing, badges and wheel architecture; change only the setting, camera framing and neutral OEM paint if necessary.'] : []),
    `Hard model exclusions: ${model.modelExclusions.join('; ')}.`,
    `Brand exclusions: ${brandNegative.join('; ')}.`,
    `Realistic serial-production vehicle, front three-quarter view, nose pointing right. Camera height ${c.cameraHeightMeters} metres, ${c.lensEquivalentMm} mm full-frame equivalent lens, minimal perspective distortion.`,
    `Entire vehicle fully visible, including both bumpers, roof, doors, wheels and tires. Vehicle occupies ${c.vehicleWidthPercent} percent of image width. Wheels straight, matching, and resting on one visual baseline.`,
    'Neutral seamless light-gray studio cyclorama, soft diffused catalog lighting, restrained contact shadow beneath the tires, low reflection intensity, consistent horizon and scale.',
    'Exactly one car. No environment, people, other vehicles, text, watermark, dealer plate, readable license, concepts, invented lighting, modified badges, extra doors, handles or pillars, malformed wheels or mixed body panels.',
    'Depict the exact named serial-production model year, generation, chassis and body. Never substitute a previous generation or blend generations. Prioritize production identity over generic attractiveness.',
  ].join('\n');
  await fs.mkdir(DIRS.prompts, { recursive: true });
  await fs.writeFile(path.join(DIRS.prompts, `${model.id}.txt`), `${prompt}\n`, 'utf8');
  return prompt;
}
