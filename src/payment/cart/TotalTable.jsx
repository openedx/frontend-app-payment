import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import LocalizedPrice from './LocalizedPrice';

const TotalTable = ({ total, isSubscription }) => (
  <div className="summary-row font-weight-bold d-flex">
    <span className="flex-grow-1">
      {isSubscription ? (
        <FormattedMessage
          id="subscription.summary.table.label.total.to.pay"
          defaultMessage="Today's total"
          description="Label for the final total subscription price of an order."
        />
      ) : (
        <FormattedMessage
          id="payment.summary.table.label.total.to.pay"
          defaultMessage="TOTAL"
          description="Label for the final total price of an order."
        />
      )}
    </span>
    <span className="text-right">
      <LocalizedPrice amount={total} />
    </span>
  </div>
);

TotalTable.propTypes = {
  total: PropTypes.number,
  isSubscription: PropTypes.bool,
};
TotalTable.defaultProps = {
  total: undefined,
  isSubscription: false,
};

export default TotalTable;
