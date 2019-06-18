2. Redux Store Testing
--------------------------------

Status
------

Accepted

Context
-------

The frontend-app-payment repository is a critical piece of infrastructure (the checkout page), and thus has higher testing requirements than some of our other micro-frontends.  This ADR describes a method of writing Jest tests for the reducers, actions, and selectors that exercise the contracts between them.

Decision
--------

Each sub-module should have a redux.test.js file which exercises its reducers, actions, and selectors.

Method
======

The test should accomplish this by creating a redux store for the reducers.  If there are selectors to be tested, the reducer should be mounted to the store in the location expected by the selectors, as shown below.  (This is because the selectors are aware of the complete 'path' to the data in the global store and depend on being able to traverse it.)

If there are no selectors to be tested, the below can be simplified by creating a store from the reducer-under-test directly.

::

  describe('redux tests', () => {
    let store;
    beforeEach(() => {

      const parentReducer = (state, action) => ({
        payment: {
          coupon: reducer(state, action),
        }
      });

      store = createStore(parentReducer);
    });

    // tests
  });

The test can then use Jest's snapshot expectations to assert the states of the reducer after actions have occurred.

::

  it('should match default state', () => {
    expect(store.getState()).toMatchSnapshot();
  });

  it('should begin to add a coupon', () => {
    store.dispatch(addCouponBegin()); // dispatching of an action
    expect(store.getState()).toMatchSnapshot();
  });

  // additional action tests

Actions that do not directly update the store (ones consumed by a redux-saga, for instance) can be unit tested directly:

::

  it('should produce an addCoupon action', () => {
    expect(addCoupon('DEMO25')).toEqual({
      type: ADD_COUPON.BASE,
      payload: {
        code: 'DEMO25',
      },
    });
  });

Finally, selectors can be tested by passing them the store in different states and asserting the result.

::
  it('should select default state correctly', () => {
    const result = couponSelector(store.getState());
    expect(result).toEqual({
      loading: false,
      loaded: false,
    })
  });

  it('should select begin state correctly', () => {
    store.dispatch(addCouponBegin()); // dispatching of an action
    const result = couponSelector(store.getState());
    expect(result).toEqual({
      loading: true,
      loaded: false,
    })
  });

All of these tests can be put in the same file.

Consequences
------------

These tests will exercise the contract between reducers, actions and selectors, making them more valuable than individual unit tests of those three parts, and will save time by allowing us to write fewer, more high quality tests.

References
----------

* Example tests: https://github.com/edx/frontend-app-payment/blob/master/src/payment/coupon/data/redux.test.js
