// /backend/adapters/raceScraperAdapter.js
// Adapter: fetches race results/events from a race results API or scraper

import fetch from "node-fetch";

const RACE_API = process.env.RACE_API || "https://api.raceresults.com/events";

async function fetchRaceEvents() {
  try {
    const res = await fetch(RACE_API);
    if (!res.ok) throw new Error(`Race API error ${res.status}`);

    const data = await res.json();
    return data.map((evt) => ({
      event_id: `race-${evt.id}`,
      athleteId: evt.athlete_id.toString(),
      type: evt.event_type || "race",
      distance: evt.distance,
      elapsed_time: evt.elapsed_time,
      start_date: evt.start_time,
      lat: evt.lat || null,
      lon: evt.lon || null,
      timestamp: new Date(evt.start_time).getTime(),
    }));
  } catch (err) {
    console.error("❌ RaceScraper fetch failed", err);
    return [];
  }
}

export default { fetch: fetchRaceEvents };