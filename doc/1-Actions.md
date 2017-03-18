---
layout: default
title: Actions
permalink: /doc/Actions
categories: [doc]
---

### Alt#createActions

> createActions(namespace: String, ActionMethods: object): Actions

This is a function that takes a set of methods and returns back an object with those actions defined. 
The first argument `namespace` is used to register the Actions object in the alt instance. 

```js
import alt from '../alt';

export default alt.createActions('MyActions', {
  
  foo(values) {
    return values;
  }

});
```

The value returned by an Action will be handled the following way:

* Promises will be executed, and [the result will be dispatched](#promises).
* Functions will be called and the returned value will be dispatched again.
* Actions that return `undefined` will not be dispatched anywhere.
* Anything else that is not undefined will be passed to the dispatcher.

If any of your actions are just straight through dispatches you can shorthand generate them using a `generate` property with the list of method names to generate.

```js
// Actions like this
let MyActions = alt.createActions('MyActions', {

  foo(values) { return values; },
  bar(value) { return value },
  baz(a) { return a < 42? 0 : 42 }

});

// can be written like this instead
MyActions = alt.createActions('MyActions', {

  generate: [ 'foo', 'bar' ],

  baz(a) { return a < 42? 0 : 42 }

});

// and invoked as usual
MyActions.foo('something');
MyActions.bar();
MyActions.baz(15);
```

### Promises

Actions that return a Promise will dispatch the result after resolving the Promise. You can add extra `dispatch` calls to notify `error` and `loading` states (see [Arguments to action handlers](/doc/Stores)).

```js
const locationActions = alt.createActions('LocationActions', {

  fetchLocations() {
    this.dispatch({
      meta: { loading: true }
    });

    // your HTTP GET request would go here.
    // We will just mock something for simplicity
    return Promise.resolve([ 'Madrid', 'Berlin', 'San Francisco' ]).catch((errorMessage) => {
      this.dispatch({ 
        error: true, 
        meta: { errorMessage } 
      });
      throw error;
    });
  }

});

class LocationStore extends Alt.Store {

  constructor() {
    this.state = {
      locations: [],
      loading: false,
      error: undefined
    }
    this.bindActions(AsyncLocationActions);
  }

  fetchLocations(locations, { error, meta: { loading, errorMessage }}) {
    this.setState(locations, error: errorMessage, loading);
  }

}
```

These Actions will still return the Promise, making testing super simple. An example using mocha:

```js
import assert from 'assert';

it('action should return three locations', () => {
  locationActions.fetchLocations().then((locations) => {
    assert.equal(3, locations.length);
  })
});
```

# Internal methods for Actions 

There are a couple methods available inside of Action methods to modify the default dispatch behavior of Actions.

### Actions.preventDefault()

> preventDefault() 

Disables automatic dispatching of the result of an action. You can invoke this method to do your own dispatching invoking `this.dispatch()`.

### Actions.dispatch()

> dispatch({ type: String, payload: Object, error: boolean, meta: Object })

Dispatches a FSA to the registered Stores. If not specified, the type will be set to `[actionNamespace]/[actionMethod]`, which is the type assigned to the method by default.

```js
alt.createActions('MyActions', {

  fetch: function(data) {
    this.preventDefault();
    this.dispatch({
      // default type is fine
      // type: 'MyActions/fetch'
      payload: data,
      meta: { loading: true }
    });

    return Promise.resolve('foo').catch((e) => {
      this.dispatch({ 
        error: true, 
        meta: { error: e } 
      });
    });
  })

}
```