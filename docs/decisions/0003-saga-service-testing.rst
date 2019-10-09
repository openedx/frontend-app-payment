3. Saga and Service Testing
--------------------------------

Status
------

Accepted

Context
-------

The frontend-app-payment repository is a critical piece of infrastructure (the checkout page) and has higher testing requirements than some of our other micro-frontends.  This ADR describes a method of writing Jest tests for the actions, sagas, and services that exercises the contract between them.

It's worth being aware that there are a few ways to test a saga - or to attempt to.  The first is what we will suggest using in most cases.  The second is an acceptable fallback to test sagas that delegate to other, more specific sagas.  The third is a warning - it does not work.

1. Use redux-saga's "runSaga" method to run individual sagas against a given action.  This proves the contract between the action, the saga, and any side effects it may generate.  If those side effects involve server calls, the API client will need to be mocked.

2. Call the generator function (saga) in your test and call .next() repeatedly, asserting that the values returned from the generator are what you expect.  This is less useful than #1.

3. Not feasible: Creating a redux store and attaching the saga to it as middleware. A resourceful developer may try this and discover it **does not work**.  This method is attractive because it would appear to exercise the whole data directory - reducers, actions, sagas, and services - simultaneously.  The problem with this method is that the sagas necessarily run asynchronously, so your test will exit before updating the store.  The second option above functions on the ability to turn runSaga's output into a promise that can then be awaited.

Decision
--------

These tests use redux-saga's "runSaga" method where possible to assert the interaction between a saga, its invoking action, and any side effects (primarily service methods) that it may in turn invoke.

Sagas which delegate to other sagas may still be tested via method #2 above, as running them using runSaga doesn't otherwise produce any output.

Method #1 (primary test method)
===============================

This method is effective, but requires quite a bit of setup and mocking.

Most sagas will call a service method that makes API calls against a server.  The API client our services use to make requests can be mocked, which allows us to test the contract between the saga and service.

To mock the API client's methods, configure the service with a mock apiClient object where any AJAX methods (post, get, delete, patch, etc.) are implemented with Jest mocks.

::

  // Example body of the server response.
  const responseData = {
    data: {
      // Data pertinent to this specific example - yours will be different.
      voucher: { id: 12345, code: 'DEMO25', benefit_value: '25%',
      },
    },
  };

  const apiClientPost = jest.fn(() =>
    new Promise((resolve, reject) => {
      resolve(responseData); // resolving here results in a successful server response.
    }));

  App.config = { ECOMMERCE_BASE_URL: 'http://localhost' }, // Any necessary config the service needs.
  App.apiClient = { post: apiClientPost }, // Mocked apiClient methods

Next, the saga under test may be run using runSaga:

::

  it('should handle success', async () => {

    // ... The above mocked apiClient and configured service...

    const dispatched = []; // Used to record any actions the saga will dispatch
    await runSaga(
      { dispatch: action => dispatched.push(action) },
      handleAddCoupon, // The saga under test
      addCoupon('DEMO25'), // The action to feed to the saga
    ).toPromise(); // Important!  Along with the await and async test method above, allows us to wait for the saga to finish.

Finally, we can assert the saga and service have run as expected:

::

  // Asserting that the actions we expect were dispatched in the correct order, with the correct payloads.
  expect(dispatched).toEqual([
    addCouponBegin(),
    addCouponSuccess(12345, 'DEMO25', '25%'),
  ]);

  // Assert that the service called our API client method with the correct parameters.
  expect(apiClientPost).toHaveBeenCalledWith(
    'http://localhost/payment-bff/v0/payment/vouchers/',
    { code: 'DEMO25' },
    { headers: { 'Content-Type': 'application/json' } },
  );

Complete example to test an error case:

::

  it('should handle an API error', async () => {
    const errorResponse = {
      response: {
        data: {
          // This error response is particular to this example endpoint - yours may be different.
          error_code: 'uhoh',
        },
      },
    };

    const apiClientPost = jest.fn(() =>
      new Promise((resolve, reject) => {
        reject(errorResponse); // Note that we call reject here.  This causes the service/apiClient to throw an exception.
      }));

    App.config = { ECOMMERCE_BASE_URL: 'http://localhost' }, // Any necessary config the service needs.
    App.apiClient = { post: apiClientPost }, // Mocked apiClient methods

    const dispatched = [];
    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      handleAddCoupon,
      addCoupon('DEMO25'),
    ).toPromise();

    // Known server errors will, in this case and probably in your saga, result in a failure action being dispatched.
    expect(dispatched).toEqual([addCouponBegin(), addCouponFailure('uhoh')]);

    // Even though the result was an exception, the API client's 'post' method should still have been called with the right parameters.
    expect(apiClientPost).toHaveBeenCalledWith(
      'http://localhost/payment-bff/v0/payment/vouchers/',
      { code: 'DEMO25' },
      { headers: { 'Content-Type': 'application/json' } },
    );
  });

Method #2 (fallback test method)
================================

The generator test method looks like the following:

::

  describe('main saga', () => {
    it('should setup its sub sagas correctly', () => {
      const gen = saga();

      expect(gen.next()).toMatchSnapshot();
      expect(gen.next()).toMatchSnapshot();
      expect(gen.next()).toEqual({ done: true, value: undefined }); // This means the saga is done - it delegated to two sub-handlers.
    });
  });

Each of the snapshots will show a description of how the saga intends to delegate specific actions to sub-sagas. As an example:

::

  Object {
    "done": false,
    "value": Object {
      "@@redux-saga/IO": true,
      "combinator": false,
      "payload": Object {
        "args": Array [
          "PAYMENT__ADD_COUPON",
          [Function],
        ],
        "context": null,
        "fn": [Function],
      },
      "type": "FORK",
    },
  }

Consequences
------------

These tests will exercise the contract between actions, sagas, and services, making them more valuable than individual unit tests of those three parts, and will save time by allowing us to write fewer, more high quality tests.

References
----------

* https://redux-saga.js.org/docs/advanced/Testing.html ("Testing the full Saga")
* https://github.com/edx/frontend-app-payment/blob/master/src/payment/coupon/data/sagas.test.js
