/**************************************************
* /tests/test_priorityTierSystem.js
**************************************************/
import { createPriorityTierSystem } from '../engines/priorityTierSystem.js';
(async function run(){
console.log('\n=== Testing: Priority Tiers ===');
const sys = createPriorityTierSystem();
const out = sys.feed([{ highlight_priority:9 },{ highlight_priority:5 },{ highlight_priority:2 }]);
console.log('✅', out.map(x=>x.priority_tier));
})();