import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import LocalizedPrice from '../../../payment/cart/LocalizedPrice';

export const SubscriptionSummaryTablePrice = ({ price, isTrialEligible }) => (
  <div className="summary-row d-flex">
    <span className="flex-grow-1">
      <FormattedMessage
        id="subscription.summary.table.label.price"
        defaultMessage="Price"
        description="Label for price excluding discount line on order summary table"
      />
    </span>
    <span className="summary-price">
      <LocalizedPrice amount={price} shouldRemoveFractionZeroDigits />
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
    </span>
  </div>
);

SubscriptionSummaryTablePrice.propTypes = {
  price: PropTypes.number,
  isTrialEligible: PropTypes.bool,
};
SubscriptionSummaryTablePrice.defaultProps = {
  price: undefined,
  isTrialEligible: false,
};

export default SubscriptionSummaryTablePrice;
