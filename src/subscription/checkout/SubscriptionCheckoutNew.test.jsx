import React from 'react';
import { Factory } from 'rosie';

import '../__factories__/subscription.factory';
import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
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

// const mockElement = () => ({
//   mount: jest.fn(),
//   destroy: jest.fn(),
//   on: jest.fn(),
//   update: jest.fn(),
// });

// const mockElements = () => {
//   const elements = {};
//   return {
//     create: jest.fn((type) => {
//       elements[type] = mockElement();
//       return elements[type];
//     }),
//     getElement: jest.fn((type) => elements[type] || null),
//   };
// };

// const mockStripe = () => ({
//   elements: jest.fn(() => mockElements()),
//   createToken: jest.fn(),
//   createSource: jest.fn(),
//   createPaymentMethod: jest.fn(),
//   confirmCardPayment: jest.fn(),
//   confirmCardSetup: jest.fn(),
//   paymentRequest: jest.fn(),
//   _registerWrapper: jest.fn(),
// });

// jest.mock('@stripe/react-stripe-js', () => {
//   const stripe = jest.requireActual('@stripe/react-stripe-js');

//   return ({
//     ...stripe,
//     Element: () => mockElement,
//     useStripe: () => mockStripe,
//     useElements: () => mockElements,
//   });
// });

// const mockStripePromise = jest.fn(() => Promise.resolve({
//   // elements: jest.fn(() => ({
//   //   getElement: jest.fn(),
//   // })),
//   // createToken: jest.fn(),
//   // createSource: jest.fn(),
//   // createPaymentMethod: jest.fn(),
//   // confirmCardPayment: jest.fn(),
//   ...mockStripe(),
// }));
/**
 * SubscriptionCheckout Test
 */
describe('<SubscriptionCheckout />', () => {
  let subscriptionDetails;
  let mockStripe;
  let mockElements;
  // let submitButton;
  // let state;
  let mockElement;
  // let paymentElement;
  let mockStripePromise;
  beforeEach(() => {
    // Arrange
    mockStripe = mocks.mockStripe();
    mockElement = mocks.mockElement();
    mockElements = mocks.mockElements();
    mockStripe.elements.mockReturnValue(mockElements);
    mockElements.create.mockReturnValue(mockElement);
    // loadStripe.mockResolvedValue(mockStripe);

    mockStripePromise = jest.fn(() => Promise.resolve({
      // elements: jest.fn(() => ({
      //   getElement: jest.fn(),
      // })),
      // createToken: jest.fn(),
      // createSource: jest.fn(),
      // createPaymentMethod: jest.fn(),
      // confirmCardPayment: jest.fn(),
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
    // render(<SubscriptionCheckout />);
    act(() => {
      // loadStripe.mockResolvedValue(mockStripePromise);

      store.dispatch(
        subscriptionDetailsReceived(
          subscriptionDetails,
        ),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
      // loadStripe.mockResolvedValue(mockStripe);
    });
    expect(loadStripe).toHaveBeenCalledWith(
      process.env.STRIPE_PUBLISHABLE_KEY,
      {
        betas: [process.env.STRIPE_DEFERRED_INTENT_BETA_FLAG],
        apiVersion: process.env.STRIPE_API_VERSION,
        locale: 'en',
      },
    );
    // screen.debug(undefined, 200000);
    expect(container).toMatchSnapshot();
    screen.debug(container.querySelector('#payment-element'));

    // verify that Checkout Form fields are present in the DOM
    expect(screen.queryByText('Last Name (required)')).toBeDefined();
    // verify that MonthlySubscriptionNotification is present in the DOM
    expect(
      screen.queryByText('You’ll be charged $55.00 USD on April 21, 2025 then every 31 days until you cancel your subscription.'),
    ).toBeDefined();
  });

  // it('should not render the Subscription details when error_code is present', () => {
  //   render(<SubscriptionCheckout />);
  //   act(() => {
  //     store.dispatch(
  //       subscriptionDetailsReceived(
  //         camelCaseObject(Factory.build('subscription', { error_code: 'empty_subscription' }, { numProducts: 1 })),
  //       ),
  //     );
  //     store.dispatch(fetchSubscriptionDetails.fulfill());
  //   });

  //   expect(screen.queryByTestId('subscription-badge')).toBeNull();
  //   expect(screen.queryByText(/Verified Certificate/)).toBeNull();
  //   expect(screen.queryByText(/MX$1,050 */)).toBeNull();
  // });
});
