// ecs/systems/VibeSystem.js
import { System } from "../system.js";

export class VibeSystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const vibe = entity.getComponent("VibeComponent");
      if (vibe) {
        vibe.vibe = Math.min(10, vibe.vibe + 1);
        console.log(`[Vibe] ${entity.name} vibe:`, vibe.vibe, "role:", vibe.role);
      }
    }
  }
}
