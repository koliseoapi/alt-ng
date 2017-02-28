---
layout: default
title: AltContainer
description: Higher-order container components for handling store state
permalink: /tutorial/alt-container
categories: [tutorial]
---

# AltContainer

In the previous section we described a solution that mixes state and render. This works, but is generally 
a bad idea because it makes it more difficult to reuse view-specific code. 

Your React components should be split up into two types: those that manage state (stateful components) and 
those that just deal with the display of data (pure components), also called 
[smart/dumb components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0).

The goal is to design stateless components that accept properties and are only responsible for 
rendering into a view. This makes it easier to test and reuse those components. 

A pure LocationsComponent component would look like this (using 
[functional components](https://facebook.github.io/react/docs/components-and-props.html)):

```js
function LocationsComponent(props) {
  return (
    <ul>
      {
        props.locations.map(function(location, index) => {
          return <li key={index}>{location.name}</li>
        })
      }
    </ul>
  );
}
```

This component is simpler because it does not depend on state changes. In this case, state must be managed 
by a wrapping container component. `AltContainer` is a component you can use to declaratively connect a Store to the pure components.

```js
import locationStore from '../stores/LocationStore';

function LocationsWrapper() {
  return (
    <AltContainer store={ locationStore }>
      <LocationsComponent />
    </AltContainer>
  )
}
```

`AltContainer` will automatically listen and unlisten to changes in your Store. When a change happens, AltContainer will trigger 
a re-render of the children components, passing the new state as properties. In the case of multiple stores, the states will be merged
befre passing them as properties.

With this design the wrapped component can now be re-used in other places, since it's not tied to a particular Store. All it will 
do is accept a list of locations and render them. `AltContainer` handles the listening and unlistening of your Stores. 

<div class="form-actions">
  <a class="btn btn-primary" href="./promises">Next: Working with Promises</a>
</div>