/* eslint-disable react/style-prop-object */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedNumber } from '@edx/frontend-i18n';

import { basketSelector } from './data/selectors';
import CouponForm from './CouponForm';
import LocalizedPrice from './LocalizedPrice';

import { ORDER_TYPES } from './data/constants';

function SummaryTable({ price }) {
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


function BulkOrderSummaryTable({ price, quantity, subtotal }) {
  return (
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
}

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


function DiscountOffers({ offers, discounts, currency }) {
  if ((discounts === undefined || discounts <= 0) && offers.length === 0) return null;

  return (
    <div className="summary-row">
      <p className="d-flex m-0">
        <span className="flex-grow-1">
          <FormattedMessage
            id="payment.summary.table.label.discount.total"
            defaultMessage="Discounts applied"
            description="Label for the total discount applied to an order"
          />
        </span>
        <span>
          <LocalizedPrice amount={discounts * -1} />
        </span>
      </p>
      {offers.map(({ benefitType, benefitValue, provider }) => (
        <p className="m-0 text-muted" key={`${benefitValue}-${provider}`}>
          <FormattedMessage
            id="payment.summary.discount.offer"
            defaultMessage="{benefit} discount provided by {provider}."
            description="A description of a discount offer applied to a basket."
            values={{
              benefit: (
                <FormattedNumber
                  value={benefitValue / 100}
                  style={benefitType === 'Percentage' ? 'percent' : 'currency'} // eslint-disable-line react/style-prop-object
                  currency={currency}
                />
              ),
              provider,
            }}
          />
        </p>
      ))}
    </div>
  );
}

DiscountOffers.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.shape({
    benefitValue: PropTypes.string,
    provider: PropTypes.string,
  })),
  discounts: PropTypes.number,
  currency: PropTypes.string,
};

DiscountOffers.defaultProps = {
  offers: [],
  discounts: undefined,
  currency: undefined,
};


function TotalTable({ total }) {
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


function OrderSummary({
  orderType,
  summaryPrice,
  summarySubtotal,
  summaryQuantity,
  summaryDiscounts,
  offers,
  orderTotal,
  showCouponForm,
  currency,
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

      {
        orderType === ORDER_TYPES.BULK_ENROLLMENT ? (
          <BulkOrderSummaryTable
            price={summaryPrice}
            subtotal={summarySubtotal}
            quantity={summaryQuantity}
          />
        ) : (
          <SummaryTable price={summaryPrice} />
        )
      }

      <DiscountOffers
        discounts={summaryDiscounts}
        offers={offers}
        currency={currency}
      />

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
    benefitValue: PropTypes.string,
    provider: PropTypes.string,
  })),
  currency: PropTypes.string,
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
  currency: undefined,
};

export default connect(basketSelector)(OrderSummary);
