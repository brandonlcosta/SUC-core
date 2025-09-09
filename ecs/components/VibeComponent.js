// ecs/components/VibeComponent.js
import { Component } from "../component.js";

export class VibeComponent extends Component {
  constructor(role = "neutral") {
    super();
    this.vibe = 0;
    this.role = role;
  }
}
