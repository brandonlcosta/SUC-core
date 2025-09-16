// /tests/utils/randomRaceGenerator.js
// Generates schema-compliant synthetic Turf Wars events

/**
 * Generate synthetic Turf Wars events
 * @param {number} numAthletes - number of athletes
 * @param {number} numTicks - number of race ticks
 * @returns {Array<Object>} events
 */
export function generateTurfWarsEvents(numAthletes = 10, numTicks = 100) {
  const athletes = Array.from({ length: numAthletes }, (_, i) => `athlete_${i + 1}`);
  const events = [];

  for (let t = 0; t < numTicks; t++) {
    const laps = [];
    const dnfs = [];
    const rivalries = [];

    // Random lap completions
    athletes.forEach((id) => {
      if (Math.random() < 0.7) {
        laps.push({ athleteId: id, lapTime: 300 + Math.random() * 100 });
      }
    });

    // Random DNFs
    if (Math.random() < 0.05) {
      const dnfAthlete = athletes[Math.floor(Math.random() * athletes.length)];
      dnfs.push({ athleteId: dnfAthlete, timestamp: Date.now() });
    }

    // Random rivalries
    if (Math.random() < 0.1) {
      const a1 = athletes[Math.floor(Math.random() * athletes.length)];
      const a2 = athletes[Math.floor(Math.random() * athletes.length)];
      if (a1 !== a2) {
        rivalries.push({ athletes: [a1, a2], timestamp: Date.now() });
      }
    }

    // Random streak/comeback metadata
    const streak = Math.random() < 0.05 ? { athleteId: athletes[Math.floor(Math.random() * athletes.length)], count: 3 } : null;
    const comeback = Math.random() < 0.05 ? { athleteId: athletes[Math.floor(Math.random() * athletes.length)], deficit: 2 } : null;

    // ✅ Schema-compliant event structure
    events.push({
      id: `evt_${t}`,
      ts: Date.now(),
      payload: {
        feed: "turfWars",
        event_id: `evt_${t}`,
        athleteId: athletes[t % athletes.length], // ensure always present
        type: "synthetic", // ensure always present
        laps,
        dnfs,
        rivalries,
        ...(streak ? { streak } : {}),
        ...(comeback ? { comeback } : {}),
        distance: 400 * (t + 1),
        elapsed_time: t * 60,
        lat: 40.0 + Math.random() * 0.01,
        lon: -70.0 + Math.random() * 0.01,
        alt: 10 + Math.random() * 5
      }
    });
  }

  return events;
}

// Debug runner (optional, run with: node tests/utils/randomRaceGenerator.js)
if (import.meta.url === `file://${process.argv[1]}`) {
  const events = generateTurfWarsEvents(3, 5);
  console.log(JSON.stringify(events, null, 2));
}
