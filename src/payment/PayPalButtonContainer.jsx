import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-analytics';

import { PayPalButton } from './payment-methods/paypal';
import { submitPayment } from './data/actions';

class PayPalButtonContainer extends React.Component {
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

    this.props.submitPayment({ method: 'paypal' });
  }

  render() {
    const {
      submitting, className, disabled,
    } = this.props;

    return (
      <PayPalButton
        onClick={this.handleClick}
        className={classNames('payment-method-button', className)}
        disabled={submitting || disabled}
        working={submitting}
      />
    );
  }
}

PayPalButtonContainer.propTypes = {
  className: PropTypes.string,
  submitting: PropTypes.bool,
  disabled: PropTypes.bool,
  submitPayment: PropTypes.func.isRequired,
};

PayPalButtonContainer.defaultProps = {
  submitting: false,
  className: undefined,
  disabled: false,
};

const mapStateToProps = state => ({
  submitting: state.payment.basket.paymentMethod === 'paypal' && state.payment.basket.submitting,
  disabled: state.payment.basket.submitting || state.payment.basket.loading,
});

export default connect(mapStateToProps, { submitPayment })(PayPalButtonContainer);
