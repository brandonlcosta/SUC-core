// ecs/systems/BroadcastSystem.js
import { System } from "../system.js";

export class BroadcastSystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const broadcast = entity.getComponent("BroadcastComponent");
      if (broadcast && broadcast.engine) {
        broadcast.engine.assemble(`Broadcast tick for ${entity.name}`);
        console.log(`[Broadcast] Bundle:`, broadcast.engine.getBundle());
      }
    }
  }
}
