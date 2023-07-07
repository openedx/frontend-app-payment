import Cookies from 'universal-cookie';
import { createStore, combineReducers } from 'redux';

import reducer from './reducers';
import {
  basketDataReceived,
  basketProcessing,
  submitPayment,
  fetchBasket,
  fetchActiveOrder,
  pollPaymentState,
} from './actions';
import { currencyDisclaimerSelector, paymentSelector } from './selectors';
import { localizedCurrencySelector } from './utils';
import { DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS, PAYMENT_STATE } from './constants';

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
          showAsLocalizedCurrency: false,
        });
      });

      it('should work for USD', () => {
        Cookies.result = {
          code: 'USD',
          rate: 1,
        };

        const result = localizedCurrencySelector();
        expect(result).toEqual({
          currencyCode: 'USD',
          conversionRate: 1,
          showAsLocalizedCurrency: false,
        });
      });

      it('should work for EUR', () => {
        Cookies.result = {
          code: 'EUR',
          rate: 1.5,
        };

        const result = localizedCurrencySelector();
        expect(result).toEqual({
          currencyCode: 'EUR',
          conversionRate: 1.5,
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
          isRedirect: false,
          paymentState: PAYMENT_STATE.DEFAULT,
          paymentStatePolling: {
            retriesLeft: DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS,
            keepPolling: false,
          },
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
          isRedirect: true, // this is also now true.
          paymentState: PAYMENT_STATE.DEFAULT,
          paymentStatePolling: {
            retriesLeft: DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS,
            keepPolling: false,
          },
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

      describe('fetchActiveOrder actions', () => {
        it('fetchActiveOrder.TRIGGER action', () => {
          store.dispatch(fetchActiveOrder());
          expect(store.getState().payment.basket.loading).toBe(true);
        });

        it('fetchActiveOrder.FULFILL action', () => {
          store.dispatch(fetchActiveOrder.fulfill());
          expect(store.getState().payment.basket.loading).toBe(false);
          expect(store.getState().payment.basket.loaded).toBe(true);
        });
      });
    });

    describe('pollPaymentState actions + reducers', () => {
      let triggerStore;
      beforeEach(() => {
        triggerStore = createStore(
          combineReducers({
            payment: reducer,
          }),
          {
            payment:
                  {
                    basket: {
                      foo: 'bar',
                      paymentState: PAYMENT_STATE.PENDING,
                      basketId: 7,
                      payments: [
                        { paymentNumber: 7 },
                      ],
                      isBasketProcessing: false,
                    },
                  },
          },
        );
      });

      afterEach(() => { triggerStore = undefined; });

      it('Round Trip (No Error)', () => {
        triggerStore.dispatch(pollPaymentState());
        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(true);
        expect(triggerStore.getState().payment.basket.paymentState).toBe(PAYMENT_STATE.PENDING);

        triggerStore.dispatch(pollPaymentState.received({ state: PAYMENT_STATE.COMPLETED }));
        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(false);
        expect(triggerStore.getState().payment.basket.paymentState).toBe(PAYMENT_STATE.COMPLETED);

        triggerStore.dispatch(pollPaymentState.fulfill());
        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(false);
        expect(triggerStore.getState().payment.basket.paymentState === PAYMENT_STATE.PENDING).toBe(false);
      });

      it('Round Trip (Fatal Error)', () => {
        triggerStore.dispatch(pollPaymentState());
        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(true);
        expect(triggerStore.getState().payment.basket.paymentState).toBe(PAYMENT_STATE.PENDING);

        triggerStore.dispatch(pollPaymentState.failure(Error('Something broke!')));
        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(false);
        expect(triggerStore.getState().payment.basket.paymentState).toBe(null);
      });

      it('Round Trip (Max HTTP Error)', () => {
        const pollingMaxErrors = DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS;

        triggerStore.dispatch(pollPaymentState());
        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(true);
        expect(triggerStore.getState().payment.basket.paymentState).toBe(PAYMENT_STATE.PENDING);

        for (let i = 0; pollingMaxErrors > i; i++) {
          const expectedCount = pollingMaxErrors - 1 - i;
          triggerStore.dispatch(pollPaymentState.received({ state: PAYMENT_STATE.HTTP_ERROR }));
          expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling)
            .toBe(expectedCount > 0);
          expect(triggerStore.getState().payment.basket.paymentStatePolling.retriesLeft)
            .toBe(expectedCount);
        }

        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(false);
        expect(triggerStore.getState().payment.basket.paymentStatePolling.retriesLeft)
          .toBe(0);

        triggerStore.dispatch(pollPaymentState.failure(Error('Too many HTTP errors!')));
        expect(triggerStore.getState().payment.basket.paymentStatePolling.keepPolling).toBe(false);
        expect(triggerStore.getState().payment.basket.paymentState).toBe(null);
      });
    });
  });
});
