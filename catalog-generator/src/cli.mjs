import path from 'node:path';
import { DIRS, loadModel, loadModels, parseArgs } from './config.mjs';
import { buildPrompt } from './prompt-builder.mjs';
import { checkReference } from './reference-check.mjs';
import { generateModel } from './generate.mjs';
import { qaAll, qaModel } from './qa.mjs';
import { createPreview } from './preview.mjs';
import { approveModel, dryRunPilotPromotion, importV2, promoteModel, syncCars } from './workflow.mjs';

const args = parseArgs(process.argv.slice(2));
const command = args._[0];
const selectModels = async () => args.model ? [await loadModel(args.model)] : loadModels();

async function main() {
  if (command === 'prompt') {
    for (const model of await selectModels()) console.log(`${model.id}: ${path.join(DIRS.prompts, `${model.id}.txt`)}\n${await buildPrompt(model, await checkReference(model))}\n`);
  } else if (command === 'references') {
    for (const model of await selectModels()) console.log(`${model.id}: ${(await checkReference(model)).referenceUrl}`);
  } else if (command === 'generate') {
    for (const model of await selectModels()) console.log(JSON.stringify(await generateModel(model), null, 2));
  } else if (command === 'qa') {
    if (args.model) console.log(JSON.stringify(await qaModel(await loadModel(args.model)), null, 2));
    else console.log(JSON.stringify(await qaAll(), null, 2));
  } else if (command === 'preview') {
    console.log(JSON.stringify(await createPreview(), null, 2));
  } else if (command === 'import-v2') {
    console.log(JSON.stringify({ imported: await importV2() }, null, 2));
  } else if (command === 'sync') {
    console.log(JSON.stringify(await syncCars(), null, 2));
  } else if (command === 'approve') {
    if (!args.model) throw new Error('approve requires --model');
    console.log(JSON.stringify(await approveModel(await loadModel(args.model), args['owner-confirmed'] === true), null, 2));
  } else if (command === 'promote') {
    if (!args.model) throw new Error('promote requires --model');
    console.log(JSON.stringify(await promoteModel(await loadModel(args.model), args['owner-confirmed'] === true), null, 2));
  } else if (command === 'promotion-dry-run') {
    console.log(JSON.stringify(await dryRunPilotPromotion(), null, 2));
  } else if (command === 'pipeline') {
    const sync = await syncCars();
    const candidates = args.model ? [await loadModel(args.model)] : (await loadModels()).filter((model) => ['draft', 'generated'].includes(model.status));
    const completed = [], blocked = [];
    for (const model of candidates) {
      try {
        if (model.status === 'draft') await generateModel(model);
        await qaModel(await loadModel(model.id));
        completed.push(model.id);
      } catch (error) {
        blocked.push({ modelId: model.id, reason: error.message });
      }
    }
    await qaAll();
    console.log(JSON.stringify({ sync, completed, blocked, preview: await createPreview() }, null, 2));
  } else {
    throw new Error('Usage: cli.mjs <prompt|references|generate|qa|preview|import-v2|sync|approve|promotion-dry-run|promote|pipeline> [--model id]');
  }
}

main().catch((error) => { console.error(error?.stack || String(error)); process.exitCode = 1; });
