# alt-ng

[![Build Status](https://secure.travis-ci.org/koliseoapi/alt-ng.svg?branch=master)](http://travis-ci.org/koliseoapi/alt-ng)
[![Coverage Status](https://coveralls.io/repos/github/koliseoapi/alt-ng/badge.svg?branch=master)](https://coveralls.io/github/koliseoapi/alt-ng?branch=master)
<a href="https://www.npmjs.com/package/alt-ng"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/alt-ng.svg?maxAge=43200"></a>

`alt-ng` is a Flux implementation that removes all the boilerplate traditionally associated to managing data. `alt-ng` is based on JavaScript classes, does not use
switch statements and supports Promises out-of-the-box. Check out
[the tutorial](http://alt-ng.koliseo.com/tutorial/), or jump straight into the [documentation](http://alt-ng.koliseo.com/doc/).

### Features of alt-ng

- [Promises](http://alt-ng.koliseo.com/tutorial/promises) are first class citizens
- **Lightweight**: A lot of code has been removed from the original alt implementation to make it even more lightweight
- **No constants or switch statements**: Removes all the boilerplate of traditional Flux frameworks
- **Unidirectional flow of information**: Enforces the basic principles in [flux](http://facebook.github.io/flux/docs/overview.html)
- Follows the [Flux Standard Action](https://github.com/acdlite/flux-standard-action/) standard.
- Designed to work in both the **client and server side**
- Actively maintained and being used in production.
- Based on ES6 classes

## Code example

With `alt-ng`, action results are automatically dispatched to methods in the stores:

`alt.js`

```js
import Alt from "alt-ng";

// create our singleton instance
export default new Alt();
```

`UserActions.js`

```js
import alt from './alt';

// Mock remote API
// The real thing would connect to the server using Fetch API or a polyfill
const MyUserApi = {
  fetch: function(userId) {
    console.log(`Retrieving user ${userId}`);
    return Promise.resolve({
      id: userId,
      name: `User ${userId}`
    });
  },
  save: function(user) {
    console.log(`Saving user ${user.id}`);
    return Promise.resolve(user);
  }
}

export default alt.createActions('UserActions', {

  // Promises are transparently resolved before dispatching to the Store
  fetchUser: function(userId) => {
    return MyUserApi.fetch(userId);
  }

  // more Promises
  saveUser: function(user) => {
    return MyUserApi.save(user);
  }

  // other values are dispatched directly to the Store
  onChange: function(attributeName, value) {
    let value = {};
    value[attributeName] = value;
    return value;
  }

})
```

The action methods will be used as constants while binding.

`UserStore.js`

```js
import alt from './alt';
import UserActions from './UserActions';
import Store from 'alt-ng/Store';

// This Store will contain the User that is being edited right now as its 'state' attribute.
// The Store methods will be notified when the actions are dispatced
class UserStore extends Store {

  constructor() {
    this.state = {
      user: undefined
    };
    this.bindActions(UserActions);
  }

  fetchUser(user) {
    this.setState({ user });
  }

  saveUser(user) {
    this.setState({ user });
  }

  onChange(userField) {
    this.setState({
      user: Object.assign(this.getState().user, userField))
    });
  }

}
const userStore = alt.createStore('UserStore', new UserStore());
export { userACtions, userStore };
```

The easiest way to use this Store is to inject state as properties to the view:

```js
import UserStore from "./UserStore";
import UserACtions from "./UserActions";
import AltContainer from "alt-ng/AltContainer";
import React from "react";

class UserData extends React.Component {
  constructor() {
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    UserActions.onChange(e.name, e.value);
  }

  onSubmit(e) {
    e.preventDefault();
    // after a successful page save, send the browser somewhere else
    UserActions.save(this.props.user).then(() => {
      location.href = "/users";
    });
  }

  render() {
    const user = this.props.user;
    return (
      <form onSubmit={this.onSubmit}>
        <label>
          Name:
          <input name="name" value={user.name} onChange={this.onChange} />
        </label>
        <button type="submit" />
      </form>
    );
  }
}

class MyApp extends React.Component {
  render() {
    // inject userStore.state as UserData.props
    return (
      <AltContainer store={userStore}>
        <UserData />
      </AltContainer>
    );
  }
}
```

You can get the full story by reading
[the tutorial](http://alt-ng.koliseo.com/tutorial/) or the [documentation](http://alt-ng.koliseo.com/doc/).

## License

Licensed under [the MIT license](https://github.com/koliseoapi/alt-ng/blob/master/LICENSE)

`alt-ng` is based on the great job by Josh Perez, the original author of [Alt](https://github.com/goatslacker/alt)
