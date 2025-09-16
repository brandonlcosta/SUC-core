// Studio Router v1.1 — central registry for feeds

import { appendMetric } from './_metrics.js';

export class StudioRouter {
  constructor(config = {}) {
    this.feeds = {};
    this.config = config;
  }

  registerFeed(name, feedConfig) {
    const t0 = Date.now();
    this.feeds[name] = feedConfig;
    appendMetric('studioRouter.register', Date.now() - t0);
  }

  getFeed(name) {
    const t0 = Date.now();
    const res = this.feeds[name] || null;
    appendMetric('studioRouter.get', Date.now() - t0);
    return res;
  }
}

export default StudioRouter;
