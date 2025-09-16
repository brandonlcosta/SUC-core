import { create } from "zustand";

// Small global store for demo: leaderboard, ticker, health.
export const useBroadcastStore = create((set, get) => ({
  transport: { transport: "init", status: "idle" },
  eventsSeen: 0,
  ticker: [],
  leaderboard: [], // [{athlete_id, name, bib, laps}]
  runners: {},     // map athlete_id → {name, bib, laps}
  lastUpdateAt: null,

  setStatus: (s) => set({ transport: s }),
  ingestEvent: (evt) => {
    const state = get();
    // Update runners/leaderboard on lap_completed
    if (evt.event_type === "lap_completed") {
      const id = evt.athlete_id;
      const meta = evt.metadata || {};
      const name = evt.name || state.runners?.[id]?.name || `Runner ${id}`;
      const bib = evt.bib ?? state.runners?.[id]?.bib ?? null;
      const laps = (state.runners?.[id]?.laps ?? 0) + 1;
      const runners = { ...state.runners, [id]: { name, bib, laps } };
      const leaderboard = Object.entries(runners)
        .map(([aid, r]) => ({ athlete_id: aid, ...r }))
        .sort((a, b) => b.laps - a.laps);

      set({
        runners,
        leaderboard,
        ticker: [
          { text: `${name} (${bib ?? "—"}) completes Lap ${laps}`, t: evt.timestamp },
          ...state.ticker
        ].slice(0, 50),
        eventsSeen: state.eventsSeen + 1,
        lastUpdateAt: Date.now()
      });
    }

    // Commentary events can push ticker too
    if (evt.event_type === "commentary_line" && evt?.text) {
      set((s) => ({
        ticker: [{ text: evt.text, t: evt.timestamp }, ...s.ticker].slice(0, 50),
        eventsSeen: s.eventsSeen + 1,
        lastUpdateAt: Date.now()
      }));
    }
  },
}));
