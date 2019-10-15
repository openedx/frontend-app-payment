/* eslint-disable global-require */
import { App } from '@edx/frontend-base';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { Factory } from 'rosie';
import { IntlProvider } from '@edx/frontend-i18n';
import * as analytics from '@edx/frontend-analytics';
import { fetchUserAccountSuccess } from '@edx/frontend-auth';

import './__factories__/basket.factory';
import './__factories__/userAccount.factory';
import { PaymentPage } from './';
import createRootReducer from '../data/reducers';
import { fetchBasket, basketDataReceived } from './data/actions';
import { transformResults } from './data/service';
import { ENROLLMENT_CODE_PRODUCT_TYPE } from './cart/order-details';
import { MESSAGE_TYPES, addMessage } from '../feedback';

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${App.config.LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});
App.apiClient = jest.fn();

jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

describe('<PaymentPage />', () => {
  let store;

  beforeEach(() => {
    const userAccount = Factory.build('userAccount');

    store = createStore(createRootReducer(), {}, applyMiddleware(thunkMiddleware));
    store.dispatch(fetchUserAccountSuccess(userAccount));
  });

  describe('Renders correctly in various states', () => {
    beforeEach(() => {
      analytics.sendTrackingLogEvent = jest.fn();
    });

    it('should render its default (loading) state', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );

      const tree = renderer.create(component);
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render the basket', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );
      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build('basket', {}, { numProducts: 1 }))));
        store.dispatch(fetchBasket.fulfill());
      });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render the basket in a different currency', () => {
      store = createStore(
        createRootReducer(),
        Object.assign({}, {
          payment: {
            currency: {
              currencyCode: 'MXN',
              conversionRate: 19.092733,
            },
          },
        }),
        applyMiddleware(thunkMiddleware),
      );
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );
      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build('basket', {}, { numProducts: 1 }))));
        store.dispatch(fetchBasket.fulfill());
      });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render the basket with an enterprise offer', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );
      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build(
          'basket',
          {
            offers: [
              {
                benefitValue: 50,
                benefitType: 'Percentage',
                provider: 'Pied Piper',
              },
            ],
          },
          { numProducts: 1 },
        ))));
        store.dispatch(fetchBasket.fulfill());
      });

      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render the basket for a bulk order', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );

      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build(
          'basket',
          {},
          { numProducts: 1, productType: ENROLLMENT_CODE_PRODUCT_TYPE },
        ))));
        store.dispatch(fetchBasket.fulfill());
      });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render an empty basket', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );
      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build('basket', {}, { numProducts: 0 }))));
        store.dispatch(fetchBasket.fulfill());
      });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render a redirect spinner', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );
      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build(
          'basket',
          {
            redirect: 'http://localhost/boo',
          },
          { numProducts: 1 },
        ))));
        store.dispatch(fetchBasket.fulfill());
      });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render a free basket', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );
      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build(
          'basket',
          {
            is_free_basket: true,
          },
          { numProducts: 1 },
        ))));
        store.dispatch(fetchBasket.fulfill());
      });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render all custom alert messages', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentPage />
          </Provider>
        </IntlProvider>
      );
      const tree = renderer.create(component);
      act(() => {
        store.dispatch(basketDataReceived(transformResults(Factory.build(
          'basket',
          {
          },
          { numProducts: 1 },
        ))));
        store.dispatch(addMessage(null, "Coupon code 'HAPPY' added to basket.", null, MESSAGE_TYPES.INFO));
        store.dispatch(addMessage('single-enrollment-code-warning', null, {
          courseAboutUrl: 'http://edx.org/about_ze_course',
        }, MESSAGE_TYPES.INFO));
        store.dispatch(fetchBasket.fulfill());
      });
      expect(tree.toJSON()).toMatchSnapshot();
    });
  });
});
