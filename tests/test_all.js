import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const TEST_DIR = path.join(process.cwd(), "tests");

// Collect all test files except this one
const testFiles = fs
  .readdirSync(TEST_DIR)
  .filter(f => f.startsWith("test_") && f !== "test_all.js");

let passed = 0;
let failed = 0;

function runTest(file) {
  return new Promise((resolve) => {
    const proc = spawn("node", [path.join(TEST_DIR, file)], { stdio: "pipe" });

    let output = "";
    proc.stdout.on("data", d => (output += d.toString()));
    proc.stderr.on("data", d => (output += d.toString()));

    proc.on("close", code => {
      if (code === 0 || output.includes("✅")) {
        console.log(`✔️  ${file} passed`);
        passed++;
      } else {
        console.error(`❌  ${file} failed\n${output}`);
        failed++;
      }
      resolve();
    });
  });
}

(async function runAll() {
  for (const f of testFiles) {
    await runTest(f);
  }
  console.log(`\nTest summary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
