// /tests/testRecapEngine.js
import { generateRecap } from "../backend/engines/recapEngine.js";

const mockTicks = [
  { laps: [{ athleteId: "ath1" }, { athleteId: "ath2" }] },
  { laps: [{ athleteId: "ath1" }, { athleteId: "ath3" }], dnfs: [{ athleteId: "ath2", name: "Liam" }] },
  { laps: [{ athleteId: "ath3" }], rivalries: [{ a: "ath1", b: "ath3", label: "Emily vs James" }] },
  { laps: [{ athleteId: "ath1" }], dnfs: [{ athleteId: "ath3", name: "Sophia" }] },
];

const recap = generateRecap(mockTicks);

console.log("Generated Recap:");
console.log(JSON.stringify(recap, null, 2));
