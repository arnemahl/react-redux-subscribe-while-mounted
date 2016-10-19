import {Validators} from 'pockito';

const packageName = 'react-redux-inject-while-mounted';

const {oneOfType, string, undef, function} = Validators;

const validReactComponent = comp => comp && comp.constructor && comp.constructor.name === 'Component';
const validProps = oneOfType([ string, arrayOf(string)] );
const validCallback = oneOfType([ undef, function ]);

module.exports = store => (reactComp, oneOrMoreProps, optionalCallback) => {
    // Validate input
    if (!validReactComponent(reactComp)) {
        throw new Error(`${packageName}: Received a first parameter of wrong type ${typeof oneOrMoreProps}, should be a React Component!`);
    }
    if (!validProps(oneOrMoreProps)) {
        throw new Error(`${packageName}: Received a second parameter of wrong type ${typeof oneOrMoreProps}, should be string or array of strings!`);
    }
    if (!validCallback(callback)) {
        throw new Error(`${packageName}: Received a third parameter of wrong type ${typeof optionalCallback}, should be undefinded or function!`);
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
