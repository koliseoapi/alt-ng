/**
 * A dispatcher implementation that keeps track of all listeners
 * separated by action type
 *
 */
export default class ActionDispatcher {
  constructor() {
    this.listeners = {};
  }

  merge({ listeners }) {
    Object.keys(listeners).forEach(actionType => {
      this.listeners[actionType] = (this.listeners[actionType] || []).concat(
        listeners[actionType]
      );
    });
  }

  subscribe(actionType, listener) {
    (this.listeners[actionType] = this.listeners[actionType] || []).push(
      listener
    );
  }

  unsubscribe(actionType, listener) {
    const listeners = this.listeners[actionType];
    const id = listeners.indexOf(listener);
    if (id !== -1) {
      listeners.splice(id, 1);
    }
  }

  dispatch(action) {
    const listeners = this.listeners[action.type] || [];
    const stores = {};

    listeners.forEach(function(listener) {
      const store = listener.store;
      store._triggerChange = true;
      listener(action.payload, action);
      if (store._triggerChange) {
        stores[store.displayName] = store;
      }
    });
    Object.keys(stores).forEach(function(storeName) {
      stores[storeName].emitChange();
    });
  }
}
