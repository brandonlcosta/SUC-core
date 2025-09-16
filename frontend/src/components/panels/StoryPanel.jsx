import usePollingJson from "../../hooks/usePollingJson";

export default function StoryPanel({ url = "/outputs/broadcast/stories.json" }) {
  const stories = usePollingJson(url, 5000);

  if (!stories) return <div className="p-4 bg-white rounded-2xl shadow">Loading stories...</div>;

  if (!Array.isArray(stories) || stories.length === 0) {
    return <div className="p-4 bg-white rounded-2xl shadow">No stories yet...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-bold mb-2">Stories</h2>
      <ul className="text-sm text-gray-700 space-y-2">
        {stories.map((s, i) => (
          <li key={i}>
            <div className="font-semibold">{s.title}</div>
            <div>{s.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
