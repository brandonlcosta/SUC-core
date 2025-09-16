import usePollingJson from "../hooks/usePollingJson";

export default function SUCDaily({ url = "/outputs/broadcast/daily.json" }) {
  const daily = usePollingJson(url, 5000);

  if (!daily) return <div className="p-4 bg-white rounded-2xl shadow">Loading daily show...</div>;

  return (
    <div className="p-4 space-y-4 bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold text-white">SUC Daily</h1>
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-bold text-lg">{daily.anchor_stat?.title || "Daily Update"}</h2>
        <p>{daily.anchor_stat?.summary || "No summary available yet."}</p>
        <div className="mt-4 text-sm text-gray-600">Weekly trends, previews, tips coming soon...</div>
      </div>
    </div>
  );
}
