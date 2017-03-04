---
layout: default
title: Migrating from Alt
permalink: /doc/migrating-from-alt
categories: [doc]
---

# Migrating from Alt

`alt-ng` is based in the original implementation of <a href="https://github.com/goatslacker/alt">Alt</a>, an open source project by Josh Perez. For existing Alt applications that are being migrated, these are the main differences that you should be aware of:

## Importing

* `alt-ng` requires importing specifically the files that you use (e.g. `import Store from 'alt-ng/Store'`). This avoids including `AltContainer` in your application if you are not using it.

## Alt

* `flush`, `save` and `load` have been removed from `Alt`. We encourage people to implement their own solutions adapted to their needs (see [Store initial state](/doc/Stores#initial-state)).
* The `config` argument of the Alt constructor has been removed. 
* `alt.createAsyncActions` and `alt.generateActions` hae been merged into a single `alt.createActions` method.

## Actions

* When an Action returns a Promise, it will run and the value resolved by the Promise will be dispatched to the Store handlers. The action method will still return the Promise, which [can be chained for testing purposes](/doc/Actions#promises).
* Actions are not classes, but plain JSON objects.

## Stores

* The `bootstrap` feature has been replaced with a [Store initial state pattern](/doc/Stores#initial-state)
* Lifecycle events in Stores have been removed with no replacement (`Store.on()` has been removed). Specifically, error handlers used to be able to silently catch exceptions while dispatching.

## AltContainer

* `alt-ng` will inject Storage state directly as properties to child entities, where `alt` used to inject the stores themselves.
* The original `AltContainer` implementation would detect if there is a single child, and generate no parent Element in this case. `alt-ng` will always generate a parent element.
* Originally `AltContainer` would pass any properties to its children. This implementation will only pass Store state, and use the properties only on [the parent Element](/doc/AltContainer#element).

