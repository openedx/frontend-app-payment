/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Factory } from 'rosie';
import { createStore } from 'redux';
import Cookies from 'universal-cookie';
import { createSerializer } from 'enzyme-to-json';

import '../__factories__/subscription.factory';
import '../../payment/__factories__/userAccount.factory';
import { SubscriptionDetails } from './SubscriptionDetails';
import createRootReducer from '../../data/reducers';
import { fetchSubscriptionDetails, subscriptionDetailsReceived } from '../data/details/actions';
import { camelCaseObject } from '../../payment/data/utils';

// run enzyme JSON serializer using options compatible with prior snapshots
expect.addSnapshotSerializer(createSerializer({ mode: 'deep', noKey: true }));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));
jest.mock('universal-cookie', () => {
  class MockCookies {
    static result = {};

    get() {
      return MockCookies.result;
    }
  }
  return MockCookies;
});

describe('<SubscriptionDetails />', () => {
  let store;
  let tree;

  beforeEach(() => {
    const authenticatedUser = Factory.build('userAccount');
    Cookies.result = undefined;
    store = createStore(createRootReducer(), {});

    const component = (
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser }}>
          <Provider store={store}>
            <SubscriptionDetails />
          </Provider>
        </AppContext.Provider>
      </IntlProvider>
    );
    tree = mount(component);
  });

  it('renders the loading skeleton', () => {
    expect(tree).toMatchSnapshot();
  });

  it('renders a basic, one product details', () => {
    act(() => {
      store.dispatch(subscriptionDetailsReceived(camelCaseObject(Factory.build(
        'subscription',
        {},
        { numProducts: 1 },
      ))));
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });
    tree.update();
    expect(tree).toMatchSnapshot();
  });

  it('renders 3 product in a subscription details', () => {
    act(() => {
      store.dispatch(subscriptionDetailsReceived(camelCaseObject(Factory.build(
        'subscription',
        {},
        { numProducts: 3 },
      ))));
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });
    tree.update();
    expect(tree).toMatchSnapshot();
  });
});
