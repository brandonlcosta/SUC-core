// /tests/demoBackyardUltra.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Write into backend/outputs/broadcast
const outputDir = path.resolve(__dirname, "../backend/outputs/broadcast");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const files = {
  events: path.join(outputDir, "events.json"),
  leaderboard: path.join(outputDir, "leaderboard.json"),
  ticker: path.join(outputDir, "ticker.json"),
  spatial: path.join(outputDir, "spatial.json"),
  meta: path.join(outputDir, "meta.json"),
  stories: path.join(outputDir, "stories.json"),
  recap: path.join(outputDir, "recap.json"),
  overlays: path.join(outputDir, "overlays.json"),
  daily: path.join(outputDir, "daily.json"),
};

// Fake runners
const runners = [
  { id: "r123", name: "Alice", laps: 0, lat: 39.12, lon: -120.56 },
  { id: "r456", name: "Bob", laps: 0, lat: 39.13, lon: -120.57 },
  { id: "r789", name: "Charlie", laps: 0, lat: 39.14, lon: -120.58 },
];

let ticker = [];
let events = [];

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function updateCycle() {
  const runner = runners[Math.floor(Math.random() * runners.length)];
  runner.laps += 1;
  runner.lat += (Math.random() - 0.5) * 0.001;
  runner.lon += (Math.random() - 0.5) * 0.001;

  const event = {
    event_type: "lap_complete",
    source: "demo_sim",
    timestamp: new Date().toISOString(),
    details: {
      athlete: runner,
      lap: runner.laps,
    },
  };
  events.push(event);
  ticker.push(`${runner.name} completed lap ${runner.laps}`);

  // Write Leaderboard
  writeJson(files.leaderboard, { leaderboard: runners });

  // Write Events
  writeJson(files.events, events);

  // Write Ticker
  writeJson(files.ticker, { lines: ticker.slice(-10) });

  // Write Spatial
  writeJson(files.spatial, { athletes: runners });

  // Write Meta (context)
  writeJson(files.meta, {
    streaks: ["Alice 3 laps in a row"],
    rivalries: ["Bob vs Charlie"],
    projections: ["Charlie projected 12 laps"],
  });

  // Write Stories
  writeJson(files.stories, [
    { title: "Alice pulls ahead", body: "Alice is leading the pack with consistent pace." },
    { title: "Bob fights back", body: "Bob closes the gap on lap 5." },
  ]);

  // Write Recap
  writeJson(files.recap, { summary: `After ${events.length} events, ${runner.name} just hit lap ${runner.laps}.` });

  // Write Overlays (Highlights)
  writeJson(files.overlays, [
    { type: "text", text: `${runner.name} spotlight on lap ${runner.laps}` },
  ]);

  // Write Daily
  writeJson(files.daily, {
    anchor_stat: {
      title: "Daily Recap",
      summary: `${runner.name} is currently in focus with ${runner.laps} laps.`,
    },
  });

  console.log(`✍️ Updated broadcast files at ${new Date().toLocaleTimeString()}`);
}

setInterval(updateCycle, 3000);

console.log(`🏃 Demo Backyard Ultra generator running...\nWriting JSON files into: ${outputDir}`);
