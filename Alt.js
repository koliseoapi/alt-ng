import ActionDispatcher from './src/ActionDispatcher'
import createActionWrapper from './src/createActionWrapper'

// pass-through dummy action handler
function forwardValue(...args) {
  return args.length > 1 ? args : args[0];
}

/**
 * process the "generate" field of an Actions object. Adds a new pass-through
 * method with each name from the generated values
 */
function generateActions({ generate, ...actions }) {

  return !generate? actions : Object.assign(generate.reduce((obj, name) => {
      obj[name] = forwardValue
      return obj
    }, {}), actions);

}

export default class Alt {
  constructor(config) {
    this.actions = {}
    this.stores = {}
    this.dispatcher = new ActionDispatcher();

    // our internal reference to stores
    this._stores = {}
  }

  /**
   * Creates the actions for the passed Actions object. If it includes a generated attribute,
   * it will generate pass-through methods with all these names
   */
  createActions(namespace, actions) {

    actions = generateActions(actions);
    const actionWrappers = Object.keys(actions).reduce((obj, actionName) => {
      const type = `${namespace}/${actionName}`
      const actionWrapper = createActionWrapper(this.dispatcher, type, actions[actionName]);
      obj[actionName] = actionWrapper;
      return obj;

    }, this.actions[namespace] || {});

    return (this.actions[namespace] = actionWrappers);
  }

  createStore(displayName, store) {
    store.displayName = displayName;
    store.dispatcher = store.dispatcher? this.dispatcher.merge(store.dispatcher) : this.dispatcher;

    this._stores[displayName] = store;
    // the public interface, just getState and subscribe
    return (this.stores[displayName] = {

      displayName,

      getState() {
        return store.state
      },

      subscribe(callback) {
        return store.subscribe(callback)
      },

      remove: () => {
        this._stores = this._stores.filter(store => store.displayName !== displayName)
        delete this.stores[displayName]
      }
    });
  }

}
