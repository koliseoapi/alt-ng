import ActionDispatcher from '../src/ActionDispatcher'
import assert from 'assert';
import sinon from 'sinon';

describe('ActionDispatcher', () => {

  let dispatcher;

  beforeEach(() => {
    dispatcher = new ActionDispatcher();
  })

  it('subscribe should receive any dispatches', () => {
    const listener = sinon.spy(function() {});
    listener.store
    dispatcher.subscribe('foo', listener);
  })


});
