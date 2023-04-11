import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';
import { detailsSelector } from '../../data/details/selectors';

const messages = defineMessages({
  'subscription.checkout.billing.notification': {
    id: 'subscription.checkout.billing.notification',
    defaultMessage: 'You’ll be charged {price} {currency} on {trialEnd} then every 31 days until you cancel your subscription.',
    description: 'Subscription monthly billing notification for Users that they will be charged every 31 days for this subscription.',
  },
});

const MonthlyBillingNotification = () => {
  const { price, currency, trialEnd } = useSelector(detailsSelector);
  // TODO: render different text in case of resubscribe
  const intl = useIntl();
  return (
    <div className="d-flex col-12 justify-content-end pr-0">
      <p className="micro">
        {
        intl.formatMessage(messages['subscription.checkout.billing.notification'], {
          currency,
          trialEnd,
          price: intl.formatNumber(price, { style: 'currency', currency: currency || 'USD' }),
        })
      }
      </p>
    </div>
  );
};

export default MonthlyBillingNotification;
