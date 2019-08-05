import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { sendTrackEvent } from '@edx/frontend-analytics';
import { performApplePayPayment } from './service';


export default class ApplePayButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      canMakePayments: global.ApplePaySession && global.ApplePaySession.canMakePayments(),
    };
  }

  canSubmit() {
    return this.state.canMakePayments
      && !this.props.disabled
      && this.props.totalAmount !== undefined;
  }

  handleClick = () => {
    if (!this.canSubmit()) return;

    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for PayPal and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Apple Pay',
      },
    );
    performApplePayPayment({
      totalAmount: this.props.totalAmount,
      onPaymentBegin: this.props.onPaymentBegin,
      onPaymentComplete: this.props.onPaymentComplete,
      onMerchantValidationFailure: this.props.onMerchantValidationFailure,
      onPaymentAuthorizationFailure: this.props.onPaymentAuthorizationFailure,
      onPaymentCancel: this.props.onPaymentCancel,
    });
  }

  render() {
    if (!this.state.canMakePayments) return null;

    const other = { ...this.props };

    delete other.totalAmount;
    delete other.onPaymentBegin;
    delete other.onPaymentComplete;
    delete other.onMerchantValidationFailure;
    delete other.onPaymentAuthorizationFailure;
    delete other.onPaymentCancel;

    return (
      <button
        {...other}
        id="applePayBtn"
        onClick={this.handleClick}
        className={classNames('apple-pay-button', this.props.className)}
        lang={this.props.lang}
        title={this.props.title}
      />
    );
  }
}

ApplePayButton.propTypes = {
  totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPaymentBegin: PropTypes.func,
  onPaymentComplete: PropTypes.func,
  onMerchantValidationFailure: PropTypes.func,
  onPaymentAuthorizationFailure: PropTypes.func,
  onPaymentCancel: PropTypes.func,
  lang: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

ApplePayButton.defaultProps = {
  totalAmount: undefined,
  onPaymentBegin: undefined,
  onPaymentComplete: undefined,
  onMerchantValidationFailure: undefined,
  onPaymentAuthorizationFailure: undefined,
  onPaymentCancel: undefined,
  className: undefined,
  disabled: false,
};
