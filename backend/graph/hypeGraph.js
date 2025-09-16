// graph/hypeGraph.js
// v0 append-only Hype Graph with lineage capture
// ESM, ≤300 LOC

import fs from "fs";
import path from "path";

const GRAPH_FILE = path.resolve(process.cwd(), "logs/graph.jsonl");

function ensureFile() {
  try {
    fs.mkdirSync(path.dirname(GRAPH_FILE), { recursive: true });
    if (!fs.existsSync(GRAPH_FILE)) fs.writeFileSync(GRAPH_FILE, "");
  } catch {}
}

export class HypeGraph {
  constructor({ persist = true } = {}) {
    this.persist = persist;
    this.events = new Map();      // id -> event
    this.highlights = new Map();  // id -> { ...highlight, lineage: [eventIds] }
    ensureFile();
  }

  writeEvent(evt) {
    if (!evt?.id) throw new Error("Event missing id");
    this.events.set(evt.id, evt);
    this.#append({ kind: "event", data: evt });
    return evt.id;
  }

  writeHighlight(hl) {
    if (!hl?.id) throw new Error("Highlight missing id");
    const lineage = Array.from(new Set(hl.lineage || [])).filter((id) =>
      this.events.has(id)
    );
    const entry = { ...hl, lineage, ts: hl.ts ?? Date.now() };
    this.highlights.set(hl.id, entry);
    this.#append({ kind: "highlight", data: entry });
    return hl.id;
  }

  recentEvents({ limit = 50 } = {}) {
    const arr = Array.from(this.events.values());
    return arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0)).slice(0, limit);
  }

  leaderboard({ topN = 10 } = {}) {
    const sums = {};
    for (const e of this.events.values()) {
      const a = e.athleteId;
      const s = typeof e.score === "number" ? e.score : 0;
      sums[a] = (sums[a] || 0) + s;
    }
    return Object.entries(sums)
      .map(([athleteId, score]) => ({ athleteId, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  stories({ topN = 10 } = {}) {
    const arr = Array.from(this.highlights.values());
    return arr.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0)).slice(0, topN);
  }

  #append(obj) {
    if (!this.persist) return;
    try {
      fs.appendFileSync(GRAPH_FILE, JSON.stringify(obj) + "\n");
    } catch {}
  }
}

// Back-compat alias: keep old imports working during transition
export { HypeGraph as RecognitionGraph };

export default HypeGraph;
