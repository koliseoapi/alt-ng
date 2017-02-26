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

  it('bind multiple actions on same handler with reverseBindActions', () => {
    const actions = alt.createActions('Actions', { generate: ['sup', 'sap'] })
    class ReverseStore extends Store {

      constructor() {
        super();
        this.reverseBindActions({
          foo: [ actions.sup, actions.sap ]
        });

      }

      foo(x) {
        this.setState({ x })
      }

    }

    const store = alt.createStore('ReverseStore', new ReverseStore(actions));
    actions.sup('foo');
    assert.equal('foo', store.getState().x);
    actions.sap('bar');
    assert.equal('bar', store.getState().x);

  })

});
