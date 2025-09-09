// /frontend/pages/StoryDemo.jsx
// Simple demo page for manual verification. No data fetching.
// Usage: import into your dev shell or mount directly in your preview environment.

import React from "react";
import StoryPanel from "../components/StoryPanel.jsx";

const sampleArcs = [
  {
    arc_id: "rivalry:a1|b2:1000",
    arc_type: "rivalry",
    title: "Trading Blows: a1 vs b2",
    beats: [
      { ts: 1, statement: "Momentum building.", pri: 5, a_id: "a1", b_id: "b2" },
      { ts: 2, statement: "Closing the gap — live comeback.", pri: 10, a_id: "a1", b_id: "b2" },
      { ts: 3, statement: "Momentum building.", pri: 10, a_id: "b2", b_id: "a1" }
    ],
    projection: { next_split_s: 298.9 },
    priority: 9,
    status: "open",
    started_ts: 1000,
    updated_ts: 3000,
    a_id: "a1",
    b_id: "b2"
  },
  {
    arc_id: "comeback:b2:5000",
    arc_type: "comeback",
    title: "Closing In: b2's Comeback",
    beats: [
      { ts: 5, statement: "Closing the gap — live comeback.", pri: 9, a_id: "b2" },
      { ts: 6, statement: "Closing the gap — live comeback.", pri: 8, a_id: "b2" }
    ],
    projection: { next_split_s: 286.16 },
    priority: 8,
    status: "open",
    started_ts: 5000,
    updated_ts: 6000,
    a_id: "b2"
  }
];

export default function StoryDemo() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <StoryPanel arcs={sampleArcs} />
      </div>
    </div>
  );
}
