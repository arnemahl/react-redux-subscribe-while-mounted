
store.injectWhileMounted = (reactComp, oneOrMoreProps) => {
    const properties = (
        Array.isArray(oneOrMoreProps) && oneOrMoreProps ||
        typeof oneOrMoreProps === 'string' && [oneOrMoreProps]
    );

    if (!properties) {
        throw new Error(`injectWhileMounted received an invalid argument "oneOrMoreProps" of type ${typeof oneOrMoreProps}, should be string or array of strings`);
    }

    // Automatically setState with specified properties
    reactComp.setState = reactComp.setState.bind(reactComp);

    const setCompState = () => {
        const storeState = store.getState();

        const componentStateUpdate = properties.reduce((obj, prop) => {
            return {
                [prop]: storeState[prop],
                ...obj
            };
        }, {});

        reactComp.setState(componentStateUpdate);
    };

    setCompState();
    const unsubscribe = store.subscribe(setCompState);

    // Automatically un-subscribe before un-mounting
    const cwun_original = reactComp.componentWillUnmount;

    reactComp.componentWillUnmount = () => {
        unsubscribe();
        cwun_original && cwun_original();
    };
};
