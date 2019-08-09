import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import PayPalLogo from './assets/paypal-logo.png';
import messages from './PayPalButton.messages';

const PayPalButton = ({ intl, working, ...props }) => (
  <button {...props}>
    { working ? <span className="button-spinner-icon text-primary mr-2" /> : null }
    <img
      src={PayPalLogo}
      alt={intl.formatMessage(messages['payment.type.paypal'])}
    />
  </button>
);

PayPalButton.propTypes = {
  intl: intlShape.isRequired,
  working: PropTypes.bool,
};

PayPalButton.defaultProps = {
  working: false,
};

export default injectIntl(PayPalButton);
