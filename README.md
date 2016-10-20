# react-redux-subscribe-while-mounted

A utility method to make it easier to subscribe to a Redux store from a React component.

*Coming right up:*

* [Installation](#installation)
* [Usage](#usage)
* [Benefits](#benefits)
* [Inspiration](#inspiration)

*Other resources:*

* [Examples](EXAMPLES.md)
* [API documentation](API.md)




## Installation

Available through npm:

```
npm install react-redux-subscribe-while-mounted --save
```



## Usage

**Step 1:** Attatch the method to your store

```js
const store = ... // create your store;

store.subscribeWhileMounted = require('react-redux-subscribe-while-mounted')(store);
```

**Step 2:** Use the method inside React components to subscribe to your store

```js
class MyComponent extends React.Component {
    componentWillMount() {
        store.subscribeWhileMounted(this);
    }
    render() {
        // this.state now contains all the properties in the store
        ...
    }
}
```

**Step 3:** Variations

`subscribeWhileMounted` can be called with different parameters, see the [API documentation](API.md) for further explanation. For different ways to use `subscribeWhileMounted`, see the [Examples](EXAMPLES.md).



## Benefits

`subscribeWhileMounted` does three things for you:

* Ensures the component has an initial state: the callback is always called at least once before `subscribeWhileMounted` returns.
    * Removes the need for explicitly creating an initial state
    * You don't have to worry about the order in which you subscribe and dispatch acitions that trigger state update.
* It lets you choose which properties you want to listen for updates to (one, many or all properties)
    * It only fires the callback when the relevant properties are updated, making it easier to reason about the changes.
* It automatically unsubscribes when `componentWillUnmount`
    * You don't need to write that extra code to make sure your components unsubscribe when they unmount.

These features means that you can write less, more readable code to subscribe to the store.

As a side effetc, because subscribing to the store is typically a bit tedious, we often pass the state as props between components. The simpler syntax removes the need for that.

* By not passing store state as props from component to component we reduce noise in the code, making the remaining code more readable.
* By explicitly listening to the (relevant parts of) the store in the components that need it, we express a more explicit relationship between the definition of the data (in the store) and the presetation of it (in the React component).
* You might also decide to move more state management into the store/actions, which is a great thing, because that is what Redux is for!


## Inspiration

This uitility is inspired by the simplicity of subscribing (listening) to a [Pockito](https://github.com/arnemahl/pockito) store. If you're starting a new project, check it out. [Pockito can be a valid contender to Redux](https://github.com/arnemahl/pockito/blob/master/Pockito_vs_Redux.md) for many projects.
