import usePollingJson from "../../hooks/usePollingJson";

export default function RaceMap({ url = "/outputs/broadcast/spatial.json" }) {
  const data = usePollingJson(url, 4000);

  if (!data) return <div className="p-4 bg-white rounded-2xl shadow">Loading map...</div>;

  if (!data.athletes || data.athletes.length === 0) {
    return <div className="p-4 bg-white rounded-2xl shadow">No runners on the map.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 h-96 flex items-center justify-center">
      <svg className="w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          className="stroke-yellow-400 fill-none animate-pulse"
          strokeWidth="4"
        />
        {data.athletes.map((ath, i) => {
          const angle = (i / data.athletes.length) * 2 * Math.PI;
          const radius = 150;
          const cx = 200 + Math.cos(angle) * radius;
          const cy = 200 + Math.sin(angle) * radius;
          return (
            <circle
              key={ath.id}
              cx={cx}
              cy={cy}
              r="8"
              className="fill-blue-400 animate-bounce"
            >
              <title>{ath.name}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}