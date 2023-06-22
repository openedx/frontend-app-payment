import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import {
  useIntl,
  getLocale,
} from '@edx/frontend-platform/i18n';

import moment from 'moment-timezone';

import { AppContext } from '@edx/frontend-platform/react';
import { getPropsToRemoveFractionZeroDigits } from '../../../payment/data/utils';
import { detailsSelector } from '../../data/details/selectors';

import messages from './messages';

const MonthlyBillingNotification = () => {
  const {
    price, currency, trialEnd, isTrialEligible,
  } = useSelector(detailsSelector);
  const intl = useIntl();
  const { authenticatedUser } = useContext(AppContext);

  const userTimezone = (
    authenticatedUser.timeZone || moment.tz.guess() || 'UTC'
  );
  const date = moment(trialEnd);
  const localizeDate = date.tz(userTimezone);

  // Format the date as "June 28, 2022 (PKT)"
  const formattedDate = localizeDate.locale(getLocale()).format('MMMM D, YYYY (z)');

  const trialDateHelpingText = intl.formatMessage(messages['subscription.checkout.billing.trial.date'], { date: formattedDate });
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
