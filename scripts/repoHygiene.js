// scripts/repoHygiene.js
// Enforces Playbook step 1: delete `graphs/`, keep `graph/`; ensure /outputs/logs exists.
// Non-destructive to `graph/`. Safe to run multiple times.
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

function ensureLogsRoot() {
  const logs = join(process.cwd(), 'outputs', 'logs');
  try { mkdirSync(logs, { recursive: true }); } catch {}
}

function removeGraphsDuplicate() {
  const graphs = join(process.cwd(), 'graphs');
  const graph = join(process.cwd(), 'graph');
  if (existsSync(graphs)) {
    // Only remove duplicate dir; keep canonical `graph/`.
    rmSync(graphs, { recursive: true, force: true });
    // eslint-disable-next-line no-console
    console.log('[repoHygiene] Removed duplicate "graphs/"; kept "graph/".');
  } else {
    // eslint-disable-next-line no-console
    console.log('[repoHygiene] No "graphs/" dir found. Nothing to remove.');
  }
  if (!existsSync(graph)) {
    // eslint-disable-next-line no-console
    console.warn('[repoHygiene] WARNING: canonical "graph/" directory is missing.');
  }
}

function main() {
  ensureLogsRoot();
  removeGraphsDuplicate();
  // eslint-disable-next-line no-console
  console.log('[repoHygiene] Hygiene pass complete.');
}

main();
