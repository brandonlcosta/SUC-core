// frontend/HighlightPlayer.jsx
import { useEffect, useRef, useState } from 'react';

/**
 * Props:
 * - manifest: { clips:[{clip_id,start,end,caption}], sponsor?: { bumper?: string, duration_s?: number } }
 * Behavior:
 * - If a sponsor bumper exists, show a pre-roll "bumper mode" for duration_s (default 3s) before cycling clips.
 * - Then cycle through clips every 3s, with captions.
 */
export default function HighlightPlayer({ manifest = { clips: [] } }) {
  const [idx, setIdx] = useState(0);
  const [showBumper, setShowBumper] = useState(!!manifest?.sponsor?.bumper);
  const [remaining, setRemaining] = useState(
    typeof manifest?.sponsor?.duration_s === 'number' ? manifest.sponsor.duration_s : 3
  );
  const clipTimerRef = useRef(null);
  const bumperTimerRef = useRef(null);
  const tickRef = useRef(null);

  const clips = manifest?.clips ?? [];
  const bumperId = manifest?.sponsor?.bumper;
  const bumperDur = typeof manifest?.sponsor?.duration_s === 'number' ? manifest.sponsor.duration_s : 3;

  // Reset state when manifest (or bumper) changes
  useEffect(() => {
    clearInterval(clipTimerRef.current);
    clearTimeout(bumperTimerRef.current);
    clearInterval(tickRef.current);

    if (bumperId) {
      setShowBumper(true);
      setRemaining(bumperDur);
      // Countdown display
      tickRef.current = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
      // End of bumper window -> start clip cycle
      bumperTimerRef.current = setTimeout(() => {
        setShowBumper(false);
        clearInterval(tickRef.current);
        startClipCycle();
      }, bumperDur * 1000);
    } else {
      setShowBumper(false);
      startClipCycle();
    }

    return () => {
      clearInterval(clipTimerRef.current);
      clearTimeout(bumperTimerRef.current);
      clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bumperId, bumperDur, clips.length]);

  function startClipCycle() {
    if (!clips.length) return;
    clearInterval(clipTimerRef.current);
    clipTimerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % clips.length);
    }, 3000);
  }

  const clip = clips[idx] || null;

  return (
    <div className="w-full h-full rounded-2xl border border-neutral-800 bg-black/60 backdrop-blur p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-widest font-bold text-pink-300">Highlights</div>
        {bumperId ? (
          <div className="text-[10px] text-emerald-300">Sponsor bumper: {bumperId}</div>
        ) : null}
      </div>

      {showBumper ? (
        <div className="flex flex-col items-start gap-2">
          <div className="text-sm text-neutral-300">Presenting sponsor</div>
          <div className="text-2xl font-extrabold tracking-tight">
            {bumperId?.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div className="text-xs text-neutral-400">Starts in {remaining}s…</div>
        </div>
      ) : clip ? (
        <div className="space-y-2">
          <div className="text-sm font-semibold">#{clip.clip_id}</div>
          <div className="text-xs text-neutral-300">
            {clip.start}s → {clip.end}s
          </div>
          <div className="text-lg">{clip.caption}</div>
        </div>
      ) : (
        <div className="text-neutral-400 text-sm">Awaiting clips…</div>
      )}
    </div>
  );
}
