// File: backend/engines/priorityTierSystem.js
// Meta Priority System — assigns highlight tiers with reasons

import { c } from "../../ecs/world.js";
import { appendMetric } from "./_metrics.js";

const EVENT = "Event";
const HILITE = "Highlight";
const RIV = "RivalryIndex";
const STREAKS = "StreakIndex";
const HIST = "EventHistory";

export function metaPrioritySystem() {
  const base = { capture: 7, beam_flip: 9, defense: 5, split: 4, finish: 8 };

  function tier(score) {
    return score >= 8 ? "high" : score >= 4 ? "med" : "low";
  }

  function latestTradeCount(riv, a, b, turf) {
    if (!a || !b) return 0;
    const key = `${[a, b].sort().join("|")}|${turf ?? "NA"}`;
    return riv[key] || 0;
  }

  function currentStreak(streaks, athlete, turf) {
    return streaks[athlete]?.[turf] || 0;
  }

  return {
    name: "metaPrioritySystem",

    async update(world) {
      const t0 = performance.now?.() ?? Date.now();
      const graph = world.query([HIST, RIV, STREAKS])[0]?.components;
      if (!graph) {
        await appendMetric("metaPriority.empty", 0);
        return;
      }

      const targets = world.query([EVENT]);
      for (const { id, components } of targets) {
        const ev = components.get(EVENT);
        if (!ev || ev.scored) continue;

        let score = base[ev.type] || 1;
        const reasons = [];

        if (ev.type === "head_to_head") {
          score += latestTradeCount(graph.get(RIV), ev.a, ev.b, ev.turf);
          reasons.push("rivalry_boost");
        }

        if (ev.athleteId) {
          const streak = currentStreak(graph.get(STREAKS), ev.athleteId, ev.turf);
          if (streak > 2) {
            score += streak;
            reasons.push("streak_boost");
          }
        }

        components.set(HILITE, {
          tier: tier(score),
          score,
          reasons,
        });

        ev.scored = true;
        await appendMetric("metaPriority.scored", score);
      }

      const elapsed = (performance.now?.() ?? Date.now()) - t0;
      await appendMetric("metaPriority.update_time", elapsed);
    },
  };
}

// ✅ Default export: factory wrapper
export default {
  metaPrioritySystem,
};
