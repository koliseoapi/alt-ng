import Alt from '../Alt'
import Store from '../Store'
import assert from 'assert';
import sinon from 'sinon';

class TestStore extends Store {

  constructor(actions) {
    super();
    this.state = { x: null };
    this.bindActions(actions);
  }

  sup(x) {
    this.setState({ x })
  }

  sap(y) {
    this.setState({ y })
    this.preventDefault();
  }

}

describe('Stores', () => {

  let alt;
  let state;

  beforeEach(() => {
    alt = new Alt();
    state = undefined;
  })

  it('createStore complains when argument is missing', () => {
    assert.throws(() => alt.createStore(), /Missing displayName/);

    // argument is not an instance, but something else
    assert.throws(() => alt.createStore('Store', class Something {}), /Missing Store, or not an instance of Store/);
    assert.throws(() => alt.createStore('Store', 'foo'), /Missing Store, or not an instance of Store/);

    // store already exists
    const actions = alt.createActions('Actions', { generate: ['sup'] })
    alt.createStore('TestStore', new TestStore(actions));
    assert.throws(() => alt.createStore('TestStore', new TestStore(actions)), /Store already defined with name TestStore/);
  })

  it('subscribed listeners should receive changes in the state', () => {
    const actions = alt.createActions('Actions', { generate: ['sup'] })
    const store = alt.createStore('TestStore', new TestStore(actions));
    store.subscribe(value => state = value);
    actions.sup('xxx');
    assert.equal('xxx', state.x);
  })

  it('preventDefault() should cancel change notifications', () => {
    const actions = alt.createActions('Actions', { generate: ['sap'] })
    const store = alt.createStore('TestStore', new TestStore(actions));
    store.subscribe(value => state = value);
    actions.sap('xxx');
    assert.equal('undefined', typeof state);
    assert.equal('xxx', store.getState().y);
  })

  it('clearListeners() should reset the list of listeners', () => {
    const actions = alt.createActions('Actions', { generate: ['sap'] })
    const store = alt.createStore('TestStore', new TestStore(actions));
    store.subscribe(value => state = value);
    const source = alt._stores['TestStore'].eventSource;
    assert.equal(1, source.listeners.length);
    store.clearListeners();
    assert.equal(0, source.listeners.length);
  })

  it('otherwise whould receive any action not assigned to a handler', () => {
    class ExtendedTestStore extends TestStore {

      otherwise(y) {
        this.setState({ y })
      }

    }
    const actions = alt.createActions('Actions', { generate: ['sup', 'xxx'] })
    const store = alt.createStore('TestStore', new ExtendedTestStore(actions));
    store.subscribe(value => state = value);
    actions.sup('foo');
    actions.xxx('bar');
    assert.equal('foo', state.x);
    assert.equal('bar', state.y);
  })

  it('multiple handlers should trigger a single change event', () => {
    const actions = alt.createActions('Actions', { generate: ['sup'] })
    class TwiceStore extends Store {

      constructor() {
        super();
        this.bindAction(actions.sup, this.foo);
        this.bindAction(actions.sup, this.bar);
      }

      foo(x) {
        this.setState({ x })
      }

      bar(y) {
        this.setState({ y })
      }

    }
    const store = alt.createStore('TwiceStore', new TwiceStore(actions));
    const callback = sinon.spy(value => state = value);
    store.subscribe(callback);
    actions.sup('hello');
    assert.equal('hello', state.x);
    assert.equal('hello', state.y);
    assert(callback.calledOnce);
  });

  it('multiple stores triggered by the same action', () => {
    const actions = alt.createActions('Actions', { generate: ['sup'] })
    class TestStore2 extends Store {

      constructor() {
        super();
        this.bindActions(actions);
      }

      sup(foo) {
        this.setState({ foo })
      }

    }
    const store1 = alt.createStore('TestStore', new TestStore(actions));
    const store2 = alt.createStore('TestStore2', new TestStore2(actions));
    actions.sup('hello');
    assert.equal('hello', store1.getState().x);
    assert.equal('hello', store2.getState().foo);
  });

  it('bind multiple actions on same handler with bindListeners()', () => {
    const actions = alt.createActions('Actions', { generate: ['sup', 'sap'] })
    class MultipleStore extends Store {

      constructor() {
        super();
        this.bindListeners({
          foo: [ actions.sup, actions.sap ]
        });

      }

      foo(x) {
        this.setState({ x })
      }

    }

    const store = alt.createStore('MultipleStore', new MultipleStore(actions));
    actions.sup('foo');
    assert.equal('foo', store.getState().x);
    actions.sap('bar');
    assert.equal('bar', store.getState().x);

  })

  it('bindListeners() complain if method does not exist', () => {
    //const actions = alt.createActions('Actions', { generate: ['sup', 'sap'] })
    class MultipleStore extends Store {

      constructor() {
        super();
        this.bindListeners({
          foo: []
        });

      }

    }

    assert.throws(() => alt.createStore('MultipleStore', new MultipleStore()), /foo is not defined in Store/);

  })

  it('detects mutable and immutable state', () => {
    const actions = alt.createActions('Actions', { generate: ['sup'] })
    class ImmutableStore extends Store {

      constructor() {
        super();
        this.state = Object.freeze({ foo: 1, bar: 1 });
        this.bindActions(actions);
      }

      sup(foo) {
        this.setState({ foo });
      }

    }

    class MutableStore extends Store {

      constructor() {
        super();
        this.state = { foo: 1, bar: 1 };
        this.bindActions(actions);
      }

      sup(foo) {
        this.setState({ foo });
      }

    }

    const is = alt.createStore('ImmutableStore', new ImmutableStore());
    const ms = alt.createStore('MutableStore', new MutableStore());

    assert.deepEqual({ foo: 1, bar: 1 }, is.getState());
    assert.deepEqual({ foo: 1, bar: 1 }, ms.getState());
    actions.sup(2);
    assert.deepEqual({ foo: 2 }, is.getState());
    assert.deepEqual({ foo: 2, bar: 1 }, ms.getState());

  })

  it('emits custom Store change events', () => {
    const actions = alt.createActions('Actions', { generate: ['inc'] })
    class MultivaluedStore extends Store {

      constructor() {
        super();
        this.state = {};
        this.bindActions(actions);
      }

      inc(key) {
        const value = (this.state[key] || 0) + 1;
        const part = {};
        part[key] = value;
        this.setState(part);
        this.preventDefault();
        this.emitChange(part);
      }

    }

    const store = alt.createStore('MultivaluedStore', new MultivaluedStore());
    let lastKnownValue;
    store.subscribe((v) => lastKnownValue = v);
    actions.inc('foo');
    actions.inc('foo');
    assert.deepEqual({ foo: 2 }, lastKnownValue);
    actions.inc('bar');
    assert.deepEqual({ bar: 1 }, lastKnownValue);

  })

});
