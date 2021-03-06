jest.unmock('../../lib/index.js');

import createMethod_subscribeWhileMounted from '../../lib';

class Component {
    setState = (state) => {
        this.state = state;
    }
}

class Store {
    subscribers = [];

    subscribe = (fn) => {
        this.subscribers.push(fn);

        return () => {
            this.subscribers = this.subscribers.filter(f => f !== fn);
        }
    }
    getState = () => {
        return this.state;
    }
    changeState = (state) => {
        this.state = {
            ...this.state,
            foo: {
                data: 'new value'
            }
        };
        this.subscribers.forEach(fn => fn());
    }
    constructor() {
        this.state = {
            foo: {
                data: 'bar'
            },
            lol: {
                data: ':D'
            }
        };
        this.subscribeWhileMounted = createMethod_subscribeWhileMounted(this);
    }
}

describe('subscribeWhileMounted (lib)', () => {

    it('always ensures component has state', () => {
        const store = new Store();
        const component = new Component();

        store.subscribeWhileMounted(component, 'foo');

        expect(typeof component.state).toBe('object');
    });

    it('throws error when receiving arguments of invalid type', () => {
        const getArgumentError = fn => {
            try {
                fn();
                return 'No error';
            } catch (error) {
                return error.message.split('. ')[1].split(' must')[0];
            }
        }

        const store = new Store();
        const component = new Component();

        const prop = 'foo';
        const props = ['foo'];
        const fn = () => {};

        expect(getArgumentError(() => store.subscribeWhileMounted({}, 'foo'))).toBe("First argument");

        expect(getArgumentError(() => store.subscribeWhileMounted(component, 13))).toBe("Second argument");
        expect(getArgumentError(() => store.subscribeWhileMounted(component, {}))).toBe("Second argument");
        expect(getArgumentError(() => store.subscribeWhileMounted(component, []))).toBe("Second argument");
        expect(getArgumentError(() => store.subscribeWhileMounted(component, [null]))).toBe("Second argument");

        expect(getArgumentError(() => store.subscribeWhileMounted(component, prop, null))).toBe("Third argument");
        expect(getArgumentError(() => store.subscribeWhileMounted(component, props, {}))).toBe("Third argument");
    });

    it('throws error when subscribing to missing props', () => {
        const getError = (fn) => {
            try {
                fn();
                return 'No error';
            } catch (error) {
                return 'Error';
            }
        };
        const store = new Store();
        const component = new Component();

        expect(getError(() => store.subscribeWhileMounted(component, '404'))).toBe('Error');
        expect(getError(() => store.subscribeWhileMounted(component, ['foo', '404']))).toBe('Error');
    });

    it('can omit property filter (subscribe to everything, always pass entire state)', () => {
        const store = new Store();
        const component = new Component();

        store.subscribeWhileMounted(component);

        expect(component.state.foo.data).toBe('bar');
    });

    it('sets component state with correct initial state', () => {
        const store = new Store();
        const component = new Component();

        store.subscribeWhileMounted(component, 'foo');

        expect(component.state.foo.data).toBe('bar');
    });

    it('updates component state correctly upon change', () => {
        const store = new Store();
        const component = new Component();

        store.subscribeWhileMounted(component, 'foo');
        store.changeState();

        expect(component.state.foo.data).toBe('new value');
    });

    it('unsubscribes on componentWillUnmount', () => {
        const store = new Store();
        const component = new Component();

        store.subscribeWhileMounted(component, 'foo');

        expect(component.state.foo.data).toBe('bar');

        component.componentWillUnmount();

        store.changeState();

        expect(component.state.foo.data).toBe('bar');
    });

    it('calls original componentWillUnmount', () => {
        const store = new Store();
        const component = new Component();

        let ans = 'it did not get called';

        component.componentWillUnmount = () => ans = 'it got called';

        store.subscribeWhileMounted(component, 'foo');
        component.componentWillUnmount();

        expect(ans).toBe('it got called');
    });

    it('allows specifying another callback fuction', () => {
        const store = new Store();
        const component = new Component();

        let state;

        const callback = (_state) => state = _state;

        store.subscribeWhileMounted(component, 'foo', callback);

        expect(state.foo.data).toBe('bar');
    });

    it('only passes updated props to callback', () => {
        const store = new Store();
        const component = new Component();

        let lastUpdate;

        const callback = (updates) => lastUpdate = updates;

        store.subscribeWhileMounted(component, ['foo', 'lol'], callback);

        expect(lastUpdate.foo.data).toBe('bar');
        expect(lastUpdate.lol.data).toBe(':D');

        store.changeState();

        expect(lastUpdate.foo.data).toBe('new value');
        expect(lastUpdate.lol).toBe(void 0);
    });

    it('only fires callback when there are updates', () => {

        const store = new Store();
        const component = new Component();

        let lastUpdate;

        const callback = (updates) => lastUpdate = updates;

        store.subscribeWhileMounted(component, 'lol', callback);
        expect(lastUpdate.lol.data).toBe(':D');

        lastUpdate = 'not called again';
        store.changeState();
        expect(lastUpdate).toBe('not called again');
    });

    it('passes entire state as a second argument to callback', () => {
        const store = new Store();
        const component = new Component();

        let state;
        let entireState;

        const callback = (_state, _entireState) => {
            state = _state;
            entireState = _entireState;

            expect(!!entireState ? 'present' : 'absent').toBe('present');
        }

        store.subscribeWhileMounted(component, ['foo', 'lol'], callback);
        store.changeState();

        expect(state.foo.data).toBe('new value');
        expect(state.lol).toBe(void 0);
        expect(entireState.lol.data).toBe(':D');
    });
});
