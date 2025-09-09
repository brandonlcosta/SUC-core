/**************************************************
* /tests/test_operatorConsole.js
**************************************************/
import { createOperatorConsole } from './engines/operatorConsole.js';
(async function run(){
console.log('\n=== Testing: Operator Console ===');
const ops = createOperatorConsole({ replayWindow:3 });
for(let i=1;i<=5;i++) ops.recordEvent({ id:'e'+i });
ops.enqueue('skip');
ops.enqueue('advance');
ops.enqueue('replay', { reason:'highlight_miss' });
console.log('✅ Enqueued 3 ops; check outputs/logs/metrics.jsonl');
})();