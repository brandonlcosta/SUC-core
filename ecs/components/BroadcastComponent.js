// ecs/components/BroadcastComponent.js
import { Component } from "../component.js";
import { BroadcastEngine } from "../../engines/broadcastEngine.js";

export class BroadcastComponent extends Component {
  constructor(config = {}) {
    super();
    this.engine = new BroadcastEngine(config);
  }

  broadcast(message) {
    this.engine.assemble(message);
  }

  getBundle() {
    return this.engine.getBundle();
  }
}
