// File: backend/engines/arcEngine.js
/**************************************************
 * Arc Engine v1.0
 * Purpose: Build episodic arcs from enriched events
 * Inputs: enriched events (base_statement, context, projection, highlight_priority)
 * Outputs: arc bundles (rivalry, comeback, dominance, underdog)
 **************************************************/

export class ArcEngine {
  constructor() {
    this.arcs = {}; // key: arc_ref, value: arc bundle
  }

  _getArcRef(event) {
    if (event.metadata?.rival) {
      return `rivalry_${event.metadata.athlete}_${event.metadata.rival}`;
    }
    if (event.metadata?.comeback) return `comeback_${event.athlete_id}`;
    if (event.metadata?.dominance) return `dominance_${event.athlete_id}`;
    if (event.metadata?.underdog) return `underdog_${event.athlete_id}`;
    return `misc_${event.event_id}`;
  }

  processEvent(event) {
    const arcRef = this._getArcRef(event);

    if (!this.arcs[arcRef]) {
      this.arcs[arcRef] = {
        arc_ref: arcRef,
        arc_type: event.metadata?.arc_type || "misc",
        title: event.metadata?.title || `Arc: ${arcRef}`,
        beats: [],
        projection: event.projection || null,
        priority: event.highlight_priority || 0,
      };
    }

    this.arcs[arcRef].beats.push({
      statement: event.base_statement,
      context: event.context || {},
      timestamp: event.timestamp,
    });

    // Update projection if higher priority
    if (
      event.projection &&
      (!this.arcs[arcRef].projection ||
        event.highlight_priority > this.arcs[arcRef].priority)
    ) {
      this.arcs[arcRef].projection = event.projection;
      this.arcs[arcRef].priority = event.highlight_priority;
    }
  }

  getArcs() {
    return Object.values(this.arcs);
  }
}

// ✅ Default export: singleton instance
const arcEngine = new ArcEngine();
export default arcEngine;
