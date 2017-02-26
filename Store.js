import EventSource from './src/EventSource'
import { isMutableObject } from './src/utils'
import ActionDispatcher from './src/ActionDispatcher'

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
    }, this);
  }

  bindAction(action, handler) {
    const type = action.type ? action.type : action
    handler.store = this;
    if (!this.dispatcher) {
      // create a temporary action dispatcher, will be merged into a single instance later
      this.dispatcher = new ActionDispatcher();
    }
    this.dispatcher.subscribe(type, handler);

  }

  // where keys are methods in the Store, and the values are the actions
  reverseBindActions(actions) {
    Object.keys(actions).forEach(name => {
      const handler = this[name]
      if (!handler) {
        throw new ReferenceError(`${name} is not defined in Store`)
      }

      let values = actions[name]
      values = Array.isArray(values)? values : [ values ];
      values.forEach(action => this.bindAction(action, handler))
    })
  }

  subscribe(callback) {
    return this.eventSource.subscribe(callback);
  }

  setState(nextState) {
    if (isMutableObject(this.state)) {
      this.state = Object.assign({}, this.state, nextState)
    } else {
      this.state = nextState
    }
  }

  preventDefault() {
    this._triggerChange = false
  }

  emitChange() {
    this.eventSource.publish(this.state);
  }

}

export default Store
