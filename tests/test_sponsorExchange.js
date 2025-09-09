/**************************************************
* /tests/test_sponsorExchange.js
**************************************************/
import { createSponsorExchange } from '../engines/sponsorExchange.js';
(async function run(){
console.log('\n=== Testing: Sponsor Exchange TTL ===');
const ex = createSponsorExchange();
const now = Date.parse('2025-09-15T12:00:00Z');
const r1 = ex.resolveCreative('rivalry_high', now);
const r2 = ex.resolveCreative('rivalry_high', now + 1000);
if(!r1 || !r2) throw new Error('No creative resolved inside TTL');
console.log('✅ Creative 1:', r1); console.log('✅ Creative 2:', r2);
})();