/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable global-require */
import React from 'react';
import { Factory } from 'rosie';
import Cookies from 'universal-cookie';

import '../__factories__/subscription.factory';
import {
  render, act, screen, store,
} from '../test-utils';
import { SubscriptionDetails } from './SubscriptionDetails';
import { fetchSubscriptionDetails, subscriptionDetailsReceived } from '../data/details/actions';
import { camelCaseObject } from '../../payment/data/utils';

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

/**
 * SubscriptionDetails Test
 */
describe('<SubscriptionDetails />', () => {
  let subscriptionDetails;
  beforeEach(() => {
    subscriptionDetails = camelCaseObject(Factory.build('subscription', {}, { numProducts: 2 }));
  });

  it('should render the <SubscriptionDetails/> with the subscription details', () => {
    render(<SubscriptionDetails />);
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(
          subscriptionDetails,
        ),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });
    // verify that `SubscriptionBadge is present in the DOM
    expect(screen.queryByTestId('subscription-badge')).toHaveTextContent('Subscription');
    // verify that `price` is converted and present in the DOM
    expect(screen.queryByText(/MX$1,050 */)).toBeDefined();
    // verify that two `course` are rendered on the same page
    expect(screen.getAllByText('Verified Certificate')).toHaveLength(2);
  });

  it('should render the USD currency if no currency cookie found', () => {
    Cookies.result[process.env.CURRENCY_COOKIE_NAME] = undefined;
    render(<SubscriptionDetails />);
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(
          subscriptionDetails,
        ),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });
    // no conversion to other currency formats
    expect(screen.queryByText(/MX$1,050 */)).toBeNull();
    // Total amount should be 0
    expect(screen.queryByText(/$0.00/)).toBeDefined();
    // should render in USD amount
    expect(screen.queryAllByText('$55/month USD after 7-day free trial')).toHaveLength(1);
  });
});
