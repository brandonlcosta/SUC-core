// services/ingestService.js
// Hype OS: Gatekeeper validates events → writes to HypeGraph; exposes SLOs.
// Uses Ajv 2020 for draft/2020-12 schemas and JSONC-tolerant loader.

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";
import { HypeGraph } from "../graph/hypeGraph.js";

function readFile(p) {
  return fs.readFileSync(path.resolve(p), "utf8");
}
function parseJSONC(text) {
  let s = text.replace(/^\uFEFF/, "");
  s = s.replace(/^\s*\/\/.*$/gm, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(s);
}
function readJson(p) {
  return parseJSONC(readFile(p));
}

export class IngestService {
  constructor({
    schemaPath = "schemas/event.schema.json",
    rulesetPath = "configs/rulesets.json",
    graph = new HypeGraph(),
  } = {}) {
    this.graph = graph;

    try {
      this.ruleset = readJson(rulesetPath);
    } catch {
      this.ruleset = { defaultMode: "basic", modes: { basic: {} } };
    }

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    this.validateEvent = ajv.compile(readJson(schemaPath));

    this.metrics = {
      counts: { accepted: 0, rejected: 0 },
      errors: [],
      latenciesMs: [],
      startedAt: Date.now(),
      brand: "Hype OS",
    };
  }

  async ingest(adapter) {
    const t0 = Date.now();
    const events = await adapter.fetchEvents();
    for (const ev of events) {
      const ok = this.validateEvent(ev);
      if (!ok) {
        this.metrics.counts.rejected++;
        this.metrics.errors.push({ id: ev?.id ?? null, errors: this.validateEvent.errors });
        continue;
      }
      this.graph.writeEvent(ev);
      this.metrics.counts.accepted++;
    }
    const dt = Date.now() - t0;
    this.metrics.latenciesMs.push(dt);
    return { ingested: this.metrics.counts.accepted, latencyMs: dt };
  }

  slo() {
    const { accepted, rejected } = this.metrics.counts;
    const total = accepted + rejected || 1;
    const p95 = this.#p95(this.metrics.latenciesMs);
    return {
      brand: this.metrics.brand,
      schemaErrorRate: rejected / total,
      latencyP95Ms: p95,
      totals: { accepted, rejected },
      startedAt: this.metrics.startedAt,
    };
  }

  #p95(arr) {
    if (!arr.length) return 0;
    const a = [...arr].sort((x, y) => x - y);
    const idx = Math.ceil(0.95 * a.length) - 1;
    return a[Math.max(0, idx)];
  }
}

export default IngestService;
