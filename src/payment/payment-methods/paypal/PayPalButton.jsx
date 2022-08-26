import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import PayPalLogo from './assets/paypal-logo.png';
import messages from './PayPalButton.messages';

function PayPalButton({ intl, isProcessing, ...props }) {
  return (
    <button type="button" {...props}>
      { isProcessing ? <span className="button-spinner-icon text-primary mr-2" /> : null }
      <img
        src={PayPalLogo}
        alt={intl.formatMessage(messages['payment.type.paypal'])}
      />
    </button>
  );
}

PayPalButton.propTypes = {
  intl: intlShape.isRequired,
  isProcessing: PropTypes.bool,
};

PayPalButton.defaultProps = {
  isProcessing: false,
};

export default injectIntl(PayPalButton);
