// File: backend/services/ledger.js
// Compatibility shim so existing imports keep working.
// (Your engines can continue: `import { ledgerTick } from "../services/ledger.js"`)
export {
  initLedger,
  ledgerEvent,
  ledgerTick,
  ledgerOperatorAction,
  lastNTicks,
  closeLedger
} from "./ledger/index.js";
