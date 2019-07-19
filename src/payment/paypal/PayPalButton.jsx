import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import PayPalLogo from './assets/paypal-logo.png';
import messages from './PayPalButton.messages';
import { submitPaymentPayPal } from './data/actions';

class PayPalButton extends React.Component {
  handleClick = () => {
    this.props.submitPaymentPayPal();
  }

  render() {
    const { intl, submitting } = this.props;
    return (
      <button
        onClick={this.handleClick}
        className="payment-method-button"
        disabled={submitting}
      >
        <img
          src={PayPalLogo}
          alt={intl.formatMessage(messages['payment.type.paypal'])}
        />
      </button>
    );
  }
}

PayPalButton.propTypes = {
  intl: intlShape.isRequired,
  submitting: PropTypes.bool,
  submitPaymentPayPal: PropTypes.func.isRequired,
};

PayPalButton.defaultProps = {
  submitting: false,
};

const mapStateToProps = state => state.payment.paypal;

export default connect(mapStateToProps, { submitPaymentPayPal })(injectIntl(PayPalButton));
