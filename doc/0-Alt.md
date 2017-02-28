---
layout: default
title: Alt 
permalink: /doc/
categories: [doc]
---

# Creating instances of Alt

Though a common practice for its convenience, you are not forced to settle for traditional singleton instances with alt. You can create separate instances of the Alt class and then inject these into your view via contexts or dependency injection. This approach is particularly interesting for the server side, where each request can carry its own instance.

```js
import Alt from 'alt-ng';

const alt = new Alt();
export default alt;
```

# AltClass

### Alt#constructor

> constructor() : Alt

Creates an Alt instance

# Integrating with React

You have three options for passing your alt instance through to your React components. The most common way is just exporting a singleton instance 
like you can see in the example above, but you can also pass it manually through props or using the React context.

```js
import Alt from 'alt-ng';
const alt = new Alt();

class MyApplicationComponent extends React.Component {
  render() {
    return (
      <div>
        <MySuperCoolComponent alt={this.props.alt} />
      </div>
    )
  }
}


<MyApplicationComponent alt={alt} />
```

You can read more about [AltContainer here](/doc/AltContainer).
