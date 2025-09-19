// File: frontend/studio/SponsorPanel.jsx

import React, { useEffect, useState } from "react";
import { useBroadcast } from "./BroadcastContext.jsx";
import assets from "../assets/assets.json";

export default function SponsorPanel() {
  const { state } = useBroadcast();
  const [sponsor, setSponsor] = useState(null);

  // Listen for sponsor overlays
  useEffect(() => {
    if (
      state.currentOverlay &&
      state.currentOverlay.overlay_type === "sponsor_overlay"
    ) {
      setSponsor(state.currentOverlay);
    }
  }, [state.currentOverlay]);

  if (!sponsor) return null; // No sponsor active

  // Try to resolve sponsor logo from assets.json
  const sponsorAsset = assets.find((a) => a.id === sponsor.sponsor_id);
  const logoUrl = sponsor.logo || sponsorAsset?.thumbnail_url;

  return (
    <div className="absolute bottom-0 w-full flex justify-center">
      <div className="bg-black/80 border-2 border-suc-red rounded-t-2xl px-6 py-3 flex items-center gap-4 shadow-lg animate-pulse-neon">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={sponsor.sponsor_id}
            className="h-12 object-contain"
          />
        ) : (
          <span className="text-white font-bold text-lg">
            {sponsor.message || "Presented by SUC"}
          </span>
        )}
      </div>
    </div>
  );
}
