// services/harness.adapter.js
// Minimal Harness Adapter (drop-in). Reads events from JSONL and pushes into ECS.
// Public API:
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
    // If file doesn’t exist yet, create empty
    try { await fs.access(source); } catch { await fs.writeFile(source, "", "utf8"); }

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
      } catch (e) {
        console.error("[harness.adapter] bad line:", e.message);
      }
    });

    await new Promise((resolve) => rl.once("close", resolve)); // resolve when stream ends
  }

  async function stop() {
    running = false;
    if (rl) rl.close();
    if (stream) stream.close?.();
  }

  return { start, stop, source };
}
