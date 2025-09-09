// studio/panels.js
// Hype Studio panels: ticker, leaderboard, story
// Pure functions over HypeGraph queries; no side effects.

export function makeTicker(graph, { limit = 20 } = {}) {
  const events = graph.recentEvents({ limit });
  return events.map((e) => ({
    ts: e.ts,
    text: `${e.athleteId} · ${e.type}`,
    score: typeof e.score === "number" ? e.score : 0,
    id: e.id
  }));
}

export function makeLeaderboard(graph, { topN = 10 } = {}) {
  // Delegates to graph to compute sums/sort
  return graph.leaderboard({ topN }).map((row, i) => ({
    rank: i + 1,
    athleteId: row.athleteId,
    score: row.score
  }));
}

export function makeStory(graph, { topN = 6 } = {}) {
  const highs = graph.stories({ topN });
  return highs.map((h) => ({
    id: h.id,
    ts: h.ts,
    title: h.title ?? "Highlight",
    lineage: Array.isArray(h.lineage) ? h.lineage : []
  }));
}

export default { makeTicker, makeLeaderboard, makeStory };
