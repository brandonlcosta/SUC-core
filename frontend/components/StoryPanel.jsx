// /frontend/components/StoryPanel.jsx
// Props-only story panel for SUC Studio.
// API: <StoryPanel arcs={[{ arc_id, arc_type, title, beats, projection, priority, status, started_ts, updated_ts, a_id, b_id }]}/>
// Design: compact cards sorted by priority, timeline of beats, projection pill, SUC esports skin.
// ≤200 LOC, no external data deps.

import React from "react";

const ArcBadge = ({ type }) => {
  const map = {
    rivalry: { label: "Rivalry", cls: "bg-pink-600/15 text-pink-400" },
    comeback: { label: "Comeback", cls: "bg-emerald-600/15 text-emerald-400" },
    dominance: { label: "Dominance", cls: "bg-indigo-600/15 text-indigo-400" },
    underdog: { label: "Underdog", cls: "bg-amber-600/15 text-amber-400" },
  };
  const meta = map[type] || { label: type, cls: "bg-slate-600/15 text-slate-300" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

const PriorityChip = ({ value }) => (
  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-700/60 text-white">
    PRI {Math.max(1, Math.min(10, Math.round(value || 1)))}
  </span>
);

const Beat = ({ b, i }) => (
  <div className="flex items-start gap-3">
    <div className="flex flex-col items-center">
      <div className="w-2 h-2 rounded-full bg-slate-400 mt-1" />
      {i !== "last" && <div className="w-px flex-1 bg-slate-700/70 my-1" />}
    </div>
    <div className="flex-1">
      <div className="text-[11px] text-slate-400">{formatTs(b.ts)}</div>
      <div className="text-sm text-slate-100">{b.statement}</div>
    </div>
    <div className="text-[10px] text-slate-400">p{b.pri ?? "-"}</div>
  </div>
);

function formatTs(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts));
  if (Number.isNaN(d.getTime())) return `t=${ts}`;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ArcCard({ arc }) {
  const beats = Array.isArray(arc.beats) ? arc.beats.slice(-6) : [];
  return (
    <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ArcBadge type={arc.arc_type} />
          <h3 className="text-slate-100 text-base font-semibold truncate max-w-[38ch]" title={arc.title}>
            {arc.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {arc.projection?.next_split_s != null && (
            <span className="text-xs text-sky-300 bg-sky-700/20 px-2 py-0.5 rounded-md">
              proj: {arc.projection.next_split_s}s
            </span>
          )}
          <PriorityChip value={arc.priority} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
        <div><span className="text-slate-500">A:</span> {arc.a_id ?? "-"}</div>
        <div><span className="text-slate-500">B:</span> {arc.b_id ?? "-"}</div>
        <div><span className="text-slate-500">Started:</span> {formatTs(arc.started_ts)}</div>
        <div><span className="text-slate-500">Updated:</span> {formatTs(arc.updated_ts)}</div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Beats</div>
        <div className="flex flex-col">
          {beats.length === 0 ? (
            <div className="text-sm text-slate-400">No beats yet.</div>
          ) : (
            beats.map((b, idx) => (
              <Beat key={`${arc.arc_id}:b:${idx}`} b={b} i={idx === beats.length - 1 ? "last" : idx} />
            ))
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-[11px] px-2 py-0.5 rounded-md ${arc.status === "open" ? "bg-emerald-700/20 text-emerald-300" : "bg-slate-700/40 text-slate-300"}`}>
          {arc.status === "open" ? "LIVE" : "CLOSED"}
        </span>
        <div className="text-[11px] text-slate-500">id: {arc.arc_id}</div>
      </div>
    </div>
  );
}

export default function StoryPanel({ arcs = [] }) {
  const sorted = [...arcs].sort(
    (a, b) => (b?.priority ?? 0) - (a?.priority ?? 0) || (b?.updated_ts ?? 0) - (a?.updated_ts ?? 0)
  );
  return (
    <div className="w-full">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-xl text-slate-100 font-bold">Story Arcs</h2>
          <p className="text-slate-400 text-sm">Priority-driven narratives powering the studio.</p>
        </div>
        <div className="text-slate-400 text-sm">
          {sorted.length} arc{sorted.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((arc) => <ArcCard key={arc.arc_id} arc={arc} />)}
      </div>
    </div>
  );
}
