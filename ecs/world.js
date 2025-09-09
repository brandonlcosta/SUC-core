// ecs/world.js
/**************************************************
 * Minimal ECS World (ESM, ≤120 LOC)
 * Entities: Map(id -> Map(type -> component))
 * Systems:  { name?, update(world, dt) }
 **************************************************/
export function createWorld() {
  const entities = new Map();
  const systems = [];
  let nextId = 1;

  function addEntity(preset = {}) {
    const id = `e${nextId++}`;
    entities.set(id, new Map());
    for (const comp of Object.values(preset)) addComponent(id, comp);
    return id;
  }

  function addComponent(id, comp) {
    if (!comp || !comp.type) throw new Error("Component must have a 'type'");
    const cmap = entities.get(id);
    if (!cmap) throw new Error(`Unknown entity ${id}`);
    cmap.set(comp.type, comp);
    return comp;
  }

  function getComponent(id, type) {
    return entities.get(id)?.get(type);
  }

  function query(requiredTypes = []) {
    const out = [];
    for (const [id, cmap] of entities) {
      let ok = true;
      for (const t of requiredTypes) {
        if (!cmap.has(t)) { ok = false; break; }
      }
      if (ok) out.push({ id, components: cmap });
    }
    return out;
  }

  function registerSystem(system) {
    if (!system || typeof system.update !== "function") {
      throw new Error("System.update(world, dt) is required");
    }
    systems.push(system);
  }

  async function tick(dt = 0) {
    for (const sys of systems) {
      // allow either sync or async update
      const ret = sys.update(api, dt);
      if (ret && typeof ret.then === "function") await ret;
    }
  }

  const api = {
    addEntity,
    addComponent,
    getComponent,
    query,
    registerSystem,
    tick,
    entities,
    systems,
  };
  return api;
}

// typed component helper
export function c(type, data = {}) {
  return { type, ...data };
}
