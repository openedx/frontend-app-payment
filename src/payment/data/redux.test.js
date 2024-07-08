import Cookies from 'universal-cookie';
import { createStore, combineReducers } from 'redux';

import reducer from './reducers';
import {
  basketDataReceived,
  basketProcessing,
  submitPayment,
  fetchBasket,
} from './actions';
import { currencyDisclaimerSelector, paymentSelector } from './selectors';
import { localizedCurrencySelector } from './utils';

jest.mock('universal-cookie', () => {
  class MockCookies {
    static result = {};

    get() {
      return MockCookies.result;
    }
  }
  return MockCookies;
});

describe('redux tests', () => {
  let store;

  beforeEach(() => {
    store = createStore(combineReducers({
      payment: reducer,
    }));
  });

  describe('selectors', () => {
    describe('localizedCurrencySelector', () => {
      it('default state', () => {
        const result = localizedCurrencySelector(store.getState());
        expect(result).toEqual({
          currencyCode: undefined,
          conversionRate: undefined,
          locationCountryCode: undefined,
          showAsLocalizedCurrency: false,
        });
      });

      it('should work for USD', () => {
        Cookies.result = {
          code: 'USD',
          rate: 1,
          countryCode: 'US',
        };

        const result = localizedCurrencySelector();
        expect(result).toEqual({
          currencyCode: 'USD',
          conversionRate: 1,
          locationCountryCode: 'US',
          showAsLocalizedCurrency: false,
        });
      });

      it('should work for EUR', () => {
        Cookies.result = {
          code: 'EUR',
          rate: 1.5,
          countryCode: 'FR',
        };

        const result = localizedCurrencySelector();
        expect(result).toEqual({
          currencyCode: 'EUR',
          conversionRate: 1.5,
          locationCountryCode: 'FR',
          showAsLocalizedCurrency: true,
        });
      });
    });

    describe('currencyDisclaimerSelector', () => {
      it('default state', () => {
        const result = currencyDisclaimerSelector(store.getState());
        expect(result).toEqual({
          actualAmount: undefined,
        });
      });

      it('orderTotal exists state', () => {
        store = createStore(combineReducers({ payment: reducer }), {
          payment: {
            basket: {
              orderTotal: 123,
            },
          },
        });

        const result = currencyDisclaimerSelector(store.getState());
        expect(result).toEqual({
          actualAmount: 123,
        });
      });
    });

    describe('paymentSelector', () => {
      it('default state', () => {
        const result = paymentSelector(store.getState());
        expect(result).toEqual({
          loading: true,
          loaded: false,
          submitting: false,
          redirect: false,
          products: [],
          isCouponRedeemRedirect: false,
          isBasketProcessing: false,
          isEmpty: false,
          isPaymentRedirect: false,
          isRedirect: false,
          isPaypalRedirect: false,
        });
      });

      it('is a coupon redeem redirect', () => {
        global.history.pushState({}, '', '?coupon_redeem_redirect=1');
        store = createStore(combineReducers({
          payment: reducer,
        }));

        const result = paymentSelector(store.getState());
        expect(result).toEqual({
          loading: true,
          loaded: false,
          submitting: false,
          redirect: false, // This is a different kind of redirect, so still false.
          products: [],
          isCouponRedeemRedirect: true, // this is now true
          isBasketProcessing: false,
          isEmpty: false,
          isPaymentRedirect: false,
          isRedirect: true, // this is also now true.
          isPaypalRedirect: false,
        });
      });

      it('is a Stripe dynamic payment methods redirect', () => {
        global.history.pushState({}, '', '?payment_intent=pi_123dummy');
        store = createStore(combineReducers({
          payment: reducer,
        }));

        const result = paymentSelector(store.getState());
        expect(result).toEqual({
          loading: true,
          loaded: false,
          submitting: false,
          redirect: false, // This is a different kind of redirect, so still false.
          products: [],
          isCouponRedeemRedirect: false,
          isBasketProcessing: false,
          isEmpty: false,
          isPaymentRedirect: true, // this is now true
          isRedirect: false,
          isPaypalRedirect: false,
        });
      });
    });
  });

  describe('basket reducer', () => {
    it('should return the default state when appropriate', () => {
      // Its base state
      expect(store.getState().payment).toMatchSnapshot();

      // If an action isn't appropriate for it
      store.dispatch({ type: 'SOMETHING_ELSE' });
      expect(store.getState().payment).toMatchSnapshot();

      // When called with no parameters
      expect(reducer()).toMatchSnapshot();
    });

    it('BASKET_DATA_RECEIVED action', () => {
      store.dispatch(basketDataReceived({ foo: 'bar' }));
      expect(store.getState().payment.basket.foo).toBe('bar');
    });

    describe('BASKET_PROCESSING action', () => {
      it('BASKET_PROCESSING true action', () => {
        store.dispatch(basketProcessing(true));
        expect(store.getState().payment.basket.isBasketProcessing).toBe(true);
      });

      it('BASKET_PROCESSING false action', () => {
        store.dispatch(basketProcessing(false));
        expect(store.getState().payment.basket.isBasketProcessing).toBe(false);
      });
    });

    describe('submitPayment actions', () => {
      const paymentProcessors = [
        'cybersource',
        'paypal',
        'stripe',
      ];

      test.each(paymentProcessors)('submitPayment.TRIGGER action', (processor) => {
        store.dispatch(submitPayment({ method: processor }));
        expect(store.getState().payment.basket.paymentMethod).toBe(processor);
      });

      it('submitPayment.REQUEST action', () => {
        store.dispatch(submitPayment.request());
        expect(store.getState().payment.basket.submitting).toBe(true);
      });

      it('submitPayment.SUCCESS action', () => {
        store.dispatch(submitPayment.success());
        expect(store.getState().payment.basket.redirect).toBe(true);
      });

      it('submitPayment.FULFILL action', () => {
        store.dispatch(submitPayment.fulfill());
        expect(store.getState().payment.basket.submitting).toBe(false);
        expect(store.getState().payment.basket.paymentMethod).toBeUndefined();
      });
    });

    describe('fetchBasket actions', () => {
      it('fetchBasket.TRIGGER action', () => {
        store.dispatch(fetchBasket());
        expect(store.getState().payment.basket.loading).toBe(true);
      });

      it('fetchBasket.FULFILL action', () => {
        store.dispatch(fetchBasket.fulfill());
        expect(store.getState().payment.basket.loading).toBe(false);
        expect(store.getState().payment.basket.loaded).toBe(true);
      });
    });
  });
});
