// scripts/pipelineTest.js
// Print story path so the UI can load arcs from outputs/broadcast/story.json
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { runBroadcast } from '../engines/broadcastEngine.js';
import { appendMetrics } from '../utils/metricsLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);
const sponsorConfig = require(path.join(repoRoot, 'configs', 'overlays', 'sponsorSlots.json'));

async function readCsvIfExists(csvPath) {
  try {
    const raw = await fs.readFile(csvPath, 'utf8');
    const lines = raw.trim().split(/\r?\n/);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const [athlete_id, laps, rank, streak] = lines[i].split(',');
      rows.push({ athlete_id, laps: +laps, rank: +rank, streak: +streak });
    }
    return rows;
  } catch { return null; }
}

function sampleData() {
  const leaderboard = [
    { athlete_id: 'ath_1', laps: 12, rank: 1, streak: 3 },
    { athlete_id: 'ath_2', laps: 12, rank: 2, streak: 1 },
    { athlete_id: 'ath_9', laps: 11, rank: 15, streak: 0 }
  ];
  const runner_state = {
    runners: [
      { id: 'ath_1', eliminated: false },
      { id: 'ath_2', eliminated: false },
      { id: 'ath_9', eliminated: true }
    ],
    events: [
      { type: 'elimination', athlete_id: 'ath_9', lap: 11, ts: 16850 },
      { type: 'lead_change', athlete_id: 'ath_1', lap: 12, ts: 16900 }
    ]
  };
  const lines = [
    { priority: 9, role: 'play_by_play', text: 'Lap 12 split for ath_1 at 3175s.', ts: 16905 },
    { priority: 7, role: 'analyst', text: 'ath_1 projected 11 min/mi.', ts: 16905 }
  ];
  const ruleset = {
    broadcast_hints: {
      highlight_triggers: ['elimination', 'lead_change'],
      weights: { role: { play_by_play: 1, analyst: 0, color: 0, wildcard: 0 }, trigger: { lead_change: 1, elimination: 1 } }
    },
    templates: {
      commentary: { color: ['Crowd lifts the leaders.'], wildcard: ['Local club out in force.'] }
    }
  };
  return { leaderboard, runner_state, lines, ruleset };
}

async function main() {
  const csvPath = path.join(repoRoot, 'data', 'harness', 'leaderboard.csv');
  const fromCsv = await readCsvIfExists(csvPath);
  const base = sampleData();
  const leaderboard = fromCsv ?? base.leaderboard;

  const pushHUD = async (hud) => {
    if (process.env.FAIL_PUSH === '1') throw new Error('simulated push failure');
    const livePushPath = path.join(repoRoot, 'outputs', 'broadcast', 'hud_livepush.json');
    await fs.mkdir(path.dirname(livePushPath), { recursive: true });
    await fs.writeFile(livePushPath, JSON.stringify({ ok: true, hud }, null, 2));
  };

  const { hud, ticker, recap, metrics, paths } = await runBroadcast({
    leaderboard,
    runner_state: base.runner_state,
    lines: base.lines,
    ruleset: base.ruleset,
    sponsorConfig,
    pushHUD
  });

  await appendMetrics(metrics);

  console.log('Artifacts:', paths);
  console.log('HUD sponsor slots:', hud?.sponsor?.active_slots, 'meta:', hud?.sponsor?.meta);
  console.log('Ticker[0]:', ticker?.[0]);
  console.log('Recap sponsor bumper:', recap?.sponsor?.bumper ?? null, 'dur:', recap?.sponsor?.duration_s ?? null);
  console.log('Schema errors %:', metrics.schema_errors_pct, 'Added fallback roles:', metrics.added_fallback_lines);

  // Acceptance checks (unchanged)
  if (!Array.isArray(ticker) || !hud?.leaderboard || !recap?.clips) {
    throw new Error('Acceptance failed: missing artifacts');
  }
  const hasBug = ticker[0]?.role === 'sponsor';
  const hasHudLogo = Array.isArray(hud?.sponsor?.active_slots) && hud.sponsor.active_slots.includes('hud_logo');
  const hasBumper = !!recap?.sponsor?.bumper;
  if (!(hasBug && hasHudLogo && hasBumper)) {
    throw new Error(`Sponsor acceptance failed: bug=${hasBug} hudLogo=${hasHudLogo} bumper=${hasBumper}`);
  }
  const roles = new Set(ticker.map(t => t.role));
  for (const r of ['play_by_play', 'analyst', 'color', 'wildcard']) {
    if (!roles.has(r)) throw new Error(`Role balance failed: missing ${r}`);
  }
  if (metrics.p95_latency_ms >= 3000) {
    console.warn('Warning: p95 >= 3s (local env). Optimize or run on warm cache.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
