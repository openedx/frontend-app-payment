import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from '@edx/frontend-platform/i18n';

import { getPropsToRemoveFractionZeroDigits } from '../../../payment/data/utils';

export const SubscriptionTotalTable = ({ total, currency }) => (
  <div className="summary-row font-weight-bold d-flex">
    <FormattedMessage
      id="subscription.summary.table.label.total.to.pay"
      defaultMessage="Today's total"
      description="Label for the final total subscription price of an order."
    >
      { text => <h4 className="flex-grow-1">{text}</h4>}
    </FormattedMessage>
    <h4 className="text-right">
      <FormattedNumber
        value={total}
        style="currency" // eslint-disable-line react/style-prop-object
        currency={currency}
        {...getPropsToRemoveFractionZeroDigits({
          price: total,
          shouldRemoveFractionZeroDigits: true,
        })}
      />
    </h4>
  </div>
);

SubscriptionTotalTable.propTypes = {
  total: PropTypes.number,
  currency: PropTypes.string,
};
SubscriptionTotalTable.defaultProps = {
  total: 0,
  currency: 'USD',
};

export default SubscriptionTotalTable;
