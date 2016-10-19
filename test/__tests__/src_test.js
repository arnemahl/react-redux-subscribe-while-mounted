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
            undef: void 0,
            foo: 'bar'
        }
    }
}

const store = new Store();

store.subscribeWhileMounted = createMethod_subscribeWhileMounted(store);

describe('subscribeWhileMounted', () => {

    it('always ensures component has state', () => {
        const component = new Component();

        console.log(component);

        store.subscribeWhileMounted(component, 'undef');

        expect(typeof component.state).toBe('object');
    });
});
