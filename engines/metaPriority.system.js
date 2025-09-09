// PATCH: engines/metaPriority.system.js  (adds metrics, reasons already include boosts)
import { c } from "../ecs/world.js";
import { appendMetric } from "./_metrics.js";

const EVENT   = "Event";
const HILITE  = "Highlight";
const RIV     = "RivalryIndex";
const STREAKS = "StreakIndex";
const HIST    = "EventHistory";

export function metaPrioritySystem() {
  const base = { capture: 7, beam_flip: 9, defense: 5, split: 4, finish: 8 };

  function tier(score) { return score >= 8 ? "high" : score >= 4 ? "med" : "low"; }
  function latestTradeCount(riv, a, b, turf) {
    if (!a || !b) return 0;
    const key = `${[a,b].sort().join('|')}|${turf ?? 'NA'}`; return riv[key] || 0;
  }
  function currentStreak(streaks, athlete, turf) {
    return (streaks[athlete]?.[turf]) || 0;
  }

  return {
    name: "metaPrioritySystem",
    async update(world) {
      const t0 = performance.now?.() ?? Date.now();
      const graph = world.query([HIST, RIV, STREAKS])[0]?.components;
      if (!graph) { await appendMetric("meta", 0); return; }

      const targets = world.query([EVENT]);
      for (const { id, components } of targets) {
        const ev = components.get(EVENT);
        if (!ev || components.has(HILITE)) continue;

        let score = base[ev.event_type] ?? 3;
        const reasons = [`base:${score}`];

        const turfEvents = (graph.get(HIST).byTurf?.[ev.turf_id ?? 'NA']) || [];
        const last = turfEvents[turfEvents.length - 2];
        const lastOpp = last?.athlete_id;

        const trades = latestTradeCount(graph.get(RIV), ev.athlete_id, lastOpp, ev.turf_id);
        if (trades >= 2) { score += 2; reasons.push("rivalry_trade:+2"); }

        const streak = currentStreak(graph.get(STREAKS), ev.athlete_id, ev.turf_id);
        if (streak >= 3) { score += 2; reasons.push("streak>=3:+2"); }

        if (score < 1) score = 1; if (score > 10) score = 10;
        world.addComponent(id, c(HILITE, { score, tier: tier(score), reasons }));
      }

      const dt = (performance.now?.() ?? Date.now()) - t0;
      await appendMetric("meta", Math.round(dt));
    }
  };
}
