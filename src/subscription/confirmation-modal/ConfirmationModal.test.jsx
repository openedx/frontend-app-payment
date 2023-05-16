/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable global-require */
import React from 'react';
import { Factory } from 'rosie';

import '../__factories__/subscription.factory';
import '../__factories__/subscriptionStatus.factory';

import {
  render, act, store, config, // fireEvent
} from '../test-utils';
import { ConfirmationModal } from './ConfirmationModal';
import { fetchSubscriptionDetails, subscriptionDetailsReceived } from '../data/details/actions';
import { subscriptionStatusReceived } from '../data/status/actions';

import { camelCaseObject } from '../../payment/data/utils';

/**
 * ConfirmationModal Test
 */
describe('<ConfirmationModal />', () => {
  it('should not render the <ConfirmationModal/> when confirmationStatus is null', () => {
    const { queryByText, queryByRole } = render(<ConfirmationModal />);

    const heading = queryByText('Congratulations! Your 7-day free trial of Blockchain Fundamentals has started.');
    expect(heading).not.toBeInTheDocument();

    const button = queryByRole('button', { name: 'Go to dashboard' });
    expect(button).not.toBeInTheDocument();
  });

  it('should render the <ConfirmationModal/> with the resubscribe details', () => {
    const subscriptionDetails = camelCaseObject(Factory.build('subscription', { is_trial_eligible: false }, { numProducts: 2 }));
    const subscriptionStatus = camelCaseObject(Factory.build('subscriptionStatus'));

    const { getByText } = render(<ConfirmationModal />);
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(subscriptionDetails),
      );
      store.dispatch(
        subscriptionStatusReceived(subscriptionStatus),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });
    const heading = getByText(`Congratulations! Your subscription to ${subscriptionDetails.programTitle} has started.`);
    expect(heading).toBeInTheDocument();
  });

  it('should render the <ConfirmationModal/> with the subscription trialing details', () => {
    const subscriptionDetails = camelCaseObject(Factory.build('subscription', {}, { numProducts: 2 }));
    const subscriptionStatus = camelCaseObject(Factory.build('subscriptionStatus'));

    const { getByText, getByRole } = render(<ConfirmationModal />);
    act(() => {
      store.dispatch(
        subscriptionDetailsReceived(subscriptionDetails),
      );
      store.dispatch(
        subscriptionStatusReceived(subscriptionStatus),
      );
      store.dispatch(fetchSubscriptionDetails.fulfill());
    });

    const heading = getByText(`Congratulations! Your 7-day free trial of ${subscriptionDetails.programTitle} has started.`);
    expect(heading).toBeInTheDocument();

    const gotoDashboardLink = getByRole('link', { name: 'Go to dashboard' });
    expect(gotoDashboardLink).toBeInTheDocument();
    expect(gotoDashboardLink).toHaveAttribute('href', `${config.LMS_BASE_URL}/dashboard/programs/${subscriptionDetails.programUuid}`);

    const ordersLink = getByRole('link', { name: 'Orders and Subscriptions' });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute('href', config.ORDER_HISTORY_URL);
  });
});
