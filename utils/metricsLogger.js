// Append JSONL metrics to outputs/logs/metrics.jsonl
import { promises as fs } from 'fs';
import path from 'path';

const OUT_LOGS = path.join(process.cwd(), 'outputs', 'logs');
const METRICS_PATH = path.join(OUT_LOGS, 'metrics.jsonl');

export async function appendMetrics(metrics) {
  await fs.mkdir(OUT_LOGS, { recursive: true });
  const line = JSON.stringify(metrics);
  await fs.appendFile(METRICS_PATH, line + '\n', 'utf8');
  return METRICS_PATH;
}

export default { appendMetrics };
