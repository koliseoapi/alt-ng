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
  }

}

class PromiseStore extends Store {

  constructor(actions) {
    super();
    this.state = { payload: undefined, error: undefined, loading: false };
    this.bindActions(actions);
  }

  sup(x, { payload, error, meta: { loading } = {}}) {
    this.setState({ payload, error, loading })
  }

}

describe('Actions', () => {

  let alt;

  beforeEach(() => {
    alt = new Alt();
  })

  afterEach(() => {
    //alt.flush()
  })

  it('createActions() with generate', () => {
    const actions = alt.createActions('Actions', { generate: ['sup', 'foo'] })
    const store = alt.createStore('TestStore', new TestStore(actions));
    actions.sup('xxx');
    assert.equal('xxx', store.getState().x);
  })

  it('createActions() creates multiple types of actions', () => {
    const actions = alt.createActions('Actions', {

      generate: [ 'sup' ],

      sap(value) {
        return value + '-sapped'
      }

    })
    const store = alt.createStore('TestStore', new TestStore(actions));
    actions.sup('foo', 'baz');
    actions.sap('bar');
    assert.deepEqual(['foo', 'baz'], store.getState().x);
    assert.equal('bar-sapped', store.getState().y);
  })

  it('action that returns a function', () => {
    const actions = alt.createActions('Actions', {

      sup() {
        return function (dispatch) {
          dispatch('foo')
        }
      }

    })
    const store = alt.createStore('TestStore', new TestStore(actions));
    actions.sup();
    assert.equal('foo', store.getState().x);
  })

  it('action that returns a Promise that succeeds', () => {
    const actions = alt.createActions('Actions', {

      sup() {
        return new Promise((resolve) => resolve('foo'))
      }

    })
    const store = alt.createStore('PromiseStore', new PromiseStore(actions));
    const promise = actions.sup();
    const { payload, loading, error } = store.getState();
    assert(loading);
    assert(!payload);
    assert(!error);
    return promise.then((value) => {
      assert.equal('foo', value);
      const { payload, loading, error } = store.getState();
      assert(!loading);
      assert.equal('foo', payload);
      assert(!error);
    })
  })

  it('action that returns a Promise that fails', () => {
    const actions = alt.createActions('Actions', {

      sup() {
        return new Promise((resolve, reject) => { throw new Error('too many ninjas') })
      }

    })
    const store = alt.createStore('PromiseStore', new PromiseStore(actions));
    const promise = actions.sup();
    const { payload, loading, error } = store.getState();
    assert(loading);
    assert(!payload);
    assert(!error);
    return promise.then(() => assert.fail('Promise should have failed')).catch((e) => {
      const { payload, loading, error } = store.getState();
      assert(!loading);
      assert(!payload);
      assert.equal('too many ninjas', error.message);
      assert.equal('too many ninjas', e.message);
    })
  })

  it('action that returns undefined should not trigger dispatch', () => {
    const actions = alt.createActions('Actions', {

      sup() {
        return undefined;
      }

    })
    const store = alt.createStore('TestStore', new TestStore(actions));
    actions.sup();
    assert.equal(null, store.getState().x);
  })

});
