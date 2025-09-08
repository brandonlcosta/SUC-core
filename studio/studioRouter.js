/**************************************************
 * Studio Router v1.1
 * Purpose: Operator console to toggle broadcast feeds
 * Supports feeds: raw, analyst, meme, sponsor, chaos
 **************************************************/

import BroadcastEngine from "../engines/broadcastEngine.js";

export class StudioRouter {
  constructor(broadcastEngine = new BroadcastEngine()) {
    this.engine = broadcastEngine;
    this.activeFeed = "raw"; // default
    this.validFeeds = ["raw", "analyst", "meme", "sponsor", "chaos"];
  }

  toggleFeed(feedName) {
    if (!this.validFeeds.includes(feedName)) {
      throw new Error(`Invalid feed: ${feedName}. Valid feeds: ${this.validFeeds.join(", ")}`);
    }
    this.activeFeed = feedName;
    console.log(`🎛️ Studio switched to ${feedName.toUpperCase()} feed`);
  }

  getActiveFeed(events) {
    const feeds = this.engine.buildFeeds(events);
    return feeds[this.activeFeed] || [];
  }

  listFeeds() {
    return this.validFeeds;
  }
}

export default StudioRouter;
