// ecs/bootstrap.js

import { World } from "./world.js";
import { Entity } from "./entity.js";

import {
  LoggerComponent,
  StoryComponent,
  MetaComponent,
  BroadcastComponent,
  TimingComponent,
  VibeComponent,
  ContextComponent
} from "./components/index.js";

import {
  LoggerSystem,
  StorySystem,
  BroadcastSystem,
  MetaSystem,
  TimingSystem,
  VibeSystem,
  ContextSystem
} from "./systems/index.js";

// -----------------------------
// Create the ECS world
// -----------------------------
const world = new World();

// -----------------------------
// Create entities and attach components
// -----------------------------
function createPlayer(name, arcs, role = "neutral") {
  return new Entity(name)
    .addComponent(new LoggerComponent())
    .addComponent(new StoryComponent({ arcs })) // pass arcs array
    .addComponent(new MetaComponent())
    .addComponent(new BroadcastComponent())
    .addComponent(new TimingComponent())
    .addComponent(new VibeComponent(role))
    .addComponent(new ContextComponent({ session: 1 }));
}

const player1 = createPlayer("Player1", [
  { name: "Intro" },
  { name: "Conflict" },
  { name: "Climax" }
], "chaos");

const player2 = createPlayer("Player2", [
  { name: "Setup" },
  { name: "Twist" },
  { name: "Resolution" }
], "echo");

world.addEntity(player1).addEntity(player2);

// -----------------------------
// Add all systems
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
// Run simulation ticks
// -----------------------------
const TICKS = 5;
console.log(`=== Running Full ECS Simulation for ${TICKS} ticks ===`);

for (let i = 0; i < TICKS; i++) {
  console.log(`\n--- TICK ${i + 1} ---`);
  world.update();
}

// -----------------------------
// Print final engine/component states
// -----------------------------
function printPlayerState(player) {
  const logger = player.getComponent(LoggerComponent);
  const story = player.getComponent(StoryComponent);
  const broadcast = player.getComponent(BroadcastComponent);
  const meta = player.getComponent(MetaComponent);
  const timing = player.getComponent(TimingComponent);
  const vibe = player.getComponent(VibeComponent);
  const context = player.getComponent(ContextComponent);

  console.log(`\n=== ${player.name} State ===`);
  console.log("Logger Logs:", logger.engine.getLogs());
  console.log("Story Arcs Remaining:", story.engine.arcs);
  console.log("Broadcast Bundle:", broadcast.engine.getBundle());
  console.log("Meta Streak:", meta.getStreak());
  console.log("Vibe:", vibe.vibe, "Role:", vibe.role);
  console.log("Timing Vibe:", timing.vibe);
  console.log("Context:", context.state);
}

printPlayerState(player1);
printPlayerState(player2);

console.log("\n=== ECS Simulation Complete ===");
