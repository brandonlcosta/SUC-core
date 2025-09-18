// File: backend/engines/recognitionGraph.system.js
// Recognition Graph System — maintains rivalries, streaks, event history

import { c } from "../../ecs/world.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { appendMetric } from "./_metrics.js";

const GRAPH_FILE = "backend/outputs/logs/recognitionGraph.json";
const EVENT_HISTORY = "EventHistory";
const RIVALRY_INDEX = "RivalryIndex";
const STREAK_INDEX = "StreakIndex";
const EVENT = "Event";

export function recognitionGraphSystem() {
  let loaded = false;

  async function ensureGraph(world) {
    if (loaded) return;
    const e = world.addEntity();
    const data = await loadGraphFile();
    world.addComponent(e, c(EVENT_HISTORY, data.history));
    world.addComponent(e, c(RIVALRY_INDEX, data.rivalries));
    world.addComponent(e, c(STREAK_INDEX, data.streaks));
    loaded = true;
  }

  function graphEntity(world) {
    return world.query([EVENT_HISTORY])[0];
  }

  function rivalryKey(a, b, turf) {
    const [x, y] = [a, b].sort();
    return `${x}|${y}|${turf ?? "NA"}`;
  }

  function applyEvent(cmaps, ev) {
    const hist = cmaps.get(EVENT_HISTORY);
    const riv = cmaps.get(RIVALRY_INDEX);
    const strk = cmaps.get(STREAK_INDEX);

    // Track event in history
    hist.push(ev);

    // Rivalries
    if (ev.type === "head_to_head") {
      const key = rivalryKey(ev.a, ev.b, ev.turf);
      riv[key] = (riv[key] || 0) + 1;
    }

    // Streaks
    if (ev.type === "streak") {
      strk[ev.athleteId] = (strk[ev.athleteId] || 0) + ev.laps;
    }

    appendMetric("recognition_event", { type: ev.type });
  }

  async function loadGraphFile() {
    try {
      const raw = await readFile(GRAPH_FILE, "utf8");
      return JSON.parse(raw);
    } catch {
      return { history: [], rivalries: {}, streaks: {} };
    }
  }

  async function saveGraphFile(data) {
    await mkdir(dirname(GRAPH_FILE), { recursive: true });
    await writeFile(GRAPH_FILE, JSON.stringify(data, null, 2));
  }

  return {
    ensureGraph,
    graphEntity,
    applyEvent,
    loadGraphFile,
    saveGraphFile,
  };
}

// ✅ Default export: factory wrapper
export default {
  recognitionGraphSystem,
};
