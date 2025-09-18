// File: backend/engines/storyEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/storyConfig.json");

let storyConfig = { arc_limit: 3 };
if (fs.existsSync(configPath)) {
  storyConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runStoryEngine(events, state, ctx) {
  const arcs = (ctx.meta?.rivalries || []).map(r => ({
    type: "rivalry_arc",
    athlete_ids: r.athlete_ids,
    priority: r.priority
  }));

  const story = { arcs: arcs.slice(0, storyConfig.arc_limit) };

  schemaGate.validate("story", story);

  ledgerService.event({
    engine: "story",
    type: "summary",
    payload: { arcs: story.arcs.length }
  });

  ctx.story = story;
  return story;
}

export class StoryEngine {
  run(events, state, ctx) {
    return runStoryEngine(events, state, ctx);
  }
}

const storyEngine = new StoryEngine();
export default storyEngine;
