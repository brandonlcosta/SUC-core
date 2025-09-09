// ecs/systems/ContextSystem.js
import { System } from "../system.js";

export class ContextSystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const context = entity.getComponent("ContextComponent");
      if (context) {
        context.state = context.state || {};
        context.state.tickCount = (context.state.tickCount || 0) + 1;
        console.log(`[Context] ${entity.name} tickCount:`, context.state.tickCount);
      }
    }
  }
}
