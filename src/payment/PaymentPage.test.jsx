/* eslint-disable global-require */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { Factory } from 'rosie';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import Cookies from 'universal-cookie';

import './__factories__/basket.factory';
import './__factories__/userAccount.factory';
import { AppContext } from '@edx/frontend-platform/react';
import { PaymentPage } from '.';
import createRootReducer from '../data/reducers';
import { fetchBasket, basketDataReceived } from './data/actions';
import { transformResults } from './data/service';
import { ENROLLMENT_CODE_PRODUCT_TYPE } from './cart/order-details';
import { MESSAGE_TYPES, addMessage } from '../feedback';

jest.mock('universal-cookie', () => {
  class MockCookies {
    static result = {
      [process.env.LANGUAGE_PREFERENCE_COOKIE_NAME]: 'en',
      [process.env.CURRENCY_COOKIE_NAME]: {
        code: 'MXN',
        rate: 19.092733,
      },
    };

    get(cookieName) {
      return MockCookies.result[cookieName];
    }
  }
  return MockCookies;
});

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const config = getConfig();
const locale = 'en';

configureI18n({
  config: {
    ENVIRONMENT: process.env.ENVIRONMENT,
    LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
  },
  loggingService: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
  messages: {
    uk: {},
    th: {},
    ru: {},
    'pt-br': {},
    pl: {},
    'ko-kr': {},
    id: {},
    he: {},
    ca: {},
    'zh-cn': {},
    fr: {},
    'es-419': {},
    ar: {},
  },
});

const authenticatedUser = Factory.build('userAccount');

describe('<PaymentPage />', () => {
  let store;

  beforeEach(() => {
    store = createStore(createRootReducer(), {}, applyMiddleware(thunkMiddleware));
  });

  describe('Renders correctly in various states', () => {
    beforeEach(() => {
      analytics.sendTrackingLogEvent = jest.fn();
      Cookies.result[process.env.CURRENCY_COOKIE_NAME] = undefined;
    });

    it('should render its default (loading) state', () => {
      const component = (
        <IntlProvider locale="en">
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
        </IntlProvider>
      );

      const tree = renderer.create(component);
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('should render the basket', () => {
      const component = (
        <IntlProvider locale="en">
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
      Cookies.result[process.env.CURRENCY_COOKIE_NAME] = {
        code: 'MXN',
        rate: 19.092733,
      };

      store = createStore(
        createRootReducer(),
        {},
        applyMiddleware(thunkMiddleware),
      );
      const component = (
        <IntlProvider locale="en">
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
          <AppContext.Provider value={{ authenticatedUser, config, locale }}>
            <Provider store={store}>
              <PaymentPage />
            </Provider>
          </AppContext.Provider>
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
