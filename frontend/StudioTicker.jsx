// frontend/StudioTicker.jsx
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Props:
 * - feed: [{priority, role, text, ts}]
 * - sponsorMeta?: { ticker_bug?: { duration_s, active_from_ts, active_until_ts }, ... }
 *
 * Behavior:
 * - Orders by priority desc, then ts asc.
 * - If sponsorMeta.ticker_bug is expired (now > active_until_ts), hides the sponsor bug item(s).
 */
export default function StudioTicker({ feed = [], sponsorMeta }) {
  const listRef = useRef(null);
  const [nowS, setNowS] = useState(() => Math.floor(Date.now() / 1000));

  // Tick clock every second to evaluate TTL; cheap and isolated to this panel.
  useEffect(() => {
    const id = setInterval(() => setNowS(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const bugMeta = sponsorMeta?.ticker_bug;
    const bugAlive =
      !bugMeta || // if no meta, keep behavior as-is
      (typeof bugMeta.active_until_ts !== 'number' ? true : nowS <= bugMeta.active_until_ts);

    // If bug expired, drop sponsor items (role === 'sponsor'); otherwise keep all.
    return bugAlive ? feed : feed.filter(it => it.role !== 'sponsor');
  }, [feed, sponsorMeta, nowS]);

  const ordered = useMemo(
    () => [...filtered].sort((a, b) => (b.priority - a.priority) || (a.ts - b.ts)),
    [filtered]
  );

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [ordered]);

  return (
    <div className="w-full h-full overflow-hidden rounded-2xl border border-neutral-800 bg-black/60 backdrop-blur p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs uppercase tracking-widest font-bold text-emerald-300">Ticker</div>
        {sponsorMeta?.ticker_bug?.active_until_ts ? (
          <div className="text-[10px] text-neutral-400">
            bug TTL: {Math.max(0, sponsorMeta.ticker_bug.active_until_ts - nowS)}s
          </div>
        ) : null}
      </div>
      <div ref={listRef} className="h-[140px] overflow-auto space-y-1 pr-1">
        {ordered.map((it, i) => (
          <div key={i} className="text-sm bg-neutral-900/70 rounded px-2 py-1">
            <span className="font-semibold mr-2">[{it.role}]</span>
            <span>{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
