// engines/studioRouter.js
export class StudioRouter {
  constructor(config = {}) {
    this.feeds = {};
    this.config = config;
  }

  registerFeed(name, feedConfig) {
    this.feeds[name] = feedConfig;
  }

  getFeed(name) {
    return this.feeds[name] || null;
  }
}
