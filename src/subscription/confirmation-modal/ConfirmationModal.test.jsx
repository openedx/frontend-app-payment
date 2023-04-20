/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable global-require */
import React from 'react';
import { Factory } from 'rosie';

import '../__factories__/subscription.factory';
import {
  render, act, fireEvent, store, config,
} from '../test-utils';
import { ConfirmationModal } from './ConfirmationModal';
import { fetchSubscriptionDetails, subscriptionDetailsReceived } from '../data/details/actions';
import { camelCaseObject } from '../../payment/data/utils';

/**
 * ConfirmationModal Test
 */
describe('<ConfirmationModal />', () => {
  let subscriptionDetails;
  beforeEach(() => {
    subscriptionDetails = camelCaseObject(Factory.build('subscription', {}, { numProducts: 2 }));
    // delete window.location;
    // window.location = {
    //   href: 'about:blank',
    // };
  });

  // afterAll(() => {
  //   window.location = new URL('http://localhost/');
  // });

  it('should render the <ConfirmationModal/> with the subscription details', () => {
    // const mockWindow = {
    //   location: { href: 'about:blank' },
    // };
    // Object.defineProperty(global, 'window', { value: mockWindow });

    const { getByText, getByRole } = render(<ConfirmationModal isVisible />);
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(
          subscriptionDetails,
        ),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });
    const heading = getByText(`Congratulations! Your 7-day free trial of ${subscriptionDetails.programTitle} has started.`);
    expect(heading).toBeInTheDocument();

    const button = getByRole('button', { name: 'Go to dashboard' });
    expect(button).toBeInTheDocument();

    const ordersLink = getByRole('link', { name: 'Orders & Subscriptions' });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute('href', config.ORDER_HISTORY_URL);

    // debug(ordersLink);
    fireEvent.click(ordersLink);
    // // expect(ordersLink).toHaveBeenCalled();

    // expect(window.location.href).toEqual(config.ORDER_HISTORY_URL);
  });

  it('should not render the <ConfirmationModal/> when isVisible is false', () => {
    const { queryByText, queryByRole } = render(<ConfirmationModal isVisible={false} />);

    const heading = queryByText(`Congratulations! Your 7-day free trial of ${subscriptionDetails.programTitle} has started.`);
    expect(heading).not.toBeInTheDocument();

    const button = queryByRole('button', { name: 'Go to dashboard' });
    expect(button).not.toBeInTheDocument();
  });
});
