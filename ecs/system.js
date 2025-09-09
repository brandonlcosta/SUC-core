// ecs/system.js
export class System {
  constructor() {
    this.enabled = true;
  }

  update(world, deltaTime) {
    // Override in subclasses
  }
}

// Sample system: LoggerSystem
export class LoggerSystem extends System {
  update(world) {
    for (const entity of world.entities) {
      const logger = entity.getComponent(LoggerComponent);
      if (logger) {
        logger.log("LoggerSystem tick");
      }
    }
  }
}

// Import needed for component reference
import { LoggerComponent } from "./component.js";
