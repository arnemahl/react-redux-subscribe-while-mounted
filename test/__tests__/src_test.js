jest.unmock('../../src/index.js');

import createMethod_subscribeWhileMounted from '../../src';

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
            }
        }
        this.subscribeWhileMounted = createMethod_subscribeWhileMounted(this);
    }
}

describe('subscribeWhileMounted', () => {

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

        expect(getArgumentError(() => store.subscribeWhileMounted(component))).toBe("Second argument");
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
});
