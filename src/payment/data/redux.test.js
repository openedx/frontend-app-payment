import { createStore, combineReducers } from 'redux';

import reducer from './reducers';
import {
  basketDataReceived,
  submitPayment,
  fetchBasket,
  addCoupon,
  removeCoupon,
  updateQuantity,
} from './actions';
import { localizedCurrencySelector, currencyDisclaimerSelector, paymentSelector } from './selectors';

describe('redux tests', () => {
  let store;

  beforeEach(() => {
    store = createStore(combineReducers({
      payment: reducer,
      configuration: () => ({
        LMS_BASE_URL: 'lms_base_url',
        SUPPORT_URL: 'support_url',
        ECOMMERCE_BASE_URL: 'ecommerce_base_url',
      }),
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
        store = createStore(combineReducers({ payment: reducer }), {
          payment: {
            currency: {
              currencyCode: 'USD',
              conversionRate: 1,
            },
          },
        });

        const result = localizedCurrencySelector(store.getState());
        expect(result).toEqual({
          currencyCode: 'USD',
          conversionRate: 1,
          showAsLocalizedCurrency: false,
        });
      });

      it('should work for EUR', () => {
        store = createStore(combineReducers({ payment: reducer }), {
          payment: {
            currency: {
              currencyCode: 'EUR',
              conversionRate: 1.5,
            },
          },
        });

        const result = localizedCurrencySelector(store.getState());
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
          dashboardURL: 'lms_base_url',
          supportURL: 'support_url',
          ecommerceURL: 'ecommerce_base_url',
          isEmpty: false,
          isRedirect: false,
        });
      });

      it('is a coupon redeem redirect', () => {
        store = createStore(combineReducers({
          payment: reducer,
          configuration: () => ({
            LMS_BASE_URL: 'lms_base_url',
            SUPPORT_URL: 'support_url',
            ECOMMERCE_BASE_URL: 'ecommerce_base_url',
          }),
          queryParameters: () => ({
            coupon_redeem_redirect: 1,
          }),
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
          dashboardURL: 'lms_base_url',
          supportURL: 'support_url',
          ecommerceURL: 'ecommerce_base_url',
          isEmpty: false,
          isRedirect: true, // this is also now true.
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

    describe('submitPayment actions', () => {
      it('submitPayment.TRIGGER action', () => {
        store.dispatch(submitPayment({ method: 'cybersource' }));
        expect(store.getState().payment.basket.paymentMethod).toBe('cybersource');
      });

      it('submitPayment.REQUEST action', () => {
        store.dispatch(submitPayment.request());
        expect(store.getState().payment.basket.submitting).toBe(true);
        expect(store.getState().payment.basket.isBasketProcessing).toBe(true);
      });

      it('submitPayment.SUCCESS action', () => {
        store.dispatch(submitPayment.success());
        expect(store.getState().payment.basket.redirect).toBe(true);
      });

      it('submitPayment.FULFILL action', () => {
        store.dispatch(submitPayment.fulfill());
        expect(store.getState().payment.basket.submitting).toBe(false);
        expect(store.getState().payment.basket.isBasketProcessing).toBe(false);
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

    describe('addCoupon actions', () => {
      it('addCoupon.REQUEST action', () => {
        store.dispatch(addCoupon.request());
        expect(store.getState().payment.basket.isBasketProcessing).toBe(true);
      });

      it('addCoupon.FULFILL action', () => {
        store.dispatch(addCoupon.fulfill());
        expect(store.getState().payment.basket.isBasketProcessing).toBe(false);
      });
    });

    describe('removeCoupon actions', () => {
      it('removeCoupon.REQUEST action', () => {
        store.dispatch(removeCoupon.request());
        expect(store.getState().payment.basket.isBasketProcessing).toBe(true);
      });

      it('removeCoupon.FULFILL action', () => {
        store.dispatch(removeCoupon.fulfill());
        expect(store.getState().payment.basket.isBasketProcessing).toBe(false);
      });
    });

    describe('updateQuantity actions', () => {
      it('updateQuantity.REQUEST action', () => {
        store.dispatch(updateQuantity.request());
        expect(store.getState().payment.basket.isBasketProcessing).toBe(true);
      });

      it('updateQuantity.FULFILL action', () => {
        store.dispatch(updateQuantity.fulfill());
        expect(store.getState().payment.basket.isBasketProcessing).toBe(false);
      });
    });
  });

  describe('currency reducer', () => {
    it('should return its default state', () => {
      expect(store.getState().payment.currency).toEqual({});
    });
  });
});
