import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import LocalizedPrice from './LocalizedPrice';

export default function SummaryTable({ price }) {
  return (
    <div className="summary-row d-flex">
      <span className="flex-grow-1">
        <FormattedMessage
          id="payment.summary.table.label.price"
          defaultMessage="Price"
          description="Label for price excluding discount line on order summary table"
        />
      </span>
      <span>
        <LocalizedPrice amount={price} />
      </span>
    </div>
  );
}

SummaryTable.propTypes = {
  price: PropTypes.number,
};
SummaryTable.defaultProps = {
  price: undefined,
};
