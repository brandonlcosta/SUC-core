import usePollingJson from "../../hooks/usePollingJson";

export default function TickerPanel({ url = "/outputs/broadcast/ticker.json" }) {
  const data = usePollingJson(url, 3000);

  if (!data) return <div className="p-2 bg-white rounded-2xl shadow">Loading ticker...</div>;

  if (!data.lines || data.lines.length === 0) {
    return <div className="p-2 bg-white rounded-2xl shadow">No ticker messages yet.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-2 overflow-hidden">
      <h2 className="text-lg font-bold mb-2">Live Ticker</h2>
      <div className="text-sm text-gray-800 animate-marquee whitespace-nowrap">
        {data.lines.map((line, i) => (
          <span key={i} className="mr-8">{line}</span>
        ))}
      </div>
    </div>
  );
}