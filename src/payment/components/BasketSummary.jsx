import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedNumber, FormattedMessage } from '@edx/frontend-i18n';

import { basketSelector } from '../data/selectors';


function SummaryTable({ calculatedDiscount, totalExclDiscount }) {
  return (
    <table className="w-100">
      <tbody>
        <tr>
          <th className="font-weight-normal" scope="row">
            <FormattedMessage
              id="payment.summary.table.label.price"
              defaultMessage="Price"
              description="Label for price excluding discount line on order summary table"
            />
          </th>

          <td className="text-right">
            {totalExclDiscount !== undefined ? (
              <FormattedNumber
                value={totalExclDiscount}
                style="currency" // eslint-disable-line react/style-prop-object
                currency="USD"
              />
            ) : null}
          </td>
        </tr>

        {calculatedDiscount !== undefined ? (
          <tr>
            <th className="font-weight-normal" scope="row">
              <FormattedMessage
                id="payment.summary.table.label.discount.total"
                defaultMessage="Discounts applied"
                description="Label for the total discount applied to an order"
              />
            </th>

            <td className="text-right">
              <FormattedNumber
                value={calculatedDiscount * -1}
                style="currency" // eslint-disable-line react/style-prop-object
                currency="USD"
              />
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}

SummaryTable.propTypes = {
  calculatedDiscount: PropTypes.number,
  totalExclDiscount: PropTypes.number,
};
SummaryTable.defaultProps = {
  calculatedDiscount: undefined,
  totalExclDiscount: undefined,
};


function TotalTable({ orderTotal }) {
  return (
    <table className="w-100">
      <tbody>
        <tr className="font-weight-bold">
          <th scope="row">
            <FormattedMessage
              id="payment.summary.table.label.total.to.pay"
              defaultMessage="TOTAL"
              description="Label for the final total price of an order."
            />
          </th>

          <td className="text-right">
            {orderTotal !== undefined ? (
              <FormattedNumber
                value={orderTotal}
                style="currency" // eslint-disable-line react/style-prop-object
                currency="USD"
              />
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

TotalTable.propTypes = {
  orderTotal: PropTypes.number,
};
TotalTable.defaultProps = {
  orderTotal: undefined,
};


function BasketSummary(props) {
  return (
    <div
      role="region"
      aria-labelledby="summary-heading"
      aria-live="polite"
      className="basket-section"
    >
      <h2 id="summary-heading" className="h6">
        <FormattedMessage
          id="payment.order.details.heading"
          defaultMessage="Summary"
          description="The heading for the order summary table and voucher section of the basket"
        />
      </h2>

      <SummaryTable
        totalExclDiscount={props.totalExclDiscount}
        calculatedDiscount={props.calculatedDiscount}
      />

      {props.showVoucherForm ? null : null /* TODO: Coupons */}

      <TotalTable orderTotal={props.orderTotal} />
    </div>
  );
}


BasketSummary.propTypes = {
  showVoucherForm: PropTypes.bool,
  orderTotal: PropTypes.number,
  calculatedDiscount: PropTypes.number,
  totalExclDiscount: PropTypes.number,
  voucher: PropTypes.shape({
    benefit: PropTypes.shape({
      type: PropTypes.string, // TODO: use PropTypes.oneOf(['Percentage', or other values]),
      value: PropTypes.number,
    }),
    code: PropTypes.string,
  }),
};

BasketSummary.defaultProps = {
  showVoucherForm: false,
  orderTotal: undefined,
  calculatedDiscount: undefined,
  totalExclDiscount: undefined,
  voucher: undefined,
};

export default connect(basketSelector)(BasketSummary);
