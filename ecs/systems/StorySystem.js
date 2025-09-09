// ecs/systems/StorySystem.js
import { System } from "../system.js";

export class StorySystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const story = entity.getComponent("StoryComponent");
      if (story && story.engine) {
        const nextArc = story.engine.nextArc();
        if (nextArc) {
          console.log(`[Story] ${entity.name} advances to arc:`, nextArc.name);
        }
      }
    }
  }
}
