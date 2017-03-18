---
layout: default
title: Store
description: Keeping the state of your application in Stores 
permalink: /doc/Stores
categories: [doc]
---

### Alt#createStore

> (displayName: String, StoreModel: class): AltStore

Receives the Store model class and returns back the singleton instance for it. This method expects a class 
that extends `Store`, with methods that will be the action handlers. These action handlers will be invoked 
by the dispatcher with the value returned by the action (or, in the case of Promises, the resolution or 
error value) disclosed as two arguments:

Name | Type | description
--- | --- | ---
value | object | Value returned from the Action
action | [Flux Standard Action](https://github.com/acdlite/flux-standard-action) | A [Flux Standard Action](https://github.com/acdlite/flux-standard-action) corresponding to the Action method. It includes `type`, `payload`, `error` and `meta` attributes. `type` will be set to `${actionNameSpace}/${actionMethod}`, which is the value used by `ActionDispatcher` to find the registered Store method listeners.

Stores offer a different internal and external API to enforce that state is not exposed and changes follow 
the expected flow through Actions. 

# Public Store attributes and methods

### displayName

This is a reference to the internal name for this Store. It is the identifier provided to `Alt#createStore()`.

### getState

> getState(): object

Return the state of the store.

### subscribe

> subscribe(listener: function): object

Registers a listener for changes in the state of this Store. This listener will be called after completion of any action handler 
that does not call `this.preventDefault()`. Returns an object with a single `dispose()` method that can be used to stop listening 
to lifecycle events. 

```js
// register for changes in state
const sub = MyStore.subscribe(this.onChange);

// stop listening
this.sub.dispose();
```

# Private Store attributes and methods

### Store#state

> state: object

The state of this Store. Expected to be initialized in the constructor, and modified from action handlers using `setState()`.

```js
class LocationStore extends Alt.Store {
  constructor() {
    this.state = {
      locations: []
    }
  }

  onChangeLocations(locations) {
    this.setState({ locations });
  }
}
```

### Store#setState

> setState(state: object): undefined

`setState` is used to set the state. You can override this method to provide your own setState implementation. Internally, setState will 
create a shallow copy of the merged state, or replace entirely if the state is immutable (as returned by `Object.isFrozen()`). `setState()` 
will not trigger a change event; instead, a single event will be triggered once all action handlers are finished.

```js
class MyStore {
  handleFoo() {
    this.setState({ foo: 0 });
  }
}
```

### Store#preventDefault

> preventDefault(): undefined

Called inside an action handler to indicate that a change event should not be triggered.

```js
class MyStore() extends Alt.Store {

  foo(value) {
    if (this.state.value === value) {
      // do not emit change event
      this.preventDefault();
    } 
    this.setState({ value });
  }

}
```

### Store#bindAction

> (action: function, storeHandler: function): undefined

This method takes in an Action method and an action handler defined in your Store model class. The store method is then bound to 
that action so whenever the action dispatches a payload, the specified handler will receive it.

```js
const MyActions = alt.generateActions('MyActions', [ 'foo', 'bar' ]);

class MyStore extends Alt.Store {

  constructor() {
    this.bindAction(MyActions.foo, this.handleFoo);
  }

  handleFoo(data) {
    // do something with data
  }

}
```

## Store#bindActions

> (actions: Actions): undefined

Takes in an Actions instance and binds all its methods to any action handlers in the Store model with the same name. A `foo` 
action will match a `foo` method in the Store.

```js
const MyActions = alt.generateActions('MyActions', [ 'foo', 'bar' ]);

class MyStore extends Alt.Store {

  constructor() {
    this.bindActions(MyActions);
  }

  foo(data) {
    // do something with data
  }

  bar(data) {
    // same here
  }

}
```

You can define an `otherwise` method in your action to receive any dispatched values not explicitely managed by the Store class.

```js
const MyActions = alt.generateActions('MyActions', [ 'foo', 'bar', 'baz' ]);

class MyStore extends Alt.Store {

  constructor() {
    this.bindActions(MyActions);
  }

  foo(data) {
    // handle MyActions.foo()
  }

  otherwise(values) {
    // handle MyActions.bar() and MyActions.baz()
  }

}
```

## Store#bindListeners

> (listenersMap: object): undefined

`bindListeners` is the inversion of `bindAction`. Accepts an object where the keys correspond to the method names in the 
Store model and the values are either an array of actions or a single one.

```js
import MyActions from '../actions/MyActions';
import OtherActions from '../actions/OtherActions';

class MyStore extends Alt.Store {

  constructor() {
    this.bindListeners({
      handleFoo: MyActions.foo,
      handleBar: [MyActions.bar, OtherActions.bar]
    });
  }

  handleFoo(data) {
    // will only be called by MyActions.foo()
  }

  handleBar(data) {
    // will be called by MyActions.bar() and OtherActions.bar()
  }
}
```

## Store.emitChange()

> emitChange(value: Object = this.state)

Will emit a `change` event to all observers that have been registered by `Store.subscribe()`. If `value` is missing, `this.state` will be used.

```js
class MyStore extends Store {

  constructor() {
    super();
    this.state = {
      foo: 1,
      bar: 2
    };
  }

  inc(key) {
    const partValue = {};
    partValue[key] = (this.state[key] || 0) + 1;
    this.setState(partValue);

    // do not emit everything, just the modified value
    this.preventDefault();
    this.emitChange(partValue);
  }

};

```

# Initial state

Stores are plain EcmaScript classes that can initialize state in the constructor. For example, you application could 
include some state in the HTML page:

```html
<script type="application/json" id="currentUser">
{ "id": 42, "name": "John Doe", "enabled": true }
</script>
<script src="MyApp"></script>
```

Then the application can use this state to initialize the Store:

`UserStore.js`

```js
import Store from 'alt-ng/Store';

class UserStore extends Store {

  constructor(currentUser) {
    this.state = { currentUser };
  }

}

export default function(alt, currentUser) {
  return alt.createStore('UserStore', new UserStore(currentUser));
}
```

`MyApp.js`

```js
import createUserStore from '../stores/UserStore';
import alt from './alt';

const currentUser = JSON.parse(document.getElementById('currentUser').html());
const store = createUserStore(alt, currentUser);
```

You can also get creative by processing and saving parts of the state to `localStorage`:

```js
// save state
const { currentUser } = store.getState(); 
localStorage.setItem('currentUser', JSON.stringify(currentUser));

// restore state
const restoredUser = JSON.parse(localStorage.getItem('currentUser'));
store = createUserStore(alt, restoredUser);
```