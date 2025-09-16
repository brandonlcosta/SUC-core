/**************************************************
 * Tiny metrics helpers (no framework)
 * appendMetric({ phase, dt_ms })
 **************************************************/
import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.join('backend', 'outputs', 'logs', 'metrics.jsonl');

export async function appendMetric(phase, dt_ms) {
  await mkdir(path.dirname(OUT), { recursive: true });
  const line = JSON.stringify({ t: Date.now(), phase, dt_ms }) + '\n';
  await appendFile(OUT, line, 'utf8');
}

export default { appendMetric };
