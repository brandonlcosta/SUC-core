// harness/tickHarness.js
// Harness v3 (D-027): Run, Replay, Compare, Regression
// Patched with seeded RNG for stable regression tests.

import fs from "fs";
import { createMetaEngine } from "../engines/metaEngine.js";
import { createStoryEngine } from "../engines/storyEngine.js";
import { createCommentaryEngine } from "../engines/commentaryEngine.js";
import { createBroadcastEngine } from "../engines/broadcastEngine.js";
import { getDefault } from "../utils/engineDefaults.js";

export async function runTicks({ ticks = 10, players = [] }) {
  const meta = createMetaEngine();
  const story = createStoryEngine();
  const comms = createCommentaryEngine();
  const broadcast = createBroadcastEngine();

  const cfg = {
    meta: getDefault("Meta").enabled !== false,
    story: getDefault("Story").enabled !== false,
    commentary: getDefault("Commentary").enabled !== false,
    broadcast: getDefault("Broadcast").enabled !== false,
  };

  const session = [];
  const logs = { meta: [], story: [], commentary: [], broadcast: [] };

  for (let t = 0; t < ticks; t++) {
    let metaEvents = [];
    let storyEvents = [];
    let commentaryEvents = [];
    let broadcastEvents = [];

    if (cfg.meta) {
      metaEvents = meta.reduce({
        type: "TICK_UPDATE",
        payload: { players: players.map(p => simulatePlayer(p, t)) },
      });
      logs.meta.push({ tick: t, events: metaEvents });
    }

    if (cfg.story && metaEvents.length) {
      storyEvents = story.reduce({ type: "META_EVENTS", payload: { metaEvents } });
      logs.story.push({ tick: t, events: storyEvents });
    }

    if (cfg.commentary && storyEvents.length) {
      commentaryEvents = comms.reduce({ type: "STORY_EVENTS", payload: { storyEvents } });
      logs.commentary.push({ tick: t, events: commentaryEvents });
    }

    if (cfg.broadcast && commentaryEvents.length) {
      broadcastEvents = broadcast.reduce({ type: "COMMENTARY_EVENTS", payload: { commentaryEvents } });
      logs.broadcast.push({ tick: t, events: broadcastEvents });
    }

    session.push({ tick: t, metaEvents, storyEvents, commentaryEvents, broadcastEvents });
  }

  fs.writeFileSync("narrativeSession.json", JSON.stringify(session, null, 2));
  fs.writeFileSync("metaLog.json", JSON.stringify(logs.meta, null, 2));
  fs.writeFileSync("storyLog.json", JSON.stringify(logs.story, null, 2));
  fs.writeFileSync("commentaryLog.json", JSON.stringify(logs.commentary, null, 2));
  fs.writeFileSync("broadcastLog.json", JSON.stringify(logs.broadcast, null, 2));

  return session;
}

export function replaySession(path = "narrativeSession.json") {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

/**
 * Compare two sessions tick-by-tick.
 */
export function compareSessions(sessionA, sessionB) {
  const diffs = [];
  const maxTicks = Math.max(sessionA.length, sessionB.length);

  for (let t = 0; t < maxTicks; t++) {
    const a = sessionA[t] || {};
    const b = sessionB[t] || {};
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs.push({ tick: t, a, b });
    }
  }
  return diffs;
}

/**
 * Run new session and compare against a reference log.
 */
export async function regressionTest(referencePath, opts) {
  const ref = replaySession(referencePath);
  const fresh = await runTicks(opts);
  const diffs = compareSessions(ref, fresh);

  if (diffs.length === 0) {
    console.log("✅ Regression test passed — outputs stable.");
  } else {
    console.log("⚠️ Regression differences found:", diffs.length);
    diffs.forEach(d => {
      console.log(`Tick ${d.tick} mismatch:`);
      console.log("A:", JSON.stringify(d.a, null, 2));
      console.log("B:", JSON.stringify(d.b, null, 2));
    });
  }
  return diffs;
}

// --- seeded RNG for deterministic regression tests ---
let seed = 42;
function rng() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function simulatePlayer(player, tick) {
  return {
    id: player.id,
    active: rng() > 0.3,
    score: player.score + Math.floor(rng() * (tick + 1)),
  };
}
