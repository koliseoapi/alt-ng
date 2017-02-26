import 'jsdom-global/register';
import Alt from '../Alt'
import Store from '../Store'
import React from 'react'
import AltContainer from '../AltContainer'
//import sinon from 'sinon'
import assert from 'assert';
import { mount } from 'enzyme';

const alt = new Alt()
const actions = alt.createActions('Actions', { generate: ['sup'] })

class TestStore extends Store {

  constructor() {
    super();
    this.bindActions(actions);
    this.state = { x: null };
  }

  sup(x) {
    this.setState({ x })
  }
}

class TestStore2 extends Store {

  constructor() {
    super();
    this.bindActions(actions);
    this.state = { y: null };
  }

  sup(y) {
    this.setState({ y })
  }

}

const testStore = alt.createStore('testStore', new TestStore(actions));
const testStore2 = alt.createStore('testStore2', new TestStore2(actions))

describe('AltContainer', () => {

  let wrapper;

  afterEach(() => {
    wrapper != null && wrapper.unmount();
    wrapper = null;
    //alt.flush()
  })

  it('requires either store or stores', () => {
    try {
      mount(<AltContainer><div /></AltContainer>);
      assert.fail('Should not accept empty store and stores');
    } catch (e) {
      assert.equal('Must define either store or stores', e.message);
    }
  })

  it('renders HTML', () => {
    wrapper = mount(
      <AltContainer store={ testStore }>
        <span className="foo"/>
      </AltContainer>
    );
    assert.equal('<div><span class="foo"></span></div>', wrapper.html());
  });

  it('renders multiple children with keys', () => {
    wrapper = mount(
      <AltContainer store={ testStore }>
        <div key="1"/>
        <div key="2"/>
        <div key="3"/>
      </AltContainer>
    );
  })

  it('store state is propagated as props', () => {
    wrapper = mount(
      <AltContainer store={ testStore }>
        <div key="div1" className="div1"/>
        <div key="div2" className="div2" />
      </AltContainer>
    );
    actions.sup('hello')
    const div1 = wrapper.find('.div1');
    const div2 = wrapper.find('.div2');
    assert.equal('hello', wrapper.state('x'))
    assert.equal('hello', div1.props().x)
    assert.equal('div1',  div1.props().className)
    assert.equal('hello', div2.props().x)

    actions.sup('bye')
    assert.equal('bye', wrapper.state('x'))
    assert.equal('bye', div1.props().x)
  })

  it('multiple store states are merged', () => {
    wrapper = mount(
      <AltContainer stores={ [ testStore, testStore2 ] }>
        <div className="xxx"/>
      </AltContainer>
    );
    actions.sup('foobar')
    const { x, y } = wrapper.find('.xxx').props();
    assert.equal('foobar', x)
    assert.equal('foobar', y)
  })

  it('should apply changes to properties', function() {
    class Container extends React.Component {

      constructor() {
        super();
        this.state = { store: testStore }
      }

      render() {
        return (
          <AltContainer store={this.state.store}>
            <div className="xxx"/>
          </AltContainer>
        )
      }
    }
    const container = mount(<Container />);
    const component = container.find('.xxx');
    actions.sup('strike1');
    container.setState({ store: testStore2 })
    actions.sup('strike2');
    assert.equal('strike1', component.props().x);
    assert.equal('strike2', component.props().y);

  });

  it('keeps refs in children', function() {

    class Container extends React.Component {

      render() {
        return (
          <AltContainer store={testStore}>
            <span ref="span"/>
          </AltContainer>
        )
      }
    }
    wrapper = mount(<Container />);
    const span = wrapper.ref('span');
    actions.sup('hello')
    assert.equal('hello', span.props().x);
  });

});
