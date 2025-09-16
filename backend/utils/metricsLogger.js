// Metrics Logger — writes JSONL to backend/outputs/logs/metrics.jsonl
import { promises as fs } from 'fs';
import path from 'path';

const OUT_LOGS = path.join(process.cwd(), 'backend', 'outputs', 'logs');
const METRICS_PATH = path.join(OUT_LOGS, 'metrics.jsonl');

// Async bulk append (full object)
export async function appendMetrics(metrics) {
  await fs.mkdir(OUT_LOGS, { recursive: true });
  const line = JSON.stringify(metrics);
  await fs.appendFile(METRICS_PATH, line + '\n', 'utf8');
  return METRICS_PATH;
}

// Sync-friendly helper for engines
export async function appendMetric(name, dt_ms) {
  return appendMetrics({ ts: Date.now(), name, dt_ms });
}

// Alias for compatibility
export const logMetric = appendMetric;

export default { appendMetrics, appendMetric, logMetric };
