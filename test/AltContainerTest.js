import Alt from "../Alt";
import Store from "../Store";
import React from "react";
import AltContainer from "../AltContainer";
import renderer from "react-test-renderer";

const alt = new Alt();
const actions = alt.createActions("Actions", { generate: ["sup"] });

class TestStore extends Store {
  constructor() {
    super();
    this.bindActions(actions);
    this.state = { x: null };
  }

  sup(x) {
    this.setState({ x });
  }
}

class TestStore2 extends Store {
  constructor() {
    super();
    this.bindActions(actions);
    this.state = { y: null };
  }

  sup(y) {
    this.setState({ y });
  }
}

const testStore = alt.createStore("testStore", new TestStore(actions));
const testStore2 = alt.createStore("testStore2", new TestStore2(actions));

describe("AltContainer", () => {
  let wrapper;

  it("requires either store or stores", () => {
    expect(() =>
      renderer.create(
        <AltContainer>
          <div />
        </AltContainer>
      )
    ).toThrowError("Must define either store or stores");
    expect(() =>
      renderer.create(
        <AltContainer store={testStore} stores={[testStore]}>
          <div />
        </AltContainer>
      )
    ).toThrowError("Cannot define both store and stores");
  });

  it("renders HTML", () => {
    expect(
      renderer
        .create(
          <AltContainer store={testStore}>
            <span className="foo" />
          </AltContainer>
        )
        .toJSON()
    ).toMatchSnapshot();
  });

  it("renders multiple children with keys", () => {
    expect(
      renderer
        .create(
          <AltContainer store={testStore}>
            <div key="1" />
            <div key="2" />
            <div key="3" />
          </AltContainer>
        )
        .toJSON()
    ).toMatchSnapshot();
  });

  it("store state is propagated as props", () => {
    let tree = renderer.create(
      <AltContainer store={testStore}>
        <div key="div1" className="div1" />
        <div key="div2" className="div2" />
      </AltContainer>
    );
    actions.sup("hello");
    expect(tree.toJSON()).toMatchSnapshot();
    actions.sup("bye");
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("multiple store states are merged", () => {
    let tree = renderer.create(
      <AltContainer stores={[testStore, testStore2]}>
        <div className="xxx" />
      </AltContainer>
    );
    actions.sup("foobar");
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("should apply changes to properties", function() {
    const node = document.createElement("div");
    let tree = renderer.create(
      <AltContainer store={testStore}>
        <div className="xxx" />
      </AltContainer>,
      node
    );
    actions.sup("strike1");
    expect(tree.toJSON()).toMatchSnapshot();
    renderer.create(
      <AltContainer store={testStore2}>
        <div className="xxx" />
      </AltContainer>,
      node
    );
    actions.sup("strike2");
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("keeps refs in children", function() {
    const onRef = jest.fn(() => document.createElement("div"));
    class Container extends React.Component {
      render() {
        return (
          <AltContainer store={testStore}>
            <span ref={onRef} />
          </AltContainer>
        );
      }
    }
    const tree = renderer.create(<Container />);
    actions.sup("hello");
    expect(tree.toJSON()).toMatchSnapshot();
    expect(onRef).toBeCalledTimes(1);
  });
});
