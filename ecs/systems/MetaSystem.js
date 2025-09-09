// ecs/systems/MetaSystem.js
import { System } from "../system.js";

export class MetaSystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const meta = entity.getComponent("MetaComponent");
      if (meta && meta.engine) {
        meta.addStreak(1);
        console.log(`[Meta] ${entity.name} streak:`, meta.getStreak());
      }
    }
  }
}
