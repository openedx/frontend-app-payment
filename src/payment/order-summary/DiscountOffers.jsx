import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from '@edx/frontend-i18n';

import LocalizedPrice from './LocalizedPrice';

function DiscountBenefit({ benefitType, benefitValue, currency }) {
  if (benefitType === 'Percentage') {
    return <FormattedNumber value={benefitValue / 100} style="percent" currency={currency} />; // eslint-disable-line react/style-prop-object
  }
  return <LocalizedPrice amount={benefitValue} />;
}

DiscountBenefit.propTypes = {
  benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
  benefitValue: PropTypes.number.isRequired,
  currency: PropTypes.string,
};

DiscountBenefit.defaultProps = {
  currency: undefined,
};

function DiscountOffer({
  currency, benefitType, benefitValue, provider,
}) {
  return (
    <p className="m-0 text-muted" key={`${benefitValue}-${provider}`}>
      <FormattedMessage
        id="payment.summary.discount.offer"
        defaultMessage="{benefit} discount provided by {provider}."
        description="A description of a discount offer applied to a basket."
        values={{
          benefit: (
            <DiscountBenefit
              benefitType={benefitType}
              benefitValue={benefitValue}
              currency={currency}
            />
          ),
          provider,
        }}
      />
    </p>
  );
}

DiscountOffer.propTypes = {
  benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
  benefitValue: PropTypes.number.isRequired,
  currency: PropTypes.string,
  provider: PropTypes.string.isRequired,
};

DiscountOffer.defaultProps = {
  currency: undefined,
};

export default function DiscountOffers({ offers, discounts, currency }) {
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
      {offers.map(offer => (
        <DiscountOffer key={`${offer.benefitValue}-${offer.benefitType}-${offer.provider}`} currency={currency} {...offer} />
      ))}
    </div>
  );
}

DiscountOffers.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.shape({
    benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
    benefitValue: PropTypes.number.isRequired,
    provider: PropTypes.string.isRequired,
  })),
  discounts: PropTypes.number,
  currency: PropTypes.string,
};

DiscountOffers.defaultProps = {
  offers: [],
  discounts: undefined,
  currency: undefined,
};
