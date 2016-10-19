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
        return {
            foo: {}
        }
    }
}

const store = new Store();

store.subscribeWhileMounted = createMethod_subscribeWhileMounted(store);

describe('subscribeWhileMounted', () => {

    it('always ensures component has state', () => {
        const component = new Component();

        console.log(component);

        store.subscribeWhileMounted(component, 'foo');

        expect(typeof component.state).toBe('object');
    });

    it('throws error when receiving parameters of invalid type', () => {
        const getParamError = fn => {
            try {
                fn();
                return 'No error';
            } catch (error) {
                return error.message.split('. ')[1].split(' must')[0];
            }
        }

        const component = new Component();
        const prop = 'foo';
        const props = ['foo'];
        const fn = () => {};

        expect(getParamError(() => store.subscribeWhileMounted({}, 'foo'))).toBe("First parameter");

        expect(getParamError(() => store.subscribeWhileMounted(component))).toBe("Second parameter");
        expect(getParamError(() => store.subscribeWhileMounted(component, {}))).toBe("Second parameter");
        expect(getParamError(() => store.subscribeWhileMounted(component, []))).toBe("Second parameter");
        expect(getParamError(() => store.subscribeWhileMounted(component, [null]))).toBe("Second parameter");

        expect(getParamError(() => store.subscribeWhileMounted(component, prop, null))).toBe("Third parameter");
        expect(getParamError(() => store.subscribeWhileMounted(component, props, {}))).toBe("Third parameter");
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
        const component = new Component();

        expect(getError(() => store.subscribeWhileMounted(component, '404'))).toBe('Error');
        expect(getError(() => store.subscribeWhileMounted(component, ['foo', '404']))).toBe('Error');
    });
});
