import React from 'react';
import PropTypes from 'prop-types';
import { performApplePayPayment } from './service';


export default class ApplePayButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      canMakePayments: global.ApplePaySession && global.ApplePaySession.canMakePayments(),
    };
  }

  handleClick = () => {
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
    if (!this.state.canMakePayments || this.props.totalAmount === undefined) return null;

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
        className="apple-pay-button"
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
};

ApplePayButton.defaultProps = {
  totalAmount: undefined,
  onPaymentBegin: undefined,
  onPaymentComplete: undefined,
  onMerchantValidationFailure: undefined,
  onPaymentAuthorizationFailure: undefined,
  onPaymentCancel: undefined,
};
