import RaceMap from "../components/map/RaceMap";
import LeaderboardPanel from "../components/panels/LeaderboardPanel";
import TickerPanel from "../components/panels/TickerPanel";

export default function DemoBroadcast() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-950 min-h-screen">
      <div className="col-span-1">
        <LeaderboardPanel />
      </div>
      <div className="col-span-2 space-y-4">
        <RaceMap />
        <TickerPanel />
      </div>
    </div>
  );
}