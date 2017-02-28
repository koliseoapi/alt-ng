---
layout: default
title: Connecting a View
description: How to connect React components with your Alt Store
permalink: /tutorial/views
categories: [tutorial]
---

# Connecting your React Component

This part is more about React than Alt. The important part is how you listen to Stores and get data out of it.

Every alt Store has a `getState()` method to return its state. Our component will fetch the Store state 
on creation and register for any changes that may be triggered afterwards.

```js
import React from 'react';
import LocationStore from '../stores/LocationStore';

class LocationsComponent extends React.Component {

  constructor() {
    this.state = LocationStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    // register for changes in state
    this.sub = LocationStore.subscribe(this.onChange);
  }

  componentWillUnmount() {
    // unregister listener
    this.sub.dispose();
  }

  onChange(state) {
    this.setState(state);
  }

  render() {
    return (
      <ul>
        {
          this.state.locations.map(function(location, index) => {
            return <li key={index}>{location.name}</li>
          })
        }
      </ul>
    );
  }

}

export default LocationsState;
```

This is a bit messy, and we can do better. In the next step we will see how to render data 
using `this.props` instead of `this.state` using `AltContainer`. 

<div class="form-actions">
  <a class="btn btn-primary" href="./alt-container">Next: AltContainer</a>
</div>