/**************************************************
* coreEcs.js — Minimal ECS runtime (≤150 LOC)
**************************************************/
export function createWorld() {
return {
entities: new Map(),
systems: [],
nextId: 1,
metrics: [],
addEntity(components = {}) {
const id = this.nextId++;
this.entities.set(id, { id, ...components });
return id;
},
get(q) { const keys = Array.isArray(q) ? q : [q]; const out = []; for (const e of this.entities.values()) { if (keys.every(k => Object.prototype.hasOwnProperty.call(e, k))) out.push(e);} return out; },
use(system) { this.systems.push(system); return this; },
tick(ctx = {}) { for (const s of this.systems) s(this, ctx); return this; },
logMetric(m) { this.metrics.push({ t: Date.now(), ...m }); }
};
}
export function replaceComponent(entity, key, next) { entity[key] = { ...(entity[key] || {}), ...next }; }
export function removeEntity(world, id) { world.entities.delete(id); }