import Alt from "../Alt";
import Store from "../Store";

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
    expect(() => alt.createActions({ generate: ["sup", "foo"] })).toThrowError(
      "Missing namespace"
    );

    expect(() => alt.createActions("SomeActions")).toThrowError(
      "actions argument is missing"
    );

    // actions already exist with this name
    alt.createActions("Actions", { generate: ["sup", "foo"] });
    expect(() =>
      alt.createActions("Actions", { generate: ["sup", "foo"] })
    ).toThrowError("An Actions instance already exists with name Actions");
  });

  it("createActions() with generate", () => {
    const actions = alt.createActions("Actions", { generate: ["sup", "foo"] });
    const store = alt.createStore("TestStore", new TestStore(actions));
    actions.sup("xxx");
    expect(store.getState().x).toBe("xxx");
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
    expect(store.getState().x).toEqual(["foo", "baz"]);
    expect(store.getState().y).toBe("bar-sapped");
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
    expect(store.getState().x).toBe("foo");
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
    expect(store.getState().x).toBeNull();
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
      expect(store.getState().x).toBeNull();
      expect(value).toBe("foo");
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
    expect(loading).toBeTruthy();
    expect(myData).toBeFalsy();
    return promise.then(value => {
      expect(value.myData).toBe("foo");
      const { myData, loading } = store.getState();
      expect(loading).toBeFalsy();
      expect(myData).toBe("foo");
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
    expect(payload).toBeFalsy();
    expect(error).toBeFalsy();
    expect(loading).toBeTruthy();
    return promise
      .then(() => {
        throw new Error("Promise should have failed");
      })
      .catch(e => {
        const {
          action: { payload, error, meta: { loading, foo } = {} }
        } = store.getState();
        expect(loading).toBeFalsy();
        expect(error).toBeTruthy();
        expect(foo).toBe("bar");
        expect(payload.message).toBe("too many ninjas");
        expect(e.message).toBe("too many ninjas");
      });
  });

  it("Multiple Stores using inheritance", () => {
    const actions = alt.createActions("Actions", { generate: ["sup", "sap"] });
    class TestStore2 extends TestStore {
      constructor() {
        super(actions);
      }
      sap() {}
    }
    const testStore = alt.createStore("TestStore", new TestStore(actions));
    const testStore2 = alt.createStore("TestStore2", new TestStore2(actions));
    const listeners = alt.dispatcher.listeners["Actions/sup"];
    expect(listeners[0].store.displayName).toBe("TestStore");
    expect(listeners[1].store.displayName).toBe("TestStore2");
  });
});
