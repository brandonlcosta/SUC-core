// PATCH: engines/recognitionGraph.system.js  (adds lightweight metrics, no API change)
import { c } from "../ecs/world.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { appendMetric } from "./_metrics.js";

const GRAPH_FILE = "outputs/logs/recognitionGraph.json";
const EVENT_HISTORY = "EventHistory";
const RIVALRY_INDEX = "RivalryIndex";
const STREAK_INDEX  = "StreakIndex";
const EVENT         = "Event";

export function recognitionGraphSystem() {
  let loaded = false;

  async function ensureGraph(world) {
    if (loaded) return;
    const e = world.addEntity();
    const data = await loadGraphFile();
    world.addComponent(e, c(EVENT_HISTORY, data.history));
    world.addComponent(e, c(RIVALRY_INDEX, data.rivalries));
    world.addComponent(e, c(STREAK_INDEX,  data.streaks));
    loaded = true;
  }

  function graphEntity(world) {
    return world.query([EVENT_HISTORY])[0];
  }

  function rivalryKey(a, b, turf) {
    const [x, y] = [a, b].sort();
    return `${x}|${y}|${turf ?? 'NA'}`;
  }

  function applyEvent(cmaps, ev) {
    const hist = cmaps.get(EVENT_HISTORY);
    const riv  = cmaps.get(RIVALRY_INDEX);
    const strk = cmaps.get(STREAK_INDEX);

    hist.events.push(ev);
    (hist.byAthlete[ev.athlete_id] ||= []).push(ev);
    (hist.byTurf[ev.turf_id ?? 'NA'] ||= []).push(ev);

    const turfEvents = hist.byTurf[ev.turf_id ?? 'NA'];
    const last = turfEvents[turfEvents.length - 2];

    if (last && last.athlete_id !== ev.athlete_id) {
      const key = rivalryKey(last.athlete_id, ev.athlete_id, ev.turf_id);
      riv[key] = (riv[key] || 0) + 1;
    }

    const byAth = (strk[ev.athlete_id] ||= {});
    const prevHolder = last?.athlete_id;
    byAth[ev.turf_id] = (!prevHolder || prevHolder === ev.athlete_id)
      ? (byAth[ev.turf_id] || 0) + 1
      : 1;
  }

  return {
    name: "recognitionGraphSystem",
    async update(world) {
      const t0 = performance.now?.() ?? Date.now();
      await ensureGraph(world);

      const incoming = world.query([EVENT]);
      if (incoming.length) {
        const g = graphEntity(world);
        for (const { components } of incoming) {
          const ev = components.get(EVENT);
          if (ev.__handled) continue;
          applyEvent(g.components, ev);
          ev.__handled = true;
        }
        await saveGraphFile(
          g.components.get(EVENT_HISTORY),
          g.components.get(RIVALRY_INDEX),
          g.components.get(STREAK_INDEX)
        );
      }

      const dt = (performance.now?.() ?? Date.now()) - t0;
      await appendMetric("graph", Math.round(dt));
    }
  };
}

export function makeEvent({ event_id, event_type, athlete_id, crew, turf_id, timestamp, metadata }) {
  return c("Event", { event_id, event_type, athlete_id, crew, turf_id, timestamp, metadata });
}

async function loadGraphFile() {
  try {
    const raw = await readFile(GRAPH_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { history: { events: [], byAthlete: {}, byTurf: {} }, rivalries: {}, streaks: {} };
  }
}

async function saveGraphFile(history, rivalries, streaks) {
  const payload = JSON.stringify({ history, rivalries, streaks }, null, 2);
  await mkdir(dirname(GRAPH_FILE), { recursive: true });
  await writeFile(GRAPH_FILE, payload, "utf8");
}
