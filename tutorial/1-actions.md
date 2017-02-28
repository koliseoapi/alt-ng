---
layout: default
title: Creating Actions
description: How to create actions for managing state
permalink: /tutorial/actions
categories: [tutorial]
---

# Creating Actions

Our first Actions will be simple, they'll take in an array of locations and just dispatch them to the Store.

We create actions by invoking `alt.createActions()` with the methods that will become the actions. Whatever 
value you return from these methods will be transparently sent through the dispatcher and onto the Stores. 

`actions/LocationActions.js`

```js
import alt from '../alt';

const LocationActions = {
  updateLocations(locations) {
    return locations;
  }
}

export default alt.createActions('LocationActions', LocationActions);
```

Quite frequently actions will be like this example, just forwarding the value to the dispatcher. 
We include a more convenient method for this case using a `generate` attribute. 

This is equivalent to our last example:

```js
import alt from '../alt';
export default alt.createActions('LocationActions', { generate: [ 'updateLocations' ] });
```

<div class="form-actions">
  <a class="btn btn-primary" href="./stores">Next: Creating a Store</a>
</div>