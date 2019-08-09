import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-analytics';

import { ApplePayButton } from './payment-methods/apple-pay';
import { submitPayment } from './data/actions';

function ApplePayButtonContainer(props) {
  const handleClick = useCallback(() => {
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

    props.submitPayment({ method: 'apple-pay' });
  });

  return (
    <ApplePayButton
      className={`payment-method-button ${props.className}`}
      disabled={props.disabled}
      onClick={handleClick}
    />
  );
}

ApplePayButtonContainer.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  submitPayment: PropTypes.func.isRequired,
};

ApplePayButtonContainer.defaultProps = {
  className: undefined,
  disabled: false,
};

const mapStateToProps = state => ({
  disabled: state.payment.basket.submitting,
});

export default connect(mapStateToProps, { submitPayment })(ApplePayButtonContainer);
