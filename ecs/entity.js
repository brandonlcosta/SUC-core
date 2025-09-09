// ecs/entity.js
export class Entity {
  static nextId = 1;

  constructor(name = "Entity") {
    this.id = Entity.nextId++;
    this.name = name;
    this.components = new Map();
  }

  addComponent(component) {
    this.components.set(component.constructor.name, component);
    component.entity = this;
    if (component.init) component.init();
    return this;
  }

  removeComponent(componentClass) {
    const name = componentClass.name;
    const comp = this.components.get(name);
    if (comp && comp.destroy) comp.destroy();
    return this.components.delete(name);
  }

  getComponent(componentClass) {
    return this.components.get(componentClass.name);
  }

  hasComponent(componentClass) {
    return this.components.has(componentClass.name);
  }
}
