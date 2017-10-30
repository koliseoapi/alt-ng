/**
 * Simple implementation of an event bus
 */
export default class EventSource {

  constructor() {
    this.clear();
  }

  subscribe(listener) {
    const id = this.listeners.push(listener)
    return {
      dispose: () => this.unsubscribe(listener)
    }
  }

  unsubscribe(listener) {
    const id = this.listeners.indexOf(listener)
    if (id !== -1) {
      this.listeners.splice(id, 1)
    }
  }

  publish(...args) {
    this.listeners.forEach(listener => listener(...args));
  }

  // clears all listeners registered in this EventSource 
  clear() {
    this.listeners = [];
  }

}
