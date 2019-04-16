import EventSource from "./src/EventSource";
import { isMutableObject } from "./src/utils";
import ActionDispatcher from "./src/ActionDispatcher";

class Store {
  constructor() {
    this.eventSource = new EventSource();
    this.state = {};

    // to be set by Alt.createStore()
    // this.dispatcher
  }

  bindActions(actions) {
    Object.keys(actions).forEach(name => {
      const type = actions[name].type;
      const handler = this[name] || this.otherwise;
      handler && this.bindAction(type, handler);
    });
  }

  bindAction(action, handlerMethod) {
    // bind the method to the instance
    const handler = handlerMethod.bind(this);
    const type = action.type ? action.type : action;
    handler.store = this;
    if (!this.dispatcher) {
      // create a temporary action dispatcher, will be merged into a single instance later
      this.dispatcher = new ActionDispatcher();
    }
    this.dispatcher.subscribe(type, handler);
  }

  // where keys are methods in the Store, and the values are the actions
  bindListeners(listeners) {
    Object.keys(listeners).forEach(name => {
      const handler = this[name];
      if (!handler) {
        throw new Error(`${name} is not defined in Store`);
      }

      let values = listeners[name];
      values = Array.isArray(values) ? values : [values];
      values.forEach(action => this.bindAction(action, handler));
    });
  }

  subscribe(callback) {
    return this.eventSource.subscribe(callback);
  }

  setState(nextState) {
    if (isMutableObject(this.state)) {
      this.state = Object.assign({}, this.state, nextState);
    } else {
      this.state = nextState;
    }
  }

  preventDefault() {
    this._triggerChange = false;
  }

  // emit a change in the Store state
  // @param value the value to be emitted, default is this.state
  emitChange(value = this.state) {
    this.eventSource.publish(value);
  }

  // remove all listeners
  clearListeners() {
    this.eventSource.clear();
  }
}

export default Store;
