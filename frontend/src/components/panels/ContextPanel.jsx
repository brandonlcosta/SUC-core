import usePollingJson from "../../hooks/usePollingJson";

export default function ContextPanel({ url = "/outputs/broadcast/meta.json" }) {
  const meta = usePollingJson(url, 5000);

  if (!meta) return <div className="p-4 bg-white rounded-2xl shadow">Loading context...</div>;

  const { streaks = [], rivalries = [], projections = [] } = meta;

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-2">
      <h2 className="text-lg font-bold mb-2">Context</h2>

      <div>
        <h3 className="font-semibold text-sm">🔥 Streaks</h3>
        {streaks.length ? (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {streaks.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No streaks yet</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm">⚔️ Rivalries</h3>
        {rivalries.length ? (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {rivalries.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No rivalries yet</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm">📊 Projections</h3>
        {projections.length ? (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {projections.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No projections yet</p>
        )}
      </div>
    </div>
  );
}
