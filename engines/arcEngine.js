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
        priority: event.highlight_priority || 1,
        last_updated: event.timestamp
      };
    }

    this.arcs[arcRef].beats.push(event.base_statement || event.line);
    this.arcs[arcRef].last_updated = event.timestamp;
    this.arcs[arcRef].priority = Math.max(
      this.arcs[arcRef].priority,
      event.highlight_priority || 1
    );

    return this.arcs[arcRef];

// Add inside SignalEngine.processEvent after beatRole assignment:

    // Arc continuity reference
    const arc_ref = event.arc_ref || `${event.athlete_id || "anon"}_${event.event_type}`;

    const signal = {
      event_id: event.event_id,
      vibe_score: Math.round(this.currentVibe),
      beat_role: beatRole,
      sponsor_slot: event.sponsor_slot || null,
      arc_ref,
      timestamp: event.timestamp
    };

  }

  processBatch(events) {
    return events.map(e => this.processEvent(e));
  }

  getAllArcs() {
    return Object.values(this.arcs);
  }
}

export default ArcEngine;
