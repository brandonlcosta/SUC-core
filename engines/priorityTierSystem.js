/**************************************************
* /engines/priorityTierSystem.js — map numeric → tiers (≤120 LOC)
**************************************************/
import { createWorld, replaceComponent } from '../ecs/coreEcs.js';
export function createPriorityTierSystem(){
const world = createWorld();
world.addEntity({ buffer:{ items:[] } });
world.use((w)=>{ const [buf] = w.get(['buffer']); if(!buf) return; buf.buffer.items = buf.buffer.items.map(e => ({ ...e, priority_tier: tier(e.highlight_priority) })); });
function feed(events){ const [buf] = world.get(['buffer']); replaceComponent(buf,'buffer',{ items:events }); world.tick(); return world.get(['buffer'])[0].buffer.items; }
return { feed };
}
function tier(n){ if(n>=8) return 'high'; if(n>=4) return 'med'; return 'low'; }