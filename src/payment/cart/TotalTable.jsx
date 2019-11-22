
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import LocalizedPrice from './LocalizedPrice';

export default function TotalTable({ total }) {
  return (
    <div className="summary-row font-weight-bold d-flex">
      <span className="flex-grow-1">
        <FormattedMessage
          id="payment.summary.table.label.total.to.pay"
          defaultMessage="TOTAL"
          description="Label for the final total price of an order."
        />
      </span>
      <span className="text-right">
        <LocalizedPrice amount={total} />
      </span>
    </div>
  );
}

TotalTable.propTypes = {
  total: PropTypes.number,
};
TotalTable.defaultProps = {
  total: undefined,
};
