// import Cookies from 'universal-cookie';
import { createStore, combineReducers } from 'redux';

import { reducer } from '../reducers';
import {
  subscriptionDetailsReceived,
  subscriptionDetailsProcessing,
  submitPayment,
  fetchSubscriptionDetails,
} from './actions';
import { subscriptionSelector } from './selectors';

jest.mock('universal-cookie', () => {
  class MockCookies {
    static result = {};

    get() {
      return MockCookies.result;
    }
  }
  return MockCookies;
});

describe('subscription details redux tests', () => {
  let store;

  beforeEach(() => {
    store = createStore(combineReducers({
      subscription: reducer,
    }));
  });

  describe('selectors', () => {
    // describe('details', () => {
    it('default state', () => {
      const result = subscriptionSelector(store.getState());
      expect(result).toEqual({
        isEmpty: false,
        isRedirect: true,
        loading: true,
        loaded: false,
        submitting: false,
        redirect: false,
        isSubscriptionDetailsProcessing: false,
        products: [],
        // TODO: remove these once fetched from DB
        currency: 'USD',
        programTitle: 'Blockchain Fundamentals',
        certificateType: 'verified',
        organization: 'University of California, Berkeley',
        price: 49,
        paymentMethod: 'stripe',
      });
    });
  });

  describe('details reducer', () => {
    it('should return the default state when appropriate', () => {
      // Its base state
      expect(store.getState().subscription.details).toMatchSnapshot();

      // If an action isn't appropriate for it
      store.dispatch({ type: 'SOMETHING_ELSE' });
      expect(store.getState().subscription.details).toMatchSnapshot();

      // When called with no parameters
      expect(reducer()).toMatchSnapshot();
    });

    it('SUBSCRIPTION_DETAILS_RECEIVED action', () => {
      store.dispatch(subscriptionDetailsReceived({ foo: 'bar' }));
      expect(store.getState().subscription.details.foo).toBe('bar');
    });

    describe('SUBSCRIPTION_DETAILS_PROCESSING action', () => {
      it('SUBSCRIPTION_DETAILS_PROCESSING true action', () => {
        store.dispatch(subscriptionDetailsProcessing(true));
        expect(store.getState().subscription.details.isSubscriptionDetailsProcessing).toBe(true);
      });

      it('BASKET_PROCESSING false action', () => {
        store.dispatch(subscriptionDetailsProcessing(false));
        expect(store.getState().subscription.details.isSubscriptionDetailsProcessing).toBe(false);
      });
    });

    describe('submitPayment actions', () => {
      const paymentProcessors = [
        'stripe',
      ];

      test.each(paymentProcessors)('submitPayment.TRIGGER action', (processor) => {
        store.dispatch(submitPayment({ method: processor }));
        expect(store.getState().subscription.details.paymentMethod).toBe(processor);
      });

      it('submitPayment.REQUEST action', () => {
        store.dispatch(submitPayment.request());
        expect(store.getState().subscription.details.submitting).toBe(true);
      });

      it('submitPayment.SUCCESS action', () => {
        store.dispatch(submitPayment.success());
        expect(store.getState().subscription.details.redirect).toBe(true);
      });

      it('submitPayment.FULFILL action', () => {
        store.dispatch(submitPayment.fulfill());
        expect(store.getState().subscription.details.submitting).toBe(false);
        expect(store.getState().subscription.details.paymentMethod).toBeUndefined();
      });
    });

    describe('fetchBasket actions', () => {
      test.only('fetchBasket.TRIGGER action', () => {
        store.dispatch(fetchSubscriptionDetails());
        expect(store.getState().subscription.details.loading).toBe(true);
      });

      it('fetchBasket.FULFILL action', () => {
        store.dispatch(fetchSubscriptionDetails.fulfill());
        expect(store.getState().subscription.details.loading).toBe(false);
        expect(store.getState().subscription.details.loaded).toBe(true);
      });
    });
  });
});
