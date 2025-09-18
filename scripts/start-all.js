// File: scripts/start-all.js

import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

// Utility: kill processes on port
function killPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`).toString();
    result.split("\n").forEach((line) => {
      if (!line.trim()) return;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") {
        console.log(`Killing PID ${pid} on port ${port}`);
        execSync(`taskkill /PID ${pid} /F`);
      }
    });
  } catch {
    // no process found, ignore
  }
}

// Step 1: kill stale backend/frontend processes
killPort(3201);
killPort(5173);

// Step 2: start backend server
console.log("Starting backend demo server...");
const backend = spawn("node", ["backend/server/demoServer.js"], {
  stdio: "inherit",
  shell: true,
});

// Step 3: start demo feed emitter
console.log("Starting demo feed emitter...");
const emitter = spawn("node", ["backend/tests/demoBackyardUltra.js"], {
  stdio: "inherit",
  shell: true,
});

// Step 4: wait for feeds.json
setTimeout(() => {
  const feedsPath = path.resolve("backend/outputs/broadcast/feeds.json");
  if (!fs.existsSync(feedsPath)) {
    console.error("⚠️ feeds.json not found. Backend may have failed.");
    return;
  }

  const feeds = JSON.parse(fs.readFileSync(feedsPath, "utf-8"));
  console.log("✅ Feeds loaded:", feeds);

  // Step 5: start frontend dev server
  console.log("Starting frontend dev server...");
  const frontend = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      VITE_FEEDS: JSON.stringify(feeds), // bootstrap feeds into frontend
    },
  });

  // Cleanup on exit
  process.on("exit", () => {
    backend.kill();
    emitter.kill();
    frontend.kill();
  });
}, 2000);
