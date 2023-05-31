import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';
import { detailsSelector } from '../../data/details/selectors';
import { getPropsToRemoveFractionZeroDigits } from '../../../payment/data/utils';

const messages = defineMessages({
  'subscription.checkout.billing.notification': {
    id: 'subscription.checkout.billing.notification',
    defaultMessage: 'You will be charged {price} {currency} {trialEnd} then monthly until you cancel your subscription.',
    description: 'Subscription monthly billing notification for Users that they will be charged every 31 days for this subscription.',
  },
  'subscription.checkout.billing.trial.date': {
    id: 'subscription.checkout.billing.trial.date',
    defaultMessage: 'on {date},',
    description: 'Subscription legal trialing helping text.',
  },
  'subscription.checkout.billing.resubscribe.date': {
    id: 'subscription.checkout.billing.resubscribe.date',
    defaultMessage: 'today,',
    description: 'Subscription legal resubscribe helping text.',
  },
});

const MonthlyBillingNotification = () => {
  const {
    price, currency, trialEnd, isTrialEligible,
  } = useSelector(detailsSelector);
  const intl = useIntl();
  const trialDateHelpingText = intl.formatMessage(messages['subscription.checkout.billing.trial.date'], { date: trialEnd });
  const resubscribeDateHelpingText = intl.formatMessage(messages['subscription.checkout.billing.resubscribe.date'], {});

  return (
    <div className="d-flex justify-content-start pt-3 monthly-legal-notification">
      <p>
        {
        intl.formatMessage(messages['subscription.checkout.billing.notification'], {
          currency,
          trialEnd: isTrialEligible ? trialDateHelpingText : resubscribeDateHelpingText,
          price: intl.formatNumber(price, {
            style: 'currency',
            currency: currency || 'USD',
            ...getPropsToRemoveFractionZeroDigits({ price, shouldRemoveFractionZeroDigits: true }),
          }),
        })
      }
      </p>
    </div>
  );
};

export default MonthlyBillingNotification;
