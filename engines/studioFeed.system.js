// engines/studioFeed.system.js
/**************************************************
 * Studio Feed Emitter
 * Writes compact feed to outputs/logs/studioFeed.json each update.
 **************************************************/
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { c } from "../ecs/world.js";

const EVENT   = "Event";
const HILITE  = "Highlight";
const ARCS    = "StoryArcs";
const STUDIO_FEED_WRITER = "StudioFeedWriter";
const OUT_PATH = path.join("outputs", "logs", "studioFeed.json");

export function studioFeedSystem() {
  function ensure(world) {
    const s = world.query([STUDIO_FEED_WRITER])[0];
    if (s) return s.components.get(STUDIO_FEED_WRITER);
    const e = world.addEntity();
    return world.addComponent(e, c(STUDIO_FEED_WRITER, { lastWriteTs: 0 }));
  }

  return {
    name: "studioFeedSystem",
    async update(world) {
      ensure(world);

      const scored = world.query([EVENT, HILITE]).map(({components}) => {
        const e = components.get(EVENT);
        const h = components.get(HILITE);
        return { id:e.event_id, type:e.event_type, athlete:e.athlete_id, turf:e.turf_id, tier:h.tier, score:h.score };
      });

      const arcState = world.query([ARCS])[0]?.components.get(ARCS) ?? { topArc: null, arcs: [] };

      const feed = {
        ticker: scored.slice(-8).map(s => ({ t:s.type, a:s.athlete, turf:s.turf, tier:s.tier })),
        leaderboardHints: scored.filter(s => s.tier === "high").slice(-5),
        topArc: arcState.topArc,
        meta: { generated_at: Date.now() }
      };

      await mkdir(path.dirname(OUT_PATH), { recursive: true });
      await writeFile(OUT_PATH, JSON.stringify(feed, null, 2), "utf8");
    }
  };
}
