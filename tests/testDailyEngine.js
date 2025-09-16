// /tests/testDailyEngine.js
import { saveDaily } from "../backend/engines/dailyEngine.js";

const filePath = saveDaily({});
console.log("✅ SUC Daily JSON generated at:", filePath);
