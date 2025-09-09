// ecs/systems/TimingSystem.js
import { System } from "../system.js";

export class TimingSystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const timing = entity.getComponent("TimingComponent");
      if (timing) {
        timing.vibe = (timing.vibe + 1) % 10;
        console.log(`[Timing] ${entity.name} vibe:`, timing.vibe);
      }
    }
  }
}
