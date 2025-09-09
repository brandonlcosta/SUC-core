// ecs/components/StoryComponent.js
import { Component } from "../component.js";
import { StoryEngine } from "../../engines/storyEngine.js";

export class StoryComponent extends Component {
  constructor(config = {}) {
    super();
    this.engine = new StoryEngine(config.arcs || []);
  }

  nextArc() {
    return this.engine.nextArc();
  }
}
