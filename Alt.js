import ActionDispatcher from "./src/ActionDispatcher";
import createActionWrapper from "./src/createActionWrapper";
import { isString } from "./src/utils";

// pass-through dummy action handler
function forwardValue(...args) {
  return args.length > 1 ? args : args[0];
}

/**
 * process the "generate" field of an Actions object. Adds a new pass-through
 * method with each name from the generated values
 */
function generateActions({ generate, ...actions }) {
  return !generate
    ? actions
    : Object.assign(
        generate.reduce((obj, name) => {
          obj[name] = forwardValue;
          return obj;
        }, {}),
        actions
      );
}

export default class Alt {
  constructor(config) {
    this.actions = {};
    this.stores = {};
    this.dispatcher = new ActionDispatcher();

    // our internal reference to stores
    this._stores = {};
  }

  /**
   * Creates the actions for the passed Actions object. If it includes a generated attribute,
   * it will generate pass-through methods with all these names
   */
  createActions(namespace, actions) {
    if (process.env.NODE_ENV !== "production") {
      if (!namespace || !isString(namespace)) {
        throw new Error("Missing namespace");
      }
      if (!actions || !Object.keys(actions).length) {
        throw new Error("actions argument is missing");
      }
      if (this.actions[namespace]) {
        throw new Error(
          `An Actions instance already exists with name ${namespace}`
        );
      }
    }

    actions = generateActions(actions);
    const actionWrappers = Object.keys(actions).reduce((obj, actionName) => {
      const type = `${namespace}/${actionName}`;
      const actionWrapper = createActionWrapper(
        this.dispatcher,
        type,
        actions[actionName]
      );
      obj[actionName] = actionWrapper;
      return obj;
    }, {});

    return (this.actions[namespace] = actionWrappers);
  }

  createStore(displayName, store) {
    if (process.env.NODE_ENV !== "production") {
      if (!displayName || !isString(displayName)) {
        throw new Error("Missing displayName");
      }
      if (!store || !store.eventSource) {
        throw new Error("Missing Store, or not an instance of Store");
      }
      if (this.stores[displayName]) {
        throw new Error(`Store already defined with name ${displayName}`);
      }
    }

    store.displayName = displayName;
    store.dispatcher = store.dispatcher
      ? this.dispatcher.merge(store.dispatcher)
      : this.dispatcher;

    this._stores[displayName] = store;
    // the public interface, just getState and subscribe
    return (this.stores[displayName] = {
      displayName,

      getState() {
        return store.state;
      },

      subscribe(callback) {
        return store.subscribe(callback);
      },

      remove: () => {
        this._stores = this._stores.filter(
          store => store.displayName !== displayName
        );
        delete this.stores[displayName];
      },

      clearListeners() {
        store.clearListeners();
      }
    });
  }
}
