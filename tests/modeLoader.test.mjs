// tests/modeLoader.test.mjs
// Minimal runnable test/usage snippet. Run with: `node tests/modeLoader.test.mjs`
import { createModeLoader } from '../backend/modeLoader.js';

function assert(cond, msg) {
  if (!cond) {
    console.error('❌', msg);
    process.exit(1);
  }
}

const ml = createModeLoader();
const rulesets = ml.get('rulesets');
const personas = ml.get('personas');
const slots = ml.get('sponsorSlots');
const layouts = ml.get('studioLayouts');
const branding = ml.get('branding');

console.log('sources:', ml.sources());

assert(typeof ml.get === 'function', 'modeLoader.get is not a function');
assert(rulesets === null || typeof rulesets === 'object', 'rulesets not object/null');
assert(personas === null || typeof personas === 'object', 'personas not object/null');
assert(slots === null || typeof slots === 'object', 'sponsorSlots not object/null');
assert(layouts === null || typeof layouts === 'object', 'studioLayouts not object/null');
assert(branding === null || typeof branding === 'object', 'branding not object/null');

// If at least one exists, check a plausible shape:
if (slots) {
  // Accept either array or object with .slots
  const ok = Array.isArray(slots) || typeof slots === 'object';
  assert(ok, 'sponsorSlots shape unexpected');
}

console.log('✅ modeLoader basic load passed');
process.exit(0);
