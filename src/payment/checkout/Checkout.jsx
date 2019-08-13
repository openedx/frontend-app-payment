import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import { sendTrackEvent } from '@edx/frontend-analytics';

import messages from './Checkout.messages';
import { paymentSelector } from '../data/selectors';
import { submitPayment } from '../data/actions';
import AcceptedCardLogos from './assets/accepted-card-logos.png';

import PaymentForm from './payment-form/PaymentForm';
import FreeCheckoutOrderButton from './FreeCheckoutOrderButton';
import { PayPalButton } from '../payment-methods/paypal';
import { ApplePayButton } from '../payment-methods/apple-pay';
import { ORDER_TYPES } from '../data/constants';

class Checkout extends React.Component {
  handleSubmitPayPal = () => {
    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for ApplePay and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      { type: 'click', category: 'checkout', paymentMethod: 'PayPal' },
    );

    this.props.submitPayment({ method: 'paypal' });
  }

  handleSubmitApplePay = () => {
    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for PayPal and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      { type: 'click', category: 'checkout', paymentMethod: 'Apple Pay' },
    );

    this.props.submitPayment({ method: 'apple-pay' });
  }

  handleSubmitCybersource = (formData) => {
    this.props.submitPayment({ method: 'cybersource', ...formData });
  }

  // The payment form does client side validation that happens before
  // the submit handler above is fired. We send the tracking event here
  // on click of the submit button for parity with the old page.
  handleSubmitCybersourceButtonClick = () => {
    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for PayPal, ApplePay and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Credit Card',
        checkoutType: 'client_side',
      },
    );
  }

  handleSubmitFreeCheckout = () => {
    sendTrackEvent(
      'edx.bi.ecommerce.basket.free_checkout',
      { type: 'click', category: 'checkout' },
    );
  }

  renderCheckoutOptions() {
    const {
      intl,
      isFreeBasket,
      ecommerceURL,
      loading,
      isBasketProcessing,
      paymentMethod,
      submitting,
      orderType,
    } = this.props;

    const submissionDisabled = loading || isBasketProcessing;
    const isBulkOrder = orderType === ORDER_TYPES.BULK_ENROLLMENT;

    if (isFreeBasket) {
      return (
        <FreeCheckoutOrderButton
          ecommerceURL={ecommerceURL}
          onClick={this.handleSubmitFreeCheckout}
        />
      );
    }

    return (
      <React.Fragment>
        <div className="basket-section">
          <h5 aria-level="2">
            <FormattedMessage
              id="payment.select.payment.method.heading"
              defaultMessage="Select Payment Method"
              description="The heading for the payment type selection section"
            />
          </h5>

          <p className="d-flex flex-wrap">
            <button className="payment-method-button active">
              <img
                src={AcceptedCardLogos}
                alt={intl.formatMessage(messages['payment.page.method.type.credit'])}
              />
            </button>

            <PayPalButton
              onClick={this.handleSubmitPayPal}
              className={classNames('payment-method-button', { 'skeleton-pulse': loading })}
              disabled={submissionDisabled}
              isProcessing={submitting && paymentMethod === 'paypal'}
            />

            <ApplePayButton
              onClick={this.handleSubmitApplePay}
              className={classNames('payment-method-button', { 'skeleton-pulse': loading })}
              disabled={submissionDisabled}
            />
          </p>
        </div>

        <PaymentForm
          onSubmitPayment={this.handleSubmitCybersource}
          onSubmitButtonClick={this.handleSubmitCybersourceButtonClick}
          disabled={submissionDisabled}
          loading={loading}
          isProcessing={submitting && paymentMethod === 'cybersource'}
          isBulkOrder={isBulkOrder}
        />
      </React.Fragment>
    );
  }
  render() {
    const { intl } = this.props;

    return (
      <section
        aria-label={intl.formatMessage(messages['payment.section.payment.details.label'])}
      >
        {this.renderCheckoutOptions()}
      </section>
    );
  }
}

Checkout.propTypes = {
  intl: intlShape.isRequired,
  loading: PropTypes.bool,
  ecommerceURL: PropTypes.string.isRequired,
  submitPayment: PropTypes.func.isRequired,
  isFreeBasket: PropTypes.bool,
  submitting: PropTypes.bool,
  isBasketProcessing: PropTypes.bool,
  paymentMethod: PropTypes.oneOf(['paypal', 'apple-pay', 'cybersource']),
  orderType: PropTypes.oneOf(Object.values(ORDER_TYPES)),
};

Checkout.defaultProps = {
  loading: false,
  submitting: false,
  isBasketProcessing: false,
  isFreeBasket: false,
  paymentMethod: undefined,
  orderType: ORDER_TYPES.SEAT,
};

export default connect(paymentSelector, { submitPayment })(injectIntl(Checkout));
