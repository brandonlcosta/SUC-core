
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const RULESET_EXT = '.ruleset.json';

let cache = null;

function validate(r, fileName) {
  const must = ['id', 'mode', 'sport', 'version', 'meta', 'scoring'];
  for (const k of must) {
    if (!(k in r)) throw new Error(`ruleset ${fileName} missing key: ${k}`);
  }
  if (typeof r.id !== 'string' || !r.id) throw new Error(`ruleset ${fileName} invalid id`);
  if (typeof r.mode !== 'string' || !r.mode) throw new Error(`ruleset ${fileName} invalid mode`);
}

async function loadAll() {
  if (cache) return cache;
  const files = (await fs.readdir(__dirname)).filter(f => f.endsWith(RULESET_EXT));
  const list = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(__dirname, f), 'utf8');
    const json = JSON.parse(raw);
    validate(json, f);
    list.push(json);
  }
  const byId = Object.fromEntries(list.map(r => [r.id, r]));
  if (Object.keys(byId).length !== list.length) {
    throw new Error('duplicate ruleset ids detected');
  }
  const byMode = Object.fromEntries(list.map(r => [r.mode, r]));
  cache = { list, byId, byMode };
  return cache;
}

export async function listRulesets() {
  const all = await loadAll();
  return all.list;
}

export async function getRulesetById(id) {
  const all = await loadAll();
  const r = all.byId[id];
  if (!r) throw new Error(`ruleset not found by id: ${id}`);
  return r;
}

export async function getRulesetByMode(mode) {
  const all = await loadAll();
  const r = all.byMode[mode];
  if (!r) throw new Error(`ruleset not found by mode: ${mode}`);
  return r;
}

export async function tryGetRuleset(key) {
  const all = await loadAll();
  return all.byId[key] || all.byMode[key] || null;
}
