import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedNumber } from '@edx/frontend-i18n';

import { localizedCurrencySelector } from './data/selectors';

/**
 * Displays a positive or negative price, according to the currency and the conversion rate set
 * in the edx-price-l10n cookie, or USD if no cookie exists.  If the currency is not USD, the
 * price is displayed with an * alert symbol next to it.
 */
function LocalizedPrice(props) {
  if (props.amount === undefined) {
    return null;
  }

  const price = props.conversionRate * props.amount;

  const priceElement = (<FormattedNumber
    value={price}
    style="currency" // eslint-disable-line react/style-prop-object
    currency={props.currencyCode}
  />);

  if (props.showAsLocalizedCurrency) {
    return (
      <span>
        {priceElement} *
      </span>
    );
  }

  return priceElement;
}

LocalizedPrice.propTypes = {
  amount: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  conversionRate: PropTypes.number,
  currencyCode: PropTypes.string,
  showAsLocalizedCurrency: PropTypes.bool,
};

LocalizedPrice.defaultProps = {
  amount: undefined,
  conversionRate: 1,
  currencyCode: 'USD',
  showAsLocalizedCurrency: false,
};

export default connect(localizedCurrencySelector)(LocalizedPrice);
