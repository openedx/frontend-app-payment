import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import messages from './Checkout.messages';
import { paymentSelector, updateClientSecretSelector } from '../data/selectors';
import { submitPayment } from '../data/actions';
import AcceptedCardLogos from './assets/accepted-card-logos.png';

import PaymentForm from './payment-form/PaymentForm';
import StripePaymentForm from './payment-form/StripePaymentForm';
import FreeCheckoutOrderButton from './FreeCheckoutOrderButton';
import { PayPalButton } from '../payment-methods/paypal';
import { ORDER_TYPES } from '../data/constants';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY, {
  betas: [process.env.STRIPE_BETA_FLAG],
  apiVersion: process.env.STRIPE_API_VERSION,
});

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
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  handleSubmitApplePay = () => {
    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for PayPal and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      { type: 'click', category: 'checkout', paymentMethod: 'Apple Pay' },
    );

    this.props.submitPayment({ method: 'apple-pay' });
  };

  handleSubmitCybersource = (formData) => {
    this.props.submitPayment({ method: 'cybersource', ...formData });
  };

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
        flexMicroformEnabled: true,
      },
    );
  };

  handleSubmitStripe = () => {
    // TODO: We'll want to submit formData here in the next iteration
    console.log('[Project Zebra] handleSubmitStripe called');
    this.props.submitPayment({ method: 'stripe' });
  };

  handleSubmitStripeButtonClick = () => {
    console.log('[Project Zebra] handleSubmitStripeButtonClick');
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Credit Card - Stripe',
        checkoutType: 'client_side',
      },
    );
  };

  handleSubmitFreeCheckout = () => {
    sendTrackEvent(
      'edx.bi.ecommerce.basket.free_checkout',
      { type: 'click', category: 'checkout' },
    );
  };

  renderBillingFormSkeleton() {
    return (
      <>
        <div className="skeleton py-1 mb-3 w-25" />
        <div className="row">
          <div className="col-lg-6">
            <div className="skeleton py-3 mb-3" />
            <div className="skeleton py-3 mb-3" />
            <div className="skeleton py-3 mb-3" />
            <div className="skeleton py-3 mb-3" />
          </div>
          <div className="col-lg-6">
            <div className="skeleton py-3 mb-3" />
            <div className="skeleton py-3 mb-3" />
            <div className="skeleton py-3 mb-3" />
            <div className="skeleton py-3 mb-3" />
          </div>
        </div>
        <div className="skeleton py-1 mb-3 mt-5 w-25" />
        <div className="row">
          <div className="col-lg-6">
            <div className="skeleton py-3 mb-3" />
          </div>
          <div className="col-lg-6">
            <div className="skeleton py-3 mb-3" />
          </div>
        </div>
      </>
    );
  }

  renderCheckoutOptions() {
    console.log('[Project Zebra] props in Checkout.jsx', this.props);
    const {
      enableStripePaymentProcessor,
      intl,
      isFreeBasket,
      isBasketProcessing,
      loading,
      loaded,
      paymentMethod,
      submitting,
      orderType,
    } = this.props;
    const submissionDisabled = loading || isBasketProcessing;
    const isBulkOrder = orderType === ORDER_TYPES.BULK_ENROLLMENT;
    const isQuantityUpdating = isBasketProcessing && loaded;

    // Stripe element config
    // TODO: Move these to a better home
    const appearance = {
      theme: 'stripe',
    };
    const options = {
      clientSecret: this.props.clientSecretId,
      appearance,
      fields: {
        billingDetails: 'never',
      },
    };

    // istanbul ignore next
    const payPalIsSubmitting = submitting && paymentMethod === 'paypal';
    // istanbul ignore next
    const cybersourceIsSubmitting = submitting && paymentMethod === 'cybersource';
    // istanbul ignore next
    const stripeIsSubmitting = submitting && paymentMethod === 'stripe';

    if (isFreeBasket) {
      return (
        <FreeCheckoutOrderButton
          onClick={this.handleSubmitFreeCheckout}
        />
      );
    }

    const basketClassName = 'basket-section';

    // TODO: fix loading, enableStripePaymentProcessor and clientSecretId distinction
    // 1. loading should be renamed to loadingBasket
    // 2. enableStripePaymentProcessor can be temporarily false while loading is true
    // since the flag is in the BFF basket endpoint. Possibly change this?
    // 3. Right now when fetching capture context, CyberSource's captureKey is saved as clientSecretId
    // so we cannot rely on !options.clientSecret to distinguish btw payment processors
    // 4. There is a delay from when the basket is done loading (plus the flag value)
    // and when we get the clientSecretId so there is a point in time when loading skeleton
    // is hidden but the Stripe billing and credit card fields are not shown
    const shouldDisplayStripePaymentForm = !loading && enableStripePaymentProcessor && options.clientSecret;
    const shouldDisplayCyberSourcePaymentForm = !loading && !enableStripePaymentProcessor;

    return (
      <>
        <div className={basketClassName}>
          <h5 aria-level="2">
            <FormattedMessage
              id="payment.select.payment.method.heading"
              defaultMessage="Select Payment Method"
              description="The heading for the payment type selection section"
            />
          </h5>

          <p className="d-flex flex-wrap">
            <button type="button" className="payment-method-button active">
              <img
                src={AcceptedCardLogos}
                alt={intl.formatMessage(messages['payment.page.method.type.credit'])}
              />
            </button>

            <PayPalButton
              onClick={this.handleSubmitPayPal}
              className={classNames('payment-method-button', { 'skeleton-pulse': loading })}
              disabled={submissionDisabled}
              isProcessing={payPalIsSubmitting}
            />

            {/* Apple Pay temporarily disabled per REV-927  - https://github.com/openedx/frontend-app-payment/pull/256 */}
          </p>
        </div>

        {shouldDisplayStripePaymentForm ? (
          <Elements options={options} stripe={stripePromise}>
            <StripePaymentForm
              options={options}
              onSubmitPayment={this.handleSubmitStripe}
              onSubmitButtonClick={this.handleSubmitStripeButtonClick}
              disabled={submitting}
              isBulkOrder={isBulkOrder}
              isProcessing={stripeIsSubmitting}
              loading={loading}
              isQuantityUpdating={isQuantityUpdating}
            />
          </Elements>
        ) : (loading && (this.renderBillingFormSkeleton()))}

        {shouldDisplayCyberSourcePaymentForm && (
        <PaymentForm
          onSubmitPayment={this.handleSubmitCybersource}
          onSubmitButtonClick={this.handleSubmitCybersourceButtonClick}
          disabled={submitting}
          loading={loading}
          loaded={loaded}
          isProcessing={cybersourceIsSubmitting}
          isBulkOrder={isBulkOrder}
          isQuantityUpdating={isQuantityUpdating}
        />
        )}
      </>
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
  loaded: PropTypes.bool,
  submitPayment: PropTypes.func.isRequired,
  isFreeBasket: PropTypes.bool,
  submitting: PropTypes.bool,
  isBasketProcessing: PropTypes.bool,
  paymentMethod: PropTypes.oneOf(['paypal', 'apple-pay', 'cybersource']),
  orderType: PropTypes.oneOf(Object.values(ORDER_TYPES)),
  enableStripePaymentProcessor: PropTypes.bool,
  clientSecretId: PropTypes.string,
};

Checkout.defaultProps = {
  loading: false,
  loaded: false,
  submitting: false,
  isBasketProcessing: false,
  isFreeBasket: false,
  paymentMethod: undefined,
  orderType: ORDER_TYPES.SEAT,
  enableStripePaymentProcessor: false,
  clientSecretId: null,
};

const mapStateToProps = (state) => ({
  ...paymentSelector(state),
  ...updateClientSecretSelector(state),
});

export default connect(mapStateToProps, { submitPayment })(injectIntl(Checkout));
