// engines/storyArc.system.js
/**************************************************
 * Story Arc Bundler (stub)
 * Groups recent Highlighted events into a simple rivalry arc.
 * Input: Event + Highlight (+ Recognition Graph context if present)
 * Output (component on singleton): { arcs: [{title, beats:[]}], topArc }
 **************************************************/
import { c } from "../ecs/world.js";

const EVENT   = "Event";
const HILITE  = "Highlight";
const HIST    = "EventHistory";  // optional, if recognitionGraphSystem is registered
const ARCS    = "StoryArcs";     // singleton component

export function storyArcSystem({ windowSize = 10 } = {}) {
  function ensureSingleton(world) {
    const holder = world.query([ARCS])[0];
    if (holder) return holder.components.get(ARCS);
    const e = world.addEntity();
    return world.addComponent(e, c(ARCS, { arcs: [], topArc: null }));
  }

  function makeTitle(sample) {
    const a = sample?.athlete ?? "Unknown";
    const turf = sample?.turf ?? "NA";
    return `Control of ${turf}: ${a}`;
  }

  return {
    name: "storyArcSystem",
    update(world) {
      const arcsState = ensureSingleton(world);
      const scored = world.query([EVENT, HILITE])
        .map(({components}) => {
          const e = components.get(EVENT);
          const h = components.get(HILITE);
          return { athlete: e.athlete_id, turf: e.turf_id, tier: h.tier, score: h.score, id: e.event_id, type: e.event_type };
        });

      const recent = scored.slice(-windowSize);
      if (recent.length === 0) return;

      // Simple grouping: per turf, collect beats, pick highest-score turf as top arc
      const byTurf = new Map();
      for (const s of recent) {
        const bucket = byTurf.get(s.turf) || [];
        bucket.push(s);
        byTurf.set(s.turf, bucket);
      }

      const arcs = [];
      for (const [turf, beats] of byTurf) {
        const top = beats.reduce((a,b)=> (b.score||0) > (a.score||0) ? b : a, beats[0]);
        arcs.push({ title: makeTitle(top), beats });
      }

      arcs.sort((a,b) => (b.beats.reduce((s,x)=>s+(x.score||0),0)) - (a.beats.reduce((s,x)=>s+(x.score||0),0)));
      arcsState.arcs = arcs;
      arcsState.topArc = arcs[0];
    }
  };
}
