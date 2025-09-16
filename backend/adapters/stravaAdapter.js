// /backend/adapters/stravaAdapter.js
// Adapter: fetches activities/events from Strava API

import fetch from "node-fetch";

const STRAVA_TOKEN = process.env.STRAVA_TOKEN;
const STRAVA_API = "https://www.strava.com/api/v3/";

async function fetchActivities() {
  if (!STRAVA_TOKEN) {
    console.error("❌ Missing STRAVA_TOKEN env var");
    return [];
  }

  try {
    const res = await fetch(`${STRAVA_API}athlete/activities?per_page=10`, {
      headers: { Authorization: `Bearer ${STRAVA_TOKEN}` },
    });

    if (!res.ok) throw new Error(`Strava API error ${res.status}`);

    const data = await res.json();
    return data.map((act) => ({
      event_id: `strava-${act.id}`,
      athleteId: act.athlete.id.toString(),
      type: act.type,
      distance: act.distance,
      elapsed_time: act.elapsed_time,
      start_date: act.start_date,
      lat: act.start_latlng?.[0] || null,
      lon: act.start_latlng?.[1] || null,
      timestamp: new Date(act.start_date).getTime(),
    }));
  } catch (err) {
    console.error("❌ Strava fetch failed", err);
    return [];
  }
}

export default { fetch: fetchActivities };