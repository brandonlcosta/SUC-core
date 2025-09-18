import { spawn } from "node:child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const exists = (p) => fs.existsSync(path.resolve(repoRoot, p));
const pick = (arr) => arr.find(exists);

const bin = process.platform === "win32" ? "node.exe" : "node";
const tick = pick(["backend/scripts/runTickRuntime.mjs", "scripts/runTickRuntime.mjs"]);
const http = pick(["backend/server/server.js", "server/server.js", "server.js"]);
const ws   = pick(["backend/server/demoServer.js", "server/demoServer.js", "demoServer.js"]);

if (!tick) { console.error("❌ Missing runTickRuntime.mjs"); process.exit(1); }
if (!http) { console.error("❌ Missing static server"); process.exit(1); }
if (!ws)   { console.error("❌ Missing WS server"); process.exit(1); }

console.log("▶ Using:");
console.log("   tick:", path.relative(repoRoot, tick));
console.log("   http:", path.relative(repoRoot, http));
console.log("   ws:  ", path.relative(repoRoot, ws));

function run(name, file) {
  const p = spawn(bin, [file], { cwd: repoRoot, shell: true, stdio: "inherit" });
  p.on("exit", (code) => console.log(`[${name}] exited ${code}`));
  return p;
}

const procs = [ run("tick", tick), run("static", http), run("ws", ws) ];
function bye(){ for (const p of procs) try { p.kill(); } catch{} process.exit(0); }
process.on("SIGINT", bye); process.on("SIGTERM", bye);
