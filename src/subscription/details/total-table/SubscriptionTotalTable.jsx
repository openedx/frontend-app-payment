import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import LocalizedPrice from '../../../payment/cart/LocalizedPrice';

export const SubscriptionTotalTable = ({ total }) => (
  <div className="summary-row font-weight-bold d-flex">
    <FormattedMessage
      id="subscription.summary.table.label.total.to.pay"
      defaultMessage="Today's total"
      description="Label for the final total subscription price of an order."
    >
      { text => <h4 className="flex-grow-1">{text}</h4>}
    </FormattedMessage>
    <h4 className="text-right">
      <LocalizedPrice amount={total} shouldRemoveFractionZeroDigits />
    </h4>
  </div>
);

SubscriptionTotalTable.propTypes = {
  total: PropTypes.number,
};
SubscriptionTotalTable.defaultProps = {
  total: undefined,
};

export default SubscriptionTotalTable;
