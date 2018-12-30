import Alt from "../Alt";
import Store from "../Store";
import assert from "assert";

class TestStore extends Store {
  constructor(actions) {
    super();
    this.state = { x: null };
    this.bindActions(actions);
  }

  sup(x) {
    this.setState({ x });
  }

  sap(y) {
    this.setState({ y });
  }
}

class PromiseStore extends Store {
  constructor(actions) {
    super();
    this.state = { myData: undefined, myError: undefined, loading: false };
    this.bindActions(actions);
  }

  sup({ myData, myError, loading }) {
    this.setState({ myData, myError, loading });
  }
}

describe("Actions", () => {
  let alt;

  beforeEach(() => {
    alt = new Alt();
  });

  afterEach(() => {
    //alt.flush()
  });

  it("createActions complains when argument is missing", () => {
    assert.throws(
      () => alt.createActions({ generate: ["sup", "foo"] }),
      /Missing namespace/
    );
    assert.throws(
      () => alt.createActions("SomeActions"),
      /actions argument is missing/
    );

    // actions already exist with this name
    alt.createActions("Actions", { generate: ["sup", "foo"] });
    assert.throws(
      () => alt.createActions("Actions", { generate: ["sup", "foo"] }),
      /An Actions instance already exists with name Actions/
    );
  });

  it("createActions() with generate", () => {
    const actions = alt.createActions("Actions", { generate: ["sup", "foo"] });
    const store = alt.createStore("TestStore", new TestStore(actions));
    actions.sup("xxx");
    assert.equal("xxx", store.getState().x);
  });

  it("createActions() creates multiple types of actions", () => {
    const actions = alt.createActions("Actions", {
      generate: ["sup"],

      sap(value) {
        return value + "-sapped";
      }
    });
    const store = alt.createStore("TestStore", new TestStore(actions));
    actions.sup("foo", "baz");
    actions.sap("bar");
    assert.deepEqual(["foo", "baz"], store.getState().x);
    assert.equal("bar-sapped", store.getState().y);
  });

  it("action that returns a function", () => {
    const actions = alt.createActions("Actions", {
      sup() {
        return function(dispatch) {
          this.dispatch({ payload: "foo" });
        };
      }
    });
    const store = alt.createStore("TestStore", new TestStore(actions));
    actions.sup();
    assert.equal("foo", store.getState().x);
  });

  it("preventDefault() should not trigger dispatch", () => {
    const actions = alt.createActions("Actions", {
      sup() {
        this.preventDefault();
        return "foo";
      }
    });
    const store = alt.createStore("TestStore", new TestStore(actions));
    actions.sup();
    assert.equal(null, store.getState().x);
  });

  it("preventDefault() in Promise should not trigger dispatch", () => {
    const actions = alt.createActions("Actions", {
      sup() {
        return Promise.resolve("foo").then(value => {
          this.preventDefault();
          return value;
        });
      }
    });
    const store = alt.createStore("TestStore", new TestStore(actions));
    return actions.sup().then(value => {
      assert.equal(null, store.getState().x);
      assert.equal("foo", value);
    });
  });

  it("action that returns a Promise that succeeds", () => {
    const actions = alt.createActions("Actions", {
      sup() {
        this.dispatch({ payload: { loading: true } });
        return Promise.resolve({ myData: "foo" });
      }
    });
    const store = alt.createStore("PromiseStore", new PromiseStore(actions));
    const promise = actions.sup();
    const { myData, loading } = store.getState();
    assert(loading);
    assert(!myData);
    return promise.then(value => {
      assert.equal("foo", value.myData);
      const { myData, loading } = store.getState();
      assert(!loading);
      assert.equal("foo", myData);
    });
  });

  it("passing error and loading as action.error and action.meta.loading", () => {
    const actions = alt.createActions("Actions", {
      sup() {
        // dispatch an Action manually
        this.dispatch({
          type: "Actions/sup",
          payload: null,
          meta: { loading: true }
        });
        return Promise.reject(new Error("too many ninjas")).catch(e => {
          // dispatch an action using extra arguments
          this.dispatch({
            payload: e,
            error: true,
            meta: { foo: "bar" }
          });
          throw e;
        });
      }
    });

    class MetaStore extends Store {
      constructor() {
        super();
        this.bindActions(actions);
      }

      sup(payload, action) {
        this.setState({ payload, action });
      }
    }
    const store = alt.createStore("MetaStore", new MetaStore());
    const promise = actions.sup();
    const {
      action: { payload, error, meta: { loading } = {} }
    } = store.getState();
    assert(!payload);
    assert(!error);
    assert(loading);
    return promise
      .then(() => assert.fail("Promise should have failed"))
      .catch(e => {
        const {
          action: { payload, error, meta: { loading, foo } = {} }
        } = store.getState();
        assert(!loading);
        assert(error);
        assert.equal("bar", foo);
        assert.equal("too many ninjas", payload.message);
        assert.equal("too many ninjas", e.message);
      });
  });
});
