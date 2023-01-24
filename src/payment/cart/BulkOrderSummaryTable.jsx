import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import LocalizedPrice from './LocalizedPrice';

const BulkOrderSummaryTable = ({ price, quantity, subtotal }) => (
  <div className="summary-row">
    <table className="w-100">
      <thead>
        <tr>
          <th className="font-weight-normal">
            <FormattedMessage
              id="payment.bulk.summary.table.label.price"
              defaultMessage="Price"
              description="Label for price on bulk order summary table"
            />
          </th>
          <th className="font-weight-normal">
            <FormattedMessage
              id="payment.bulk.summary.table.label.quantity"
              defaultMessage="Quantity"
              description="Label for quantity on bulk order summary table"
            />
          </th>
          <th className="font-weight-normal text-right">
            <FormattedMessage
              id="payment.bulk.summary.table.label.subtotal"
              defaultMessage="Subtotal"
              description="Label for subtotal on bulk order summary table"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <LocalizedPrice amount={price} />
          </td>
          <td>{quantity}</td>
          <td className="text-right">
            <LocalizedPrice amount={subtotal} />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

BulkOrderSummaryTable.propTypes = {
  price: PropTypes.number,
  quantity: PropTypes.number,
  subtotal: PropTypes.number,
};
BulkOrderSummaryTable.defaultProps = {
  price: undefined,
  quantity: undefined,
  subtotal: undefined,
};

export default BulkOrderSummaryTable;
