import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedNumber, FormattedMessage } from '@edx/frontend-i18n';

import { basketSelector } from './data/selectors';
import { CouponForm } from './coupon';


function SummaryTable({ summaryDiscounts, summaryPrice }) {
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
            {summaryPrice !== undefined ? (
              <FormattedNumber
                value={summaryPrice}
                style="currency" // eslint-disable-line react/style-prop-object
                currency="USD"
              />
            ) : null}
          </td>
        </tr>

        {summaryDiscounts !== undefined && summaryDiscounts !== null &&
        summaryDiscounts > 0 ? (
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
                value={summaryDiscounts * -1}
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
  summaryDiscounts: PropTypes.number,
  summaryPrice: PropTypes.number,
};
SummaryTable.defaultProps = {
  summaryDiscounts: undefined,
  summaryPrice: undefined,
};

function DiscountOffers({ offers }) {
  if (offers.length === 0) return null;

  return (
    <ul className="text-muted list-unstyled">
      {offers.map(({ benefitValue, provider }) => (
        <li key={`${benefitValue}-${provider}`}>
          <FormattedMessage
            id="payment.summary.discount.offer"
            defaultMessage="{benefitValue} discount provided by {provider}."
            description="A description of a discount offer applied to a basket."
            values={{ benefitValue, provider }}
          />
        </li>
      ))}
    </ul>
  );
}

DiscountOffers.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.shape({
    benefitValue: PropTypes.string,
    provider: PropTypes.string,
  })),
};

DiscountOffers.defaultProps = {
  offers: [],
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
      <h5 id="summary-heading" aria-level="2">
        <FormattedMessage
          id="payment.order.details.heading"
          defaultMessage="Summary"
          description="The heading for the order summary table and coupon section of the basket"
        />
      </h5>

      <SummaryTable
        summaryPrice={props.summaryPrice}
        summaryDiscounts={props.summaryDiscounts}
      />

      <DiscountOffers offers={props.offers} />

      {props.showCouponForm ? <CouponForm /> : null}

      <TotalTable orderTotal={props.orderTotal} />
    </div>
  );
}


BasketSummary.propTypes = {
  showCouponForm: PropTypes.bool,
  orderTotal: PropTypes.number,
  summaryDiscounts: PropTypes.number,
  summaryPrice: PropTypes.number,
  offers: PropTypes.arrayOf(PropTypes.shape({
    benefitValue: PropTypes.string,
    provider: PropTypes.string,
  })),
};

BasketSummary.defaultProps = {
  showCouponForm: false,
  orderTotal: undefined,
  summaryDiscounts: undefined,
  summaryPrice: undefined,
  offers: [],
};

export default connect(basketSelector)(BasketSummary);
