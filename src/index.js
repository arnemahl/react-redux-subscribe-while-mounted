const packageName = 'subscribeWhileMounted';

const string = (value) => typeof value === 'string' && !!value;
const func = (value) => typeof value === 'function';
const undef = (value) => typeof value === 'undefined';
const arrayOf = (validator) => (value, l, p) => Array.isArray(value) && value.every(v => validator(v, l, p));
const oneOfType = (possibleTypes) => (value) => possibleTypes.some(type => type(value));

const validReactComponent = comp => comp && comp.constructor && comp.constructor.name === 'Component';
const validProps = oneOfType([ string, arrayOf(string)] );
const validCallback = oneOfType([ undef, func ]);

module.exports = store => (reactComp, oneOrMoreProps, optionalCallback) => {
    // Validate input
    if (!validReactComponent(reactComp)) {
        throw new Error(`${packageName} received a first parameter of type '${typeof reactComp}'. First parameter should be a React Component!`);
    }
    if (!validProps(oneOrMoreProps)) {
        throw new Error(`${packageName} received a second parameter of type '${typeof oneOrMoreProps}'. Second parameter should be string or array of strings!`);
    }
    if (!validCallback(callback)) {
        throw new Error(`${packageName} received a third parameter of type '${typeof optionalCallback}'. Third parameter should be undefinded or function!`);
    }

    // Initialize component state, if necessary
    if (!reactComp.state) {
        reactComp.state = {};
    }

    // Decide properties
    const properties = (
        Array.isArray(oneOrMoreProps) && oneOrMoreProps ||
        typeof oneOrMoreProps === 'string' && [oneOrMoreProps]
    );

    // Decide callback
    const callback = typeof optionalCallback === 'function'
        ? optionalCallback
        : reactComp.setState.bind(reactComp);

    // Notifier function
    let lastStates = {};

    const notifyOfUpdates = () => {
        const storeState = store.getState();

        const updates = Object.keys(storeState)
            .filter(key => oneOrMoreProps.indexOf(key) !== -1)
            .filter(key => {
                const isUpdated = lastStates[key] !== storeState[key];

                lastStates[key] === storeState[key];

                return isUpdated;
            })
            .map((obj, key) => {
                return {
                    ...obj,
                    [key]: storeState[key]
                }
            }, {});

        if (Object.keys(updates).length !== 0) {
            callback(updates);
        }
    };

    // Notify callback once and on each update
    notifyOfUpdates();
    const unsubscribe = store.subscribe(notifyOfUpdates);

    // Automatically un-subscribe before un-mounting
    const cwun_original = reactComp.componentWillUnmount;

    reactComp.componentWillUnmount = () => {
        unsubscribe();
        cwun_original && cwun_original();
    };
};
