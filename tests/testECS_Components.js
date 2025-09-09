// tests/testECS_Components.js

// -----------------------------
// ECS Core
// -----------------------------
import { World } from "../ecs/world.js";
import { Entity } from "../ecs/entity.js";

// -----------------------------
// ECS Components (barrel import)
// -----------------------------
import {
  LoggerComponent,
  StoryComponent,
  MetaComponent,
  BroadcastComponent,
  TimingComponent,
  VibeComponent,
  ContextComponent
} from "../ecs/components/index.js";

// -----------------------------
// ECS Systems (barrel import)
// -----------------------------
import {
  LoggerSystem,
  StorySystem,
  BroadcastSystem,
  MetaSystem,
  TimingSystem,
  VibeSystem,
  ContextSystem
} from "../ecs/systems/index.js";

// -----------------------------
// Create world
// -----------------------------
const world = new World();

// -----------------------------
// Create entity and attach components
// -----------------------------
const player = new Entity("Player1")
  .addComponent(new LoggerComponent())
  .addComponent(new StoryComponent({ arcs: [{ name: "Intro" }, { name: "Conflict" }] }))
  .addComponent(new MetaComponent())
  .addComponent(new BroadcastComponent())
  .addComponent(new TimingComponent())
  .addComponent(new VibeComponent("chaos"))
  .addComponent(new ContextComponent({ session: 1 }));

world.addEntity(player);

// -----------------------------
// Add systems
// -----------------------------
world
  .addSystem(new LoggerSystem())
  .addSystem(new StorySystem())
  .addSystem(new BroadcastSystem())
  .addSystem(new MetaSystem())
  .addSystem(new TimingSystem())
  .addSystem(new VibeSystem())
  .addSystem(new ContextSystem());

// -----------------------------
// Run simulation for 3 ticks
// -----------------------------
console.log("=== Running ECS + Components Test ===");
world.run(3);

// -----------------------------
// Access components using class references
// -----------------------------
const logger = player.getComponent(LoggerComponent);
const story = player.getComponent(StoryComponent);
const broadcast = player.getComponent(BroadcastComponent);
const meta = player.getComponent(MetaComponent);
const timing = player.getComponent(TimingComponent);
const vibe = player.getComponent(VibeComponent);
const context = player.getComponent(ContextComponent);

// -----------------------------
// Print engine outputs and component states
// -----------------------------
console.log("\n--- LoggerEngine Logs ---");
console.log(logger.engine.getLogs());

console.log("\n--- StoryEngine Next Arc ---");
console.log(story.nextArc());

console.log("\n--- BroadcastEngine Bundle ---");
console.log(broadcast.getBundle());

console.log("\n--- MetaEngine Streak ---");
console.log(meta.getStreak());

console.log("\n--- TimingComponent Vibe ---");
console.log(timing.vibe);

console.log("\n--- VibeComponent State ---");
console.log({ vibe: vibe.vibe, role: vibe.role });

console.log("\n--- ContextComponent State ---");
console.log(context.state);
