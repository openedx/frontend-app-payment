import React from 'react';
import { Factory } from 'rosie';

import '../__factories__/subscription.factory';
import { loadStripe } from '@stripe/stripe-js';
import {
  render, act, screen, store,
} from '../test-utils';
import * as mocks from '../../payment/checkout/stripeMocks';

import { SubscriptionCheckout } from './SubscriptionCheckout';
import { fetchSubscriptionDetails, subscriptionDetailsReceived } from '../data/details/actions';
import { camelCaseObject } from '../../payment/data/utils';

jest.mock('./StripeOptions', () => ({
  getStripeOptions: jest.fn().mockReturnValue({
    mode: 'subscription',
    amount: 55,
    currency: 'usd',
    paymentMethodCreation: 'manual',
  }),
}));

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => ({
    // mock implementation of the stripe object
  })),
}));

/**
 * SubscriptionCheckout Test
 * https://github.com/stripe-archive/react-stripe-elements/issues/427
 * https://github.com/stripe/react-stripe-js/issues/59
 */
describe('<SubscriptionCheckout />', () => {
  let subscriptionDetails;
  let mockStripe;
  let mockElements;
  let mockElement;
  let mockStripePromise;
  beforeEach(() => {
    // Arrange
    mockStripe = mocks.mockStripe();
    mockElement = mocks.mockElement();
    mockElements = mocks.mockElements();
    mockStripe.elements.mockReturnValue(mockElements);
    mockElements.create.mockReturnValue(mockElement);
    mockStripePromise = jest.fn(() => Promise.resolve({
      ...mockStripe,
    }));
    subscriptionDetails = camelCaseObject(Factory.build('subscription', {}, { numProducts: 2 }));
    loadStripe.mockResolvedValue(mockStripePromise);
  });

  it('should render the loading skeleton for SubscriptionCheckout', () => {
    render(<SubscriptionCheckout />);
    expect(screen.queryByText('Last Name (required)')).not.toBeInTheDocument(); // it doesn't exist
    expect(
      screen.queryByText('You’ll be charged $55.00 USD on April 21, 2025 then every 31 days until you cancel your subscription.'),
    ).toBeNull();
  });

  it('should render the <SubscriptionCheckout/> with the subscription details', () => {
    const stripePromise = mockStripePromise();

    loadStripe.mockResolvedValue(stripePromise);

    const { container } = render(<SubscriptionCheckout />);
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(
          subscriptionDetails,
        ),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });
    expect(loadStripe).toHaveBeenCalledWith(
      process.env.STRIPE_PUBLISHABLE_KEY,
      {
        betas: [process.env.STRIPE_DEFERRED_INTENT_BETA_FLAG],
        apiVersion: process.env.STRIPE_API_VERSION,
        locale: 'en',
      },
    );
    expect(container).toMatchSnapshot();
    // screen.debug(container.querySelector('#payment-element'));

    expect(container.querySelector('#payment-element')).toBeDefined();

    // verify that Checkout Form fields are present in the DOM
    expect(screen.queryByText('Last Name (required)')).toBeDefined();
    expect(screen.queryByLabelText('City')).toBeDefined();
    expect(screen.queryByLabelText('Country')).toBeDefined();
  });
});
