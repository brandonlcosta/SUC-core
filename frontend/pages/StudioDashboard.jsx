import RecapPanel from "../components/RecapPanel";

// Inside your layout grid:
<div className="grid grid-cols-2 gap-4">
  <LeaderboardPanel leaderboard={broadcast.leaderboard} />
  <RecapPanel recap={broadcast.recap} />
</div>
