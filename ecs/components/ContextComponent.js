// ecs/components/ContextComponent.js
import { Component } from "../component.js";

export class ContextComponent extends Component {
  constructor(initialState = {}) {
    super();
    this.state = initialState;
  }
}
