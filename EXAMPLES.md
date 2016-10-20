# Examples

The purpose of these examples is to help understand how `subscribeWhileMounted` works, and to give you some ideas of how it can benefit your project.


### About the examples

`subscribeWhileMounted` should be called from within a React component, typically in `componentWillMount`.

```js
class MyComponent extends React.Component {
    componentWillMount() {
        store.subscribeWhileMounted(this);
    }
    ...
```

For simplicity, in the remaining examples we will be omitting the code to show that it is called from within a React component:

```js
store.subscribeWhileMounted(this)
```

### Subscribing to the entire state

```js
store.subscribeWhileMounted(this);
```

This code will update the component state with the entire store state on each store update.


### Subscribing to a specific property

```js
store.subscribeWhileMounted(this, 'foo');
```

This code will update state when and only when `foo` in the store state is updated. An object containing only `foo` will be then be supplied to `setState`.


### Subscribing to multiple properties

```js
store.subscribeWhileMounted(this, ['foo', 'bar']);
```

Similar to [Subscribing to a specific property](#subscribing-to-a-specific-property), but `subscribeWhileMounted` will look for updates in both `foo` and `bar`. On each update, `setState` will be called with an object containing only the updated property (either `foo` or `bar`). Initially, both `foo` and `bar` are set to component state, so they are both guaranteed to be in components state at initial render.


### Subscribing with a custom callback: renaming properties

```js
store.subscribeWhileMounted(this, 'foo', ({foo}) => {
    this.setState({
        anotherName: foo
    });
}
render() {
    this.state.anotherName === store.foo // true
}
```

This code takes the property `foo` of the store state and sets it as `anotherName` in it's own state.


### Subscribing with a custom callback: call action upon state change

```js
store.subscribeWhileMounted(this, 'foo', ({foo}) => {
    if (foo.needForAction) {
        store.dispatch(doSomeAtion());
    }

    this.setState({ foo });
}
```

This code checks whether the updated state of `foo` implies a need to dispatch an action, and does so if necessary. (On each update, the component sets `foo` to it's state.)

For example, we can use this to trigger network calls if the data has not yet been fetched.


### Subscribing with a custom callback: combining states

```js
store.subscribeWhileMounted(this, ['foo', 'bar'], (updates, state) => {
    const foo === updates.foo || state.foo;
    const bar === updates.bar || state.bar;

    if (foo.data && bar.selected) {
        this.setState({
            foobar: foo.data[bar.selected]
        });
    } else {
        this.setState({
            foobar: null
        });
    }
}
```

This code creates a state `foobar` based on the state of `foo` and `bar`. This can sometimes be handled in the reducers alone, but in some cases that gets overly complicated. This method provides a simple alternative.
