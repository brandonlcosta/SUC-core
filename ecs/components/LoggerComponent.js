// ecs/components/LoggerComponent.js
import { Component } from "../component.js";
import { LoggerEngine } from "../../engines/loggerEngine.js";

export class LoggerComponent extends Component {
  constructor(config = {}) {
    super();
    this.engine = new LoggerEngine(config);
  }

  log(message) {
    this.engine.log(message);
  }
}
