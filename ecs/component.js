// ecs/component.js
export class Component {
  constructor() {
    this.entity = null;
  }

  init() {}
  update(deltaTime) {}
  destroy() {}
}

// Common ECS Components (skeletons)
export class LoggerComponent extends Component {
  constructor() {
    super();
    this.logs = [];
  }
  log(msg) {
    this.logs.push(msg);
    console.log(`[Logger][${this.entity?.name}] ${msg}`);
  }
}

export class StoryComponent extends Component {
  constructor() {
    super();
    this.arcs = [];
  }
}

export class MetaComponent extends Component {
  constructor() {
    super();
    this.data = {};
  }
}

export class BroadcastComponent extends Component {
  constructor() {
    super();
    this.messages = [];
  }
}
