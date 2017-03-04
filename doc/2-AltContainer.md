---
layout: default
title: AltContainer
permalink: /doc/AltContainer
description: Encapsulate your components to pass Storage state as properties
categories: [doc]
---

AltContainer is a component that listens to changes in your Stores, passing the store state as properties
to other child components. These children components just render markup and are not aware of where the data comes from,
making them highly reusable:

```js
// store state will be injected to SomeComponent as properties
<AltContainer store={ testStore }>
  <SomeComponent />
</AltContainer>
```

A full example follows:

```js
import alt from '../alt';
import Store from 'alt-ng/Store';
import AltContainer from 'alt-ng/AltContainer';
import React from 'react';

// create your actions
const actions = alt.createActions({ generate: [ 'setName', 'setAge' ]});

// create a dummy store
class TestStore extends Store {

  constructor() {
    super();
    this.bindActions(actions);
  }

  setName(name) {
    this.setState({ name })
  }

  setAge(age) {
    this.setState({ age })
  }

}
const store = alt.createStore('TestStore', new TestStore());

// this component will just render the data passed as properties
function UserDataComponent(props) {
  return (
    <section>
      <h1>User data</h1>
      <p>Name: {props.name}</p>
      <p>Age: {props.age}</p>
    </section>
  )
} 

class AppComponent extends React.Component {

  render() {
    return (
      <AltContainer store={ store }>
        <UserDataComponent />
      </AltContainer>
  }

}
```

## mergeFunc

When specifying multiple stores, store state will be merged and the result passed as properties. You can customize how the state 
is merged by passing a mergeFunc property.

```js
// just the default behavior
function mergeFunc(stores) {
  return stores.reduce(function(state, store) {
    return Object.assign(state, store.getState());
  }, {});
}

<AltContainer stores={ [store1, store2] } mergeFunc={mergeFunc}>
  <UserDataComponent />
</AltContainer>
```

## element

`AltContainer` will use a `div` element as parent by default, but you can override that by passing an `element` property. Any properties 
assigned to `AltContainer` will be assigned to this element. 

This component:

```js
<AltContainer store={ store } element="aside" id="current-user" className="left-info">
  <UserDataComponent />
</AltContainer>
``` 

Will generate the following HTML:

```js
<aside id="current-user" class="left-info">
  <section>
    <h1>User data</h1>
    <p>Name: John Doe</p>
    <p>Age: 24</p>
  </section>
</aside>
```
