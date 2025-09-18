// File: backend/tests/demoBackyardUltra.js

import fs from "fs";
import path from "path";

const FEEDS_PATH = path.join(process.cwd(), "backend", "outputs", "broadcast", "feeds.json");

const athletes = [
  { athlete_id: "runner_brandon", name: "Brandon", crew: "SUC", tier: "vip", laps: 0 },
  { athlete_id: "runner_emily", name: "Emily", crew: "Trail Blazers", tier: "standard", laps: 0 }
];

function initFeed() {
  const feed = {
    session_id: "demo_backyard_ultra",
    athletes,
    events: []
  };
  fs.mkdirSync(path.dirname(FEEDS_PATH), { recursive: true });
  fs.writeFileSync(FEEDS_PATH, JSON.stringify(feed, null, 2));
}

function startEmitter() {
  let tick = 0;
  setInterval(() => {
    tick++;
    const athlete = athletes[tick % athletes.length];
    athlete.laps++;

    const event = {
      event_id: `evt_${Date.now()}`,
      overlay_type: "lap_update",
      athlete_ids: [athlete.athlete_id],
      priority: 5,
      timestamp: Date.now()
    };

    const feed = JSON.parse(fs.readFileSync(FEEDS_PATH));
    feed.athletes = athletes;
    feed.events.push(event);

    fs.writeFileSync(FEEDS_PATH, JSON.stringify(feed, null, 2));
    console.log(`Lap event emitted for ${athlete.name}`);
  }, 5000);
}

if (!fs.existsSync(FEEDS_PATH)) {
  initFeed();
}
startEmitter();
