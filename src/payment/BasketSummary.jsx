import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedNumber, FormattedMessage } from '@edx/frontend-i18n';

import { basketSelector } from './data/selectors';
import { CouponForm } from './coupon';


function SummaryTable({ totalDiscount, totalExclDiscount }) {
  return (
    <table className="w-100 mb-3">
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

        {totalDiscount !== undefined ? (
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
                value={totalDiscount * -1}
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
  totalDiscount: PropTypes.number,
  totalExclDiscount: PropTypes.number,
};
SummaryTable.defaultProps = {
  totalDiscount: undefined,
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
      <h2 id="summary-heading" className="section-heading">
        <FormattedMessage
          id="payment.order.details.heading"
          defaultMessage="Summary"
          description="The heading for the order summary table and voucher section of the basket"
        />
      </h2>

      <SummaryTable
        totalExclDiscount={props.totalExclDiscount}
        totalDiscount={props.totalDiscount}
      />

      {props.showVoucherForm ? <CouponForm /> : null}

      <TotalTable orderTotal={props.orderTotal} />
    </div>
  );
}


BasketSummary.propTypes = {
  showVoucherForm: PropTypes.bool,
  orderTotal: PropTypes.number,
  totalDiscount: PropTypes.number,
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
  totalDiscount: undefined,
  totalExclDiscount: undefined,
  voucher: undefined,
};

export default connect(basketSelector)(BasketSummary);
