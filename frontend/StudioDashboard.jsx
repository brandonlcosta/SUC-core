// frontend/StudioDashboard.jsx
// Pass HUD sponsor meta down to StudioTicker for TTL-aware bug visibility.
import StudioTicker from './StudioTicker.jsx';
import LeaderboardPanel from './LeaderboardPanel.jsx';
import HighlightPlayer from './HighlightPlayer.jsx';
import StoryPanel from './StoryPanel.jsx';
import MetricsBar from './MetricsBar.jsx';

export default function StudioDashboard({ hud, ticker, recap, arcs, metrics }) {
  return (
    <div className="min-h-screen w-full p-4 bg-[radial-gradient(circle_at_20%_20%,#052,#000)] text-white font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-3">
          <div className="text-3xl font-extrabold tracking-tight">
            <span className="text-emerald-300">SUC</span> Broadcast Studio
          </div>
          <MetricsBar metrics={metrics} />
        </div>
        <div className="col-span-1">
          <LeaderboardPanel leaderboard={hud?.leaderboard ?? []} />
        </div>
        <div className="col-span-1">
          <StudioTicker feed={ticker ?? []} sponsorMeta={hud?.sponsor?.meta} />
        </div>
        <div className="col-span-1">
          <HighlightPlayer manifest={recap ?? { clips: [] }} />
        </div>
        <div className="col-span-1">
          <StoryPanel arcs={arcs ?? []} />
        </div>
      </div>
    </div>
  );
}
