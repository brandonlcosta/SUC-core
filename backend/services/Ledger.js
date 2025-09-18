// File: backend/services/Ledger.js
// Compatibility shim so existing imports keep working.
// Provides both named exports and a default singleton instance.

import {
  initLedger,
  ledgerEvent,
  ledgerTick,
  ledgerOperatorAction,
  lastNTicks,
  closeLedger,
} from "./ledger/index.js";

export {
  initLedger,
  ledgerEvent,
  ledgerTick,
  ledgerOperatorAction,
  lastNTicks,
  closeLedger,
};

// Wrapper class for default export
export class LedgerService {
  init(...args) {
    return initLedger(...args);
  }
  event(...args) {
    return ledgerEvent(...args);
  }
  tick(...args) {
    return ledgerTick(...args);
  }
  operatorAction(...args) {
    return ledgerOperatorAction(...args);
  }
  lastTicks(...args) {
    return lastNTicks(...args);
  }
  close(...args) {
    return closeLedger(...args);
  }
}

// Default singleton instance
const ledgerService = new LedgerService();
export default ledgerService;
