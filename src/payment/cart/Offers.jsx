import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from '@edx/frontend-i18n';

import LocalizedPrice from './LocalizedPrice';

function Benefit({ benefitType, benefitValue }) {
  if (benefitType === 'Percentage') {
    return <FormattedNumber value={benefitValue / 100} style="percent" />; // eslint-disable-line react/style-prop-object
  }
  return <LocalizedPrice amount={benefitValue} />;
}

Benefit.propTypes = {
  benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
  benefitValue: PropTypes.number.isRequired,
};

function Offer({
  benefitType, benefitValue, provider, isBundle,
}) {
  let message = null;
  if (provider) {
    message = (<FormattedMessage
      id="payment.summary.discount.offer"
      defaultMessage="{benefit} discount provided by {provider}."
      description="A description of a discount offer applied to a basket."
      values={{
        benefit: (
          <Benefit
            benefitType={benefitType}
            benefitValue={benefitValue}
          />
        ),
        provider,
      }}
    />);
  } else if (!isBundle) {
    message = (<FormattedMessage
      id="payment.summary.discount.dynamic_offer"
      defaultMessage="{benefit} discount for your first upgrade applied."
      description="A description of a discount offer applied to a basket."
      values={{
        benefit: (
          <Benefit
            benefitType={benefitType}
            benefitValue={benefitValue}
          />
        ),
      }}
    />);
  }
  return (
    <p className="m-0 text-muted" key={`${benefitValue}-${provider}`}>
      {message}
    </p>
  );
}

Offer.propTypes = {
  benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
  benefitValue: PropTypes.number.isRequired,
  provider: PropTypes.string,
  isBundle: PropTypes.bool,
};

Offer.defaultProps = {
  provider: null,
  isBundle: false,
};

export default function Offers({ offers, discounts, isBundle }) {
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
          <LocalizedPrice amount={discounts ? discounts * -1 : 0} />
        </span>
      </p>
      {offers.map(offer => (
        <Offer isBundle={isBundle} key={`${offer.benefitValue}-${offer.benefitType}-${offer.provider}`} {...offer} />
      ))}
    </div>
  );
}

Offers.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.shape({
    benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
    benefitValue: PropTypes.number.isRequired,
    provider: PropTypes.string,
  })),
  discounts: PropTypes.number,
  isBundle: PropTypes.bool,
};

Offers.defaultProps = {
  offers: [],
  discounts: undefined,
  isBundle: false,
};
