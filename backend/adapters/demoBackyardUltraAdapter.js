// backend/adapters/demoBackyardUltraAdapter.js
const ATHLETES = [
  { id: "ath1", name: "Emily" },
  { id: "ath2", name: "James" },
  { id: "ath3", name: "Sophia" },
  { id: "ath4", name: "Liam" }
];

let lapCounts = Object.fromEntries(ATHLETES.map(a => [a.id, 0]));
let active = new Set(ATHLETES.map(a => a.id));

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatLapTime(minutes) {
  const m = Math.floor(minutes);
  const s = rand(0, 59);
  return `${pad(m)}:${pad(s)}`;
}

export function generateDemoEvents(tick) {
  const events = [];

  for (let athlete of ATHLETES) {
    if (!active.has(athlete.id)) continue;

    const lapTime = rand(45, 58); // keep under timeout for first laps
    lapCounts[athlete.id]++;

    // ✅ No DNFs allowed in first 3 laps
    if (lapCounts[athlete.id] > 3) {
      // Timeout rule
      if (lapTime > 60) {
        active.delete(athlete.id);
        events.push({
          type: "dnf",
          athleteId: athlete.id,
          athleteName: athlete.name,
          lap: lapCounts[athlete.id],
          reason: "timeout",
          ts: Date.now()
        });
        continue;
      }

      // Random voluntary DNF (low chance)
      if (Math.random() < 0.05) {
        active.delete(athlete.id);
        events.push({
          type: "dnf",
          athleteId: athlete.id,
          athleteName: athlete.name,
          lap: lapCounts[athlete.id],
          reason: "voluntary",
          ts: Date.now()
        });
        continue;
      }
    }

    // Normal lap complete
    events.push({
      type: "lap_complete",
      athleteId: athlete.id,
      athleteName: athlete.name,
      lap: lapCounts[athlete.id],
      lapTime,
      lapTimeFormatted: formatLapTime(lapTime),
      rivalry: Math.random() < 0.2,
      ts: Date.now()
    });
  }

  return events;
}
