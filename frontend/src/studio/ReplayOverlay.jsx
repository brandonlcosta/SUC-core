// File: frontend/src/studio/ReplayOverlay.jsx
//
// ReplayOverlay v1 — Highlights + Sponsor Bumper
// ✅ Reducer-driven (groupedOverlays["replay"])
// ✅ Plays highlight clips from recap.json
// ✅ Sponsor banner w/ SUC watermark
// ✅ Zoom-in + flash animation

import React, { useEffect, useRef } from "react";
import { useBroadcast } from "./Reducer";

export default function ReplayOverlay() {
  const { state } = useBroadcast();
  const replays = state.groupedOverlays?.replay || [];
  const videoRef = useRef(null);

  if (!replays.length) return null;

  const current = replays[0]; // show only top replay

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 animate-zoom">
      <div className="relative w-3/4 h-3/4 rounded-2xl overflow-hidden border-4 border-neon-red shadow-2xl">
        <video
          ref={videoRef}
          src={current.clip}
          className="w-full h-full object-cover"
          playsInline
          muted={false}
          autoPlay
        />
        {/* Watermark */}
        <div className="absolute bottom-2 right-4 text-white font-bold text-sm opacity-75">
          SUC REPLAY
        </div>
        {/* Sponsor Bumper */}
        {current.sponsor && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-xl border-2 border-neon-yellow animate-flash">
            Replay presented by {current.sponsor}
          </div>
        )}
      </div>
    </div>
  );
}
