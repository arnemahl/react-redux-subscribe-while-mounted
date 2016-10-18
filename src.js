
store.injectWhileMounted = (reactComp, property) => {
    // Ensure component has a state before initial render
    if (!reactComp.state) {
        reactComp.state = {};
    }

    // Automatically setState with specified property
    reactComp.setState = reactComp.setState.bind(reactComp);

    const setCompState = () => {
        reactComp.setState({
            [property]: store.getState()[property]
        });
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
