---
layout: default
title: Creating a Store
description: Store manages the state and is shared across your components
permalink: /tutorial/stores
categories: [tutorial]
---

# Creating a Store

The Store is where your data lives, the single source of truth for a particular piece of your application state. Stores are created using JavaScript classes, where the state is stored in a `state` attribute that should be initialized in the constructor and later modified using `setState()`. 

```js
import Store from 'alt-ng/Store';

class LocationStore extends Store {
  constructor() {
    this.state = {
      locations: []
    }
  }
}

export alt.createStore('LocationStore', new LocationStore());
```

State is modified by methods in the Store. These methods should be bound to the corresponding Actions by invoking 
one of `bindAction()`, `bindActions()` or `bindListeners()` in the Store constructor. This will create in the dispatcher 
a mapping between Actions methods and Store methods that should receive their results.

Let's add a handler to our Store using `bindActions()`, which will bind all the methods from our
`LocationActions` instance to the methods of the same name in our Store:

`stores/LocationStore.js`:

```js
import Store from 'alt-ng/Store';
import alt from '../alt';
import LocationActions from '../actions/LocationActions';

class LocationStore extends Store {
  constructor() {
    this.state = {
      locations: []
    }
    this.bindActions(LocationActions);
  }

  // will be invoked automatically after LocationActions.updateLocations is finished
  updateLocations(locations) {
    this.setState({ locations });
  }
}

export alt.createStore('LocationStore', new LocationStore());
```

Our Store will emit a change event when `LocationStore#updateLocations()` is finished, and our React Components 
can listen to these changes. 

<div class="form-actions">
  <a class="btn btn-primary" href="./views">Next: Connecting your React Component</a>
</div>