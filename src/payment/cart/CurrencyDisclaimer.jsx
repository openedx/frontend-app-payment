import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FormattedMessage, FormattedNumber } from '@edx/frontend-platform/i18n';

/**
 * CurrencyDisclaimer
 * it tells the user if they will be charged in USD even though
 * it might show a localized price currency
 * */
export const CurrencyDisclaimer = ({
  actualCurrencyCode,
  currencyDisclaimerSelector,
}) => {
  const { actualAmount } = useSelector(currencyDisclaimerSelector);
  return (
    <div className="text-muted font-italic">
      <FormattedMessage
        id="payment.currency.disclaimer"
        defaultMessage="* This total contains an approximate conversion. You will be charged {actualAmount} {actualCurrencyCode}."
        description="A notification that shows if we are displaying approximate prices in the user's local currency, instead of USD."
        values={{
          actualAmount: (
            <FormattedNumber
              value={actualAmount}
              style="currency" // eslint-disable-line react/style-prop-object
              currency={actualCurrencyCode}
            />
          ),
          actualCurrencyCode,
        }}
      />
    </div>
  );
};

CurrencyDisclaimer.propTypes = {
  actualCurrencyCode: PropTypes.string,
  currencyDisclaimerSelector: PropTypes.func.isRequired,
};

CurrencyDisclaimer.defaultProps = {
  actualCurrencyCode: 'USD',
};

export default CurrencyDisclaimer;
