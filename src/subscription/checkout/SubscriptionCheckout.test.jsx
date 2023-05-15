/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable global-require */
import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { Factory } from 'rosie';
import { createSerializer } from 'enzyme-to-json';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import Cookies from 'universal-cookie';
import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';

import '../__factories__/subscription.factory';
import '../../payment/__factories__/userAccount.factory';
import { AppContext } from '@edx/frontend-platform/react';
import { SubscriptionCheckout } from './SubscriptionCheckout';
import createRootReducer from '../../data/reducers';
import { fetchSubscriptionDetails, subscriptionDetailsReceived } from '../data/details/actions';
import { camelCaseObject } from '../../payment/data/utils';

expect.addSnapshotSerializer(createSerializer({ mode: 'deep', noKey: true }));

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
  sendPageEvent: jest.fn(),
}));

// https://github.com/wwayne/react-tooltip/issues/595#issuecomment-638438372
jest.mock('react-tooltip/node_modules/uuid', () => ({
  v4: () => '00000000-0000-0000-0000-000000000000',
}));

jest.mock('./StripeOptions', () => ({
  getStripeOptions: jest.fn().mockReturnValue({}),
}));

// jest.mock('@stripe/stripe-js', () => ({
//   loadStripe: jest.fn(),
// }));

describe('<SubscriptionCheckout />', () => {
  let store;
  let tree;

  beforeEach(() => {
    const authenticatedUser = Factory.build('userAccount');
    store = createStore(createRootReducer(), {}, applyMiddleware(thunkMiddleware));
    // eslint-disable-next-line no-import-assign
    analytics.sendTrackingLogEvent = jest.fn();
    Cookies.result[process.env.CURRENCY_COOKIE_NAME] = undefined;

    // Mock the response of loadStripe method
    // const mockedStripe = {
    //   elements: jest.fn(),
    // };
    // loadStripe.mockResolvedValue(mockedStripe);
    // TODO: make sure to test the form submit events

    const component = (
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser, config, locale }}>
          <Provider store={store}>
            <SubscriptionCheckout />
          </Provider>
        </AppContext.Provider>
      </IntlProvider>
    );

    tree = mount(component);
  });

  afterEach(() => {
    tree.unmount();
  });

  it('should render the loading skeleton for SubscriptionCheckout', () => {
    tree.update();

    expect(tree.find('CheckoutSkeleton')).toHaveLength(1);

    expect(tree).toMatchSnapshot();
  });

  it('should render the subscription checkout details', () => {
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(
          camelCaseObject(Factory.build('subscription', {}, { numProducts: 1 })),
        ),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });

    tree.update();
    expect(tree).toMatchSnapshot();

    expect(tree.find('SubscriptionCheckout')).toHaveLength(1);

    expect(tree.find(Elements)).toHaveLength(1);
    expect(tree.find('StripePaymentForm')).toHaveLength(1);
  });
});
