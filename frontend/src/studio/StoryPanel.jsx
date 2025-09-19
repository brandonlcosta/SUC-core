import React from "react";
import { useBroadcast } from "./Reducer";

export default function StoryPanel() {
  const { state } = useBroadcast();
  const stories = state.overlays.filter(o => o.overlay_type === "story");
  if (!stories.length) return null;

  return (
    <div className="bg-gray-900/70 rounded-xl p-4 shadow-md">
      <h2 className="mb-2">📖 Stories</h2>
      <ul>
        {stories.map(s => (
          <li key={s.event_id}>{s.event_id} — {s.athlete_ids.join(" vs ")}</li>
        ))}
      </ul>
    </div>
  );
}
