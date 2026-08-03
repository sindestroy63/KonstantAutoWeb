import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GENERATOR_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = path.resolve(GENERATOR_ROOT, '..');
export const DIRS = {
  models: path.join(GENERATOR_ROOT, 'manifests', 'models'),
  prompts: path.join(GENERATOR_ROOT, 'prompts'),
  references: path.join(GENERATOR_ROOT, 'references'),
  outputs: path.join(GENERATOR_ROOT, 'outputs'),
  raw: path.join(GENERATOR_ROOT, 'outputs', 'raw'),
  reports: path.join(GENERATOR_ROOT, 'reports'),
  qa: path.join(GENERATOR_ROOT, 'qa'),
};

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

export async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function loadSettings() {
  return readJson(path.join(GENERATOR_ROOT, 'manifests', 'settings.json'));
}

export async function loadModels() {
  const files = (await fs.readdir(DIRS.models)).filter((name) => name.endsWith('.json')).sort();
  return Promise.all(files.map((name) => readJson(path.join(DIRS.models, name))));
}

export async function loadModel(id) {
  const model = await readJson(path.join(DIRS.models, `${id}.json`));
  if (model.id !== id) throw new Error(`Config id mismatch in ${id}.json`);
  return model;
}

export async function saveModel(model) {
  await writeJson(path.join(DIRS.models, `${model.id}.json`), model);
}

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) args._.push(token);
    else if (token.includes('=')) {
      const [key, ...value] = token.slice(2).split('=');
      args[key] = value.join('=');
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[token.slice(2)] = argv[++i];
    else args[token.slice(2)] = true;
  }
  return args;
}
