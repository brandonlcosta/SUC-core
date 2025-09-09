// tests/harnessOrchestrator.js
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export async function orchestrateHarnesses() {
  const testDir = path.resolve("./tests");
  if (!fs.existsSync(testDir)) return [];

  const files = fs.readdirSync(testDir).filter(f => f.endsWith(".test.js"));
  const results = [];

  for (const file of files) {
    try {
      const fileUrl = pathToFileURL(path.join(testDir, file)).href;
      console.log(`▶ Running ${file}`);
      await import(fileUrl);
      results.push({ file, status: "PASS" });
    } catch (err) {
      console.error(`❌ Failed ${file}:`, err.message);
      results.push({ file, status: "FAIL", error: err.message });
    }
  }

  return results;
}
