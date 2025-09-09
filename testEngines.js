// testEngines.js
import { LoggerEngine } from "./engines/loggerEngine.js";
import { StoryEngine } from "./engines/storyEngine.js";
import { MetaEngine } from "./engines/metaEngine.js";
import { StudioRouter } from "./engines/studioRouter.js";
import { BroadcastEngine } from "./engines/broadcastEngine.js";

const logger = new LoggerEngine();
logger.log("Engine initialized");

const story = new StoryEngine();
story.addArc({ name: "Intro", events: [] });
console.log("Next Arc:", story.nextArc());

const meta = new MetaEngine();
meta.addStreak("Player1", 3);
console.log("Streak:", meta.getStreak("Player1"));

const router = new StudioRouter();
router.registerFeed("integrity", { safe: true });
console.log("Feed:", router.getFeed("integrity"));

const broadcast = new BroadcastEngine();
broadcast.assemble("Welcome to the show!");
console.log("Bundle:", broadcast.getBundle());
