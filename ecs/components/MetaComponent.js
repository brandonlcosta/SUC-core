// ecs/components/MetaComponent.js
import { Component } from "../component.js";
import { MetaEngine } from "../../engines/metaEngine.js";

export class MetaComponent extends Component {
  constructor(config = {}) {
    super();
    this.engine = new MetaEngine(config);
  }

  addStreak(count = 1) {
    this.engine.addStreak(this.entity.name, count);
  }

  getStreak() {
    return this.engine.getStreak(this.entity.name);
  }
}
