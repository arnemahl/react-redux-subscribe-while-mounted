#API

This package contains only one methods, however it can be called with different arguments.


## Method syntax

`new subscribeWhileMounted(reactComponent[, oneOrMorePropNames[, callback]])`

#### Parameters

* **reactComponent:** Must be a React component (or at least it must have a `setState` function, if you want to get hacky)
* **oneOrMorePropNames:** _Optional_. Name the property or properties you want to subscribe to. See [Second argument](#second-argument) for details.
* **callback:** _Optional_. A callback method taking two arguments:
    * **stateUpdates:** An object containing the properties of the store which were updated (or all properties if *oneOrMorePropNames* is undefined).
    * **entireState:** An object containing the entire store state (this argument is omitted if *oneOrMorePropNames* is undefined).


#### Second argument

The second argument passed to `subscribeWhileMounted` must be either undefined (either omitted or by passing `void 0`) or a string or an array of strings.

If the second argument is a string or an array of strings, each string must be names of properties of the store state. Trying to subscribe to something that is not in the store state is typically a but, and `subcribeWhileMounted` will let you know by throwing an Error.


## Retroactive listener

`subscribeWhileMounted` is retroactive, and will call the callback at least once before it returns.


#### Examples

Check out the [Examples](EXAMPLES.md) for different ways to use `subscribeWhileMounted`.
