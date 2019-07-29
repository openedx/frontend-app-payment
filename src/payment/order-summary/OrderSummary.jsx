/* eslint-disable react/style-prop-object */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-i18n';

import { basketSelector } from '../data/selectors';
import BulkOrderSummaryTable from './BulkOrderSummaryTable';
import SummaryTable from './SummaryTable';
import TotalTable from './TotalTable';
import CouponForm from './CouponForm';
import Offers from './Offers';

import { ORDER_TYPES } from '../data/constants';


function OrderSummary({
  orderType,
  summaryPrice,
  summarySubtotal,
  summaryQuantity,
  summaryDiscounts,
  offers,
  orderTotal,
  showCouponForm,
}) {
  return (
    <div
      role="region"
      aria-labelledby="summary-heading"
      aria-live="polite"
      className="basket-section"
    >
      <h5 id="summary-heading" aria-level="2">
        <FormattedMessage
          id="payment.order.details.heading"
          defaultMessage="Summary"
          description="The heading for the order summary table and coupon section of the basket"
        />
      </h5>

      {orderType === ORDER_TYPES.BULK_ENROLLMENT ? (
        <BulkOrderSummaryTable
          price={summaryPrice}
          subtotal={summarySubtotal}
          quantity={summaryQuantity}
        />
      ) : (
        <SummaryTable price={summaryPrice} />
      )}

      <Offers discounts={summaryDiscounts} offers={offers} />

      {showCouponForm ? <CouponForm /> : null}

      <TotalTable total={orderTotal} />
    </div>
  );
}

OrderSummary.propTypes = {
  showCouponForm: PropTypes.bool,
  orderType: PropTypes.oneOf(Object.values(ORDER_TYPES)),
  orderTotal: PropTypes.number,
  summarySubtotal: PropTypes.number,
  summaryQuantity: PropTypes.number,
  summaryDiscounts: PropTypes.number,
  summaryPrice: PropTypes.number,
  offers: PropTypes.arrayOf(PropTypes.shape({
    benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
    benefitValue: PropTypes.number.isRequired,
    provider: PropTypes.string.isRequired,
  })),
};

OrderSummary.defaultProps = {
  showCouponForm: false,
  orderType: ORDER_TYPES.SEAT,
  orderTotal: undefined,
  summarySubtotal: undefined,
  summaryQuantity: undefined,
  summaryDiscounts: undefined,
  summaryPrice: undefined,
  offers: [],
};

export default connect(basketSelector)(OrderSummary);
