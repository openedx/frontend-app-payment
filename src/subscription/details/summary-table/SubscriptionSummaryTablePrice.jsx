import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from '@edx/frontend-platform/i18n';

import { getPropsToRemoveFractionZeroDigits } from '../../../payment/data/utils';

export const SubscriptionSummaryTablePrice = ({ price, isTrialEligible, currency }) => (
  <div className="summary-row d-flex">
    <h4 className="flex-grow-1">
      <FormattedMessage
        id="subscription.summary.table.label.price"
        defaultMessage="Price"
        description="Label for price excluding discount line on order summary table"
      />
    </h4>
    <h4 className="summary-price">
      <FormattedNumber
        value={price}
        style="currency" // eslint-disable-line react/style-prop-object
        currency={currency}
        {...getPropsToRemoveFractionZeroDigits({
          price,
          shouldRemoveFractionZeroDigits: true,
        })}
      />
      { isTrialEligible
        ? (
          <FormattedMessage
            id="subscription.summary.table.label.trialing.price"
            defaultMessage="/month USD after 7-day free trial"
            description="Label for subscription on order summary table"
          />
        )
        : (
          <FormattedMessage
            id="subscription.summary.table.label.resubscribe.price"
            defaultMessage="/month USD"
            description="Label for subscription on order summary table"
          />
        )}
    </h4>
  </div>
);

SubscriptionSummaryTablePrice.propTypes = {
  price: PropTypes.number,
  isTrialEligible: PropTypes.bool,
  currency: PropTypes.string,
};
SubscriptionSummaryTablePrice.defaultProps = {
  price: undefined,
  isTrialEligible: false,
  currency: 'USD',
};

export default SubscriptionSummaryTablePrice;
