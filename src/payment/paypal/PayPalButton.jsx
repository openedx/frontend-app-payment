import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';
import { sendTrackEvent } from '@edx/frontend-analytics';

import PayPalLogo from './assets/paypal-logo.png';
import messages from './PayPalButton.messages';
import { submitPaymentPayPal } from './data/actions';

class PayPalButton extends React.Component {
  handleClick = () => {
    if (this.props.disabled) return;

    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for ApplePay and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'PayPal',
      },
    );
    this.props.submitPaymentPayPal();
  }


  render() {
    const {
      intl, submitting, className, disabled,
    } = this.props;

    return (
      <button
        onClick={this.handleClick}
        className={classNames('payment-method-button', className)}
        disabled={submitting || disabled}
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
  className: PropTypes.string,
  submitting: PropTypes.bool,
  disabled: PropTypes.bool,
  submitPaymentPayPal: PropTypes.func.isRequired,
};

PayPalButton.defaultProps = {
  submitting: false,
  className: undefined,
  disabled: false,
};

const mapStateToProps = state => state.payment.paypal;

export default connect(mapStateToProps, { submitPaymentPayPal })(injectIntl(PayPalButton));
