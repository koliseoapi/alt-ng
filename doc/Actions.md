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

* Promises will be executed, and [the result will be dispatched](#Promises}.
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

Actions that return a Promise will dispatch twice, first to indicate a `loading` state and later to pass the successful resolution or rejection 
error (see [Arguments to action handlers](/doc/Stores)).

```js
const locationActions = alt.createActions('LocationActions', {

  fetchLocations() {
    // your HTTP GET request would go here.
    // We will just mock something for simplicity
    return Promise.resolve([ 'Madrid', 'Berlin', 'San Francisco' ]);
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

  fetchLocations(locations, { error, meta: { loading }}) {
    this.setState(locations, error, loading);
  }

}
```

These Actions will still return the Promise, making testing super simple:

```js
locationActions.fetchLocations().then((locations) => {
  assert.equal(3, locations.length);
})
```

