import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

async function runAll() {
  const testsDir = path.resolve("tests");
  const logDir = path.resolve("outputs/logs");
  const logFile = path.join(logDir, "greenboard.json");

  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const files = fs.readdirSync(testsDir).filter(f => f.endsWith(".test.js"));
  let passed = 0, failed = 0;

  for (const file of files) {
    const absPath = path.join(testsDir, file);
    const fileUrl = pathToFileURL(absPath).href;

    try {
      await import(fileUrl);
      console.log(`✅ ${file}`);
      passed++;
    } catch (err) {
      console.error(`❌ ${file}`, err.message);
      failed++;
    }
  }

  const result = {
    timestamp: new Date().toISOString(),
    total: files.length,
    passed,
    failed,
    integrity: failed === 0
  };

  fs.writeFileSync(logFile, JSON.stringify(result, null, 2));
  console.log("Integrity report written:", logFile);

  if (failed > 0) process.exit(1);
}

runAll();
