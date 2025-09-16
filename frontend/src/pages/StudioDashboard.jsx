import RaceMap from "../components/map/RaceMap";
import LeaderboardPanel from "../components/panels/LeaderboardPanel";
import TickerPanel from "../components/panels/TickerPanel";
import HighlightPlayer from "../components/panels/HighlightPlayer";
import StoryPanel from "../components/panels/StoryPanel";
import ContextPanel from "../components/panels/ContextPanel";
import RecapPanel from "../components/panels/RecapPanel";

export default function StudioDashboard() {
  return (
    <div className="studio-dashboard grid grid-cols-4 gap-4 p-4 bg-gray-950 min-h-screen">
      <div className="col-span-2 row-span-2">
        <RaceMap />
      </div>
      <div className="col-span-1 space-y-4">
        <LeaderboardPanel />
        <ContextPanel />
      </div>
      <div className="col-span-1 space-y-4">
        <StoryPanel />
        <RecapPanel />
      </div>
      <div className="col-span-4">
        <HighlightPlayer />
      </div>
      <div className="col-span-4">
        <TickerPanel />
      </div>
    </div>
  );
}
