/**************************************************
 * Broadcast Engine v1.1
 * Purpose: Orchestrate multi-feed outputs for SUC
 * Inputs: commentary lines, signals, sponsor slots
 * Outputs: structured feeds:
 *   - raw: all lines
 *   - analyst: stats + projections
 *   - meme: wildcard chaos lines
 *   - sponsor: highlights + sponsor slots
 *   - chaos: Shrinking Circle elimination moments
 **************************************************/

import { validateBroadcast } from "../utils/schemaValidator.js";

export class BroadcastEngine {
  constructor(config = {}) {
    this.config = config;
  }

  buildFeeds(events) {
    const feeds = {
      raw: [],
      analyst: [],
      meme: [],
      sponsor: [],
      chaos: []
    };

    for (const ev of events) {
      // --- Raw feed: everything
      feeds.raw.push({ ...ev, feed: "raw" });

      // --- Analyst feed
      if (ev.role === "analyst") {
        feeds.analyst.push({ ...ev, feed: "analyst" });
      }

      // --- Meme feed
      if (ev.role === "wildcard") {
        feeds.meme.push({ ...ev, feed: "meme" });
      }

      // --- Sponsor cut feed
      if ((ev.highlight_priority ?? 0) >= 8 || ev.sponsor_slot) {
        feeds.sponsor.push({ ...ev, feed: "sponsor" });
      }

      // --- Chaos feed: Shrinking Circle eliminations
      if (ev.event_type === "circle_shrink") {
        feeds.chaos.push({ ...ev, feed: "chaos" });
      }
    }

    // Validate each feed item
    for (const key of Object.keys(feeds)) {
      feeds[key] = feeds[key].map(item => {
        if (!validateBroadcast(item)) {
          throw new Error(`Invalid broadcast item: ${JSON.stringify(item)}`);
        }
        return item;
      });
    }

    return feeds;
  }
}

export default BroadcastEngine;
