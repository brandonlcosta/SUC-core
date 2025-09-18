// File: backend/services/harness.adapter.js
// Minimal Harness Adapter (drop-in). Reads events from JSONL and pushes into ECS.
//
// Public API (named):
//   const h = createHarnessAdapter({ source });
//   await h.start({ world, makeEvent });
//   await h.stop();

import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import readline from "node:readline";

export function createHarnessAdapter(opts = {}) {
  const source = opts.source || path.join("inputs", "events.jsonl");
  let rl, stream, running = false;

  async function start({ world, makeEvent }) {
    await fs.mkdir(path.dirname(source), { recursive: true }).catch(() => {});
    // Ensure file exists
    try {
      await fs.access(source);
    } catch {
      await fs.writeFile(source, "", "utf8");
    }

    stream = createReadStream(source, { encoding: "utf8" });
    rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    running = true;

    rl.on("line", (line) => {
      if (!running) return;
      const s = line.trim();
      if (!s) return;
      try {
        const ev = JSON.parse(s);
        const id = world.addEntity();
        world.addComponent(id, makeEvent(ev));
      } catch (err) {
        console.error("⚠️ Harness line parse failed:", err);
      }
    });
  }

  async function stop() {
    running = false;
    if (rl) rl.close();
    if (stream) stream.close();
  }

  return { start, stop };
}

// Wrapper class for default export
export class HarnessAdapter {
  constructor(opts = {}) {
    this.adapter = createHarnessAdapter(opts);
  }
  async start(ctx) {
    return this.adapter.start(ctx);
  }
  async stop() {
    return this.adapter.stop();
  }
}

// Default singleton instance
const harnessAdapter = new HarnessAdapter();
export default harnessAdapter;
