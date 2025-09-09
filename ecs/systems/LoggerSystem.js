// ecs/systems/LoggerSystem.js
import { System } from "../system.js";

export class LoggerSystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const logger = entity.getComponent("LoggerComponent");
      if (logger && logger.engine) {
        logger.engine.log(`Tick: ${entity.name}`);
      }
    }
  }
}
