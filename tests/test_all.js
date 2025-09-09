/**************************************************
 * tests/test_all.js — runs all C1 packet tests
 **************************************************/
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const TEST_DIR = path.resolve('./tests');
const files = fs.readdirSync(TEST_DIR)
  .filter(f => /^test_(recognitionGraph|operatorConsole|sponsorExchange|priorityTierSystem)\.js$/.test(f));

let pass = 0, fail = 0;
const runNext = () => {
  const f = files.shift();
  if (!f) {
    console.log(`\n=== Summary: ${pass} passed, ${fail} failed ===`);
    process.exit(fail ? 1 : 0);
  }
  console.log(`\n▶ Running ${f}`);
  const child = spawn(process.execPath, [path.join(TEST_DIR, f)], { stdio: 'inherit' });
  child.on('exit', (code) => { code === 0 ? pass++ : fail++; runNext(); });
};
runNext();
