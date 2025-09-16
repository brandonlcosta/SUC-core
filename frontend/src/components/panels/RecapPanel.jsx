import usePollingJson from "../../hooks/usePollingJson";

export default function RecapPanel({ url = "/outputs/broadcast/recap.json" }) {
  const recap = usePollingJson(url, 5000);

  if (!recap) return <div className="p-4 bg-white rounded-2xl shadow">Loading recap...</div>;

  if (!recap.summary) {
    return <div className="p-4 bg-white rounded-2xl shadow">No recap yet...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-bold mb-2">Race Recap</h2>
      <p className="text-sm text-gray-700">{recap.summary}</p>
    </div>
  );
}