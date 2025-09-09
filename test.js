// test.js
import { World } from "./ecs/world.js";
import { Entity } from "./ecs/entity.js";
import { LoggerComponent } from "./ecs/component.js";
import { LoggerSystem } from "./ecs/system.js";

const world = new World();
const player = new Entity("Player1").addComponent(new LoggerComponent());
world.addEntity(player);
world.addSystem(new LoggerSystem());

world.run(3); // Will log 3 ticks
