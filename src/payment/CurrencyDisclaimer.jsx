import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedNumber, injectIntl } from '@edx/frontend-i18n';

import { currencyDisclaimerSelector } from './data/selectors';

function CurrencyDisclaimer(props) {
  return (
    <div className="text-muted">
      <FormattedMessage
        id="payment.currency.disclaimer"
        defaultMessage="* This total contains an approximate conversion. You will be charged {actualAmount} {actualCurrencyCode}."
        description="A notification that shows if we are displaying approximate prices in the user's local currency, instead of USD."
        values={{
            actualAmount: (
              <FormattedNumber
                value={props.actualAmount}
                style="currency" // eslint-disable-line react/style-prop-object
                currency={props.actualCurrencyCode}
              />
            ),
            actualCurrencyCode: props.actualCurrencyCode,
          }}
      />
    </div>
  );
}

CurrencyDisclaimer.propTypes = {
  actualAmount: PropTypes.number.isRequired,
  actualCurrencyCode: PropTypes.string,
};

CurrencyDisclaimer.defaultProps = {
  actualCurrencyCode: 'USD',
};

export default connect(currencyDisclaimerSelector)(injectIntl(CurrencyDisclaimer));
