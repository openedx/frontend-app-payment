/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable global-require */
import React from 'react';
import { Factory } from 'rosie';

import '../../__factories__/subscription.factory';
import '../../__factories__/subscriptionStatus.factory';

import {
  screen, render, act, store, // fireEvent
} from '../../test-utils';
import { Secure3DModal } from './Secure3dModal';
import { fetchSubscriptionDetails, subscriptionDetailsReceived } from '../../data/details/actions';
import { subscriptionStatusReceived } from '../../data/status/actions';

import { camelCaseObject } from '../../../payment/data/utils';

// Mock the logError function
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

// Mock stripe and elements objects
const setupIntentPromise = Promise.resolve({
  error: false,
  setupIntent: {
    next_action: {
      redirect_to_url: {
        url: 'https://www.abcbank.com/3d/secure2/setupIntent/',
      },
    },
  },
});
const paymentIntentPromise = Promise.resolve({
  error: false,
  paymentIntent: {
    next_action: {
      redirect_to_url: {
        url: 'https://www.abcbank.com/3d/secure2/paymentIntent',
      },
    },
  },
});
const stripeMock = {
  retrieveSetupIntent: jest.fn(() => setupIntentPromise),
  retrievePaymentIntent: jest.fn(() => paymentIntentPromise),
};
const elementsMock = {
  clear: jest.fn(),
  focus: jest.fn(),
  getElement: jest.fn(),
};

/**
 * Secure3DModal Test
 */
describe('<Secure3DModal />', () => {
  it('should render the 3D Secure bank details with stripe.setupIntent when trial mode is true', async () => {
    const subscriptionDetails = camelCaseObject(
      Factory.build('subscription', { is_trial_eligible: true }, { numProducts: 2 }),
    );
    const subscriptionStatus = camelCaseObject(Factory.build('subscriptionStatus', {
      status: 'requires_action',
    }));

    // Mock useEffect to bypass the fetchSecureDetails call
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f) => f());

    const { container } = render(<Secure3DModal stripe={stripeMock} elements={elementsMock} />);
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(subscriptionDetails),
      );
      store.dispatch(
        subscriptionStatusReceived(subscriptionStatus),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });

    await act(() => setupIntentPromise);
    await act(() => paymentIntentPromise);

    // Expect the modal to be rendered
    // screen.debug();
    expect(container.querySelector('#secure-3ds-wrapper')).toBeDefined();
    expect(container.querySelector('#secure-3d-iframe')).toBeDefined();

    // Ensure that loadSecureDetails is called with the correct URL
    expect(stripeMock.retrieveSetupIntent).toHaveBeenCalledWith(subscriptionStatus.confirmationClientSecret);
  });

  it('should render the 3D Secure bank details with stripe.paymentIntent when trial mode is false', async () => {
    const subscriptionDetails = camelCaseObject(
      Factory.build('subscription', { is_trial_eligible: false }, { numProducts: 2 }),
    );
    const subscriptionStatus = camelCaseObject(Factory.build('subscriptionStatus', {
      status: 'requires_action',
    }));

    // Mock useEffect to bypass the fetchSecureDetails call
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f) => f());

    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(subscriptionDetails),
      );
      store.dispatch(
        subscriptionStatusReceived(subscriptionStatus),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });

    const { container } = render(<Secure3DModal stripe={stripeMock} elements={elementsMock} />);
    await act(() => setupIntentPromise);
    await act(() => paymentIntentPromise);

    // Expect the modal to be rendered
    screen.debug();
    const iframe = container.querySelector('#secure-3d-iframe');
    expect(iframe).toBeDefined();
    expect(container.querySelector('#secure-3d-iframe')).toBeDefined();

    // Ensure that loadSecureDetails is called with the correct URL
    expect(stripeMock.retrievePaymentIntent).toHaveBeenCalledWith(subscriptionStatus.confirmationClientSecret);
  });
});
