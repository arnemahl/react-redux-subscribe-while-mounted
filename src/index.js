const packageName = 'subscribeWhileMounted';

const string = (value) => typeof value === 'string' && !!value;
const func = (value) => typeof value === 'function';
const undef = (value) => typeof value === 'undefined';
const nonEmptyArrayOf = (validator) => (array) => Array.isArray(array) && array.length !== 0 && array.every(v => validator(v));
const oneOfType = (possibleTypes) => (value) => possibleTypes.some(type => type(value));

const validReactComponent = comp => comp && func(comp.setState) && oneOfType([undef, func])(comp.componentWillUnmount);
const validProps = oneOfType([ undef, string, nonEmptyArrayOf(string)] );
const validCallback = oneOfType([ undef, func ]);

module.exports = store => (reactComp, oneOrMoreProps, optionalCallback) => {
    // Validate input
    if (!validReactComponent(reactComp)) {
        throw new Error(`${packageName} received a first argument of type '${typeof reactComp}'. First argument must be a React Component.`);
    }
    if (!validProps(oneOrMoreProps)) {
        throw new Error(`${packageName} received a second argument of type '${typeof oneOrMoreProps}'. Second argument must be a string, an array of strings or undefined.`);
    }
    if (!validCallback(optionalCallback)) {
        throw new Error(`${packageName} received a third argument of type '${typeof optionalCallback}'. Third argument must be a function or undefinded.`);
    }

    // Decide properties
    const properties = (
        Array.isArray(oneOrMoreProps) && oneOrMoreProps ||
        typeof oneOrMoreProps === 'string' && [oneOrMoreProps] ||
        typeof oneOrMoreProps === 'undefined' && false
    );

    // Check that all properties to subscribe to exist in store's state
    const initStoreState = store.getState();
    const propIsMissing = prop => typeof initStoreState[prop] !== 'object';

    if (properties && properties.some(propIsMissing)) {
        const missingProps = properties.filter(propIsMissing);
        const single = missingProps.length === 1;

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
    const notifyOfUpdates = properties
        ? getMethodToNotifyOnUpdatesToSelectedProperties(store, properties, callback, !!optionalCallback)
        : getMethodToNotifyOnAnyUpdates(store, callback);

    // Notify callback once and on each update
    notifyOfUpdates();
    const unsubscribe = store.subscribe(notifyOfUpdates);

    // Automatically un-subscribe before un-mounting
    const {componentWillUnmount: cwun} = reactComp;
    reactComp.componentWillUnmount = getNewComponentWillUnmount(unsubscribe, cwun ? cwun.bind(reactComp) : () => {});
};

function getMethodToNotifyOnUpdatesToSelectedProperties(store, properties, callback, passEntireStateAsSecondArgument) {
    let lastStates = {};

    return () => {
        const storeState = store.getState();

        const updates = Object.keys(storeState)
            .filter(key => properties.indexOf(key) !== -1)
            .filter(key => {
                const isUpdated = lastStates[key] !== storeState[key];

                lastStates[key] = storeState[key];

                return isUpdated;
            })
            .reduce((obj, key) => {
                return {
                    ...obj,
                    [key]: storeState[key]
                }
            }, {});

        if (Object.keys(updates).length !== 0) {
            if (passEntireStateAsSecondArgument) {
                callback(updates, storeState);
            } else {
                callback(updates);
            }
        }
    }
}

const getMethodToNotifyOnAnyUpdates = (store, callback) => () => callback(store.getState());

const getNewComponentWillUnmount = (unsubscribe, componentWillUnmount) => () => {
    unsubscribe();
    componentWillUnmount && componentWillUnmount();
};
