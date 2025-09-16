import usePollingJson from "../../hooks/usePollingJson";

export default function LeaderboardPanel({ url = "/outputs/broadcast/leaderboard.json" }) {
  const data = usePollingJson(url, 3000);

  if (!data) return <div className="p-4 bg-white rounded-2xl shadow">Loading leaderboard...</div>;

  if (!data.leaderboard || data.leaderboard.length === 0) {
    return <div className="p-4 bg-white rounded-2xl shadow">No leaderboard data yet.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-bold mb-2">Leaderboard</h2>
      <ol className="text-sm text-gray-800 space-y-1">
        {data.leaderboard.map((runner, i) => (
          <li key={runner.id} className="flex justify-between">
            <span>{i + 1}. {runner.name}</span>
            <span className="font-mono">{runner.laps} laps</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
