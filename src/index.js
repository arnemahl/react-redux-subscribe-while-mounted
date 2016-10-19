const packageName = 'subscribeWhileMounted';

const string = (value) => typeof value === 'string' && !!value;
const func = (value) => typeof value === 'function';
const undef = (value) => typeof value === 'undefined';
const nonEmptyArrayOf = (validator) => (array) => Array.isArray(array) && array.length !== 0 && array.every(v => validator(v));
const oneOfType = (possibleTypes) => (value) => possibleTypes.some(type => type(value));

const validReactComponent = comp => comp && comp.constructor && comp.constructor.name === 'Component' && func(comp.setState);
const validProps = oneOfType([ string, nonEmptyArrayOf(string)] );
const validCallback = oneOfType([ undef, func ]);

module.exports = store => (reactComp, oneOrMoreProps, optionalCallback) => {
    // Validate input
    if (!validReactComponent(reactComp)) {
        throw new Error(`${packageName} received a first parameter of type '${typeof reactComp}'. First parameter must be a React Component.`);
    }
    if (!validProps(oneOrMoreProps)) {
        throw new Error(`${packageName} received a second parameter of type '${typeof oneOrMoreProps}'. Second parameter must be string or array of strings.`);
    }
    if (!validCallback(optionalCallback)) {
        throw new Error(`${packageName} received a third parameter of type '${typeof optionalCallback}'. Third parameter must be undefinded or function.`);
    }

    // Decide properties
    const properties = (
        Array.isArray(oneOrMoreProps) && oneOrMoreProps ||
        typeof oneOrMoreProps === 'string' && [oneOrMoreProps]
    );
    console.log('oneOrMoreProps:', oneOrMoreProps); // DEBUG
    console.log('properties:', properties); // DEBUG

    // Check that all properties to subscribe to exist in store's state
    const initStoreState = store.getState();
    const propIsMissing = prop => typeof initStoreState[prop] !== 'object';

    if (properties.some(propIsMissing)) {
        const missingProps = properties.filter(propIsMissing);
        const single = missingProps.length === 1;
        console.log('missingProps:', missingProps); // DEBUG

        throw new Error(
            `${packageName} can only subscribe to changes from the store's reducers. ` +
            `'${missingProps.join(`' and '`)}' ${single ? 'is not an object' : 'are not objects'} in the store's initial state.`
        );
    }

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
