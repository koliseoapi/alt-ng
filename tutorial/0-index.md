---
layout: default
title: Getting Started
description: Learn about flux and alt
permalink: /tutorial/
categories: [tutorial]
---

# Getting Started

`alt-ng` is a library that facilitates the managing of state within your JavaScript applications. It is modeled after flux.

Flux is an application architecture for building complex user interfaces. It modifies MVC in favor of unidirectional data flow. 
What this means is that data enters through a single place (your Actions) and then flow outward through a dispatcher to the state manager 
(the Store) and finally onto the view. The view can typically start new flows by calling Actions in response to user input.

For this tutorial you should be familiar with [React](https://facebook.github.io/react/), [Flux](http://facebook.github.io/flux/) 
and a subset of [ES6](https://people.mozilla.org/~jorendorff/es6-draft.html). We'll also assume that you are on a modern browser or preprocessing 
your code using Babel or similar. 

## Creating your first project

Structuring your code is an extremely opinionated decision. For this tutorial we will be using a simple folder structure:

```txt
your_project
|--actions/
|  |--MyActions.js
|--stores/
|  |--MyStore.js
|--components/
|  |--MyComponent.js
|--alt.js
|--app.js
```

You can just install `alt-ng`:

```sh
npm install --save alt-ng
```

We will create a very simple application with a list of travel destinations. The first step is to create an instance of alt. 
This instance will provide with methods to create Actions and Stores. We'll be referring back to this file throughout this guide.

For this example we will be exporting a singleton instance. In the root of your project, create a new file called `alt.js`:

```js
import Alt from 'alt-ng';
export default new Alt();
```

<div class="form-actions">
  <a class="btn btn-primary" href="./actions">Next: Creating Actions</a>
</div>
