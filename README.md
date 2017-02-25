# alt-ng

[![Build Status](https://secure.travis-ci.org/koliseoapi/alt-ng.svg?branch=master)](http://travis-ci.org/koliseoapi/alt-ng)
[![Coverage Status](https://img.shields.io/coveralls/koliseoapi/alt-ng.svg?style=flat)](https://coveralls.io/r/koliseoapi/alt-ng)
[![JS.ORG](https://img.shields.io/badge/js.org-alt-ffb400.svg?style=flat-square)](http://js.org)

[![NPM](https://nodei.co/npm/alt-ng.png?downloads=true)](https://nodei.co/npm/alt-ng/)

alt-ng is a project that builds on the excellent work of the [alt project](http://alt.js.org), to keep evolving the platform. Check out the
[API Reference](http://alt-ng.js.org/) for full in-depth docs. For a high-level walkthrough on flux, take a look at the
[Getting Started](http://alt-ng.js.org/tutorial/) guide.

<a href="https://js.org" target="_blank" title="JS.ORG | JavaScript Community">
<img src="https://logo.js.org/dark_horz.png" width="102" alt="JS.ORG Logo"/></a>
<!-- alternatives [bright|dark]_[horz|vert|tiny].png (width[horz:102,vert:50,tiny:77]) -->

### Why you should be using Alt

* **new** Promises can just be used from Actions
* **Lightweight** A lot of code has been removed to make it leaner and better
* Removes all the boilerplate of traditional Flux frameworks (constants and switch statements)
* It's flux [flux](http://facebook.github.io/flux/docs/overview.html) in the end. Stores have no setters, and the flow is unidirectional.
* Works on the client and server side (also with react-native).
* Actively maintained and being used in production.
* Extremely [flexible](#flexibility) and unopinionated in how you use flux. Create traditional singletons or use dependency injection.
* Based on ES6 classes


Notes: We follow [Flux Standard Action](https://github.com/acdlite/flux-standard-action/) except for error handling. that we pass directly in the meta object since [error could be more than a boolean](https://github.com/acdlite/flux-standard-action/issues/17).


## TL;DR

* Isomorphic
* Pure Flux
* No constants
* No static string checking
* No giant switch statement
* Save state snapshots
* Rollbacks
* Bootstrap components on app load
* Light-weight and terse
* Flexible
* No direct setters on stores
* Single dispatcher
* Global listening for debugging
* Small library

## License

[![MIT](https://img.shields.io/npm/l/alt.svg?style=flat)](http://josh.mit-license.org)
