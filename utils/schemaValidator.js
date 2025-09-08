/**************************************************
 * Schema Validator (Stub v2)
 * Purpose: Provide placeholder validation until
 * full JSON schema validation is wired in
 **************************************************/

// Used by signalEngine.js
export function validateSignal(signal) {
  // For now, always true
  return true;
}

// Used by broadcastEngine.js
export function validateBroadcast(item) {
  // For now, always true
  return true;
}

// Future extension: modeEngine / commentaryEngine schemas
export function validateEvent(event) {
  // For now, always true
  return true;
}

export default { validateSignal, validateBroadcast, validateEvent };
