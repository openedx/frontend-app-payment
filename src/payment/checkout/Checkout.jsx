import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import messages from './Checkout.messages';
import {
  basketSelector,
  paymentSelector,
  updateClientSecretSelector,
} from '../data/selectors';
import { fetchClientSecret, submitPayment } from '../data/actions';
import AcceptedCardLogos from './assets/accepted-card-logos.png';

import PaymentForm from './payment-form/PaymentForm';
import StripePaymentForm from './payment-form/StripePaymentForm';
import FreeCheckoutOrderButton from './FreeCheckoutOrderButton';
import { PayPalButton } from '../payment-methods/paypal';
import { ORDER_TYPES } from '../data/constants';

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasRedirectedToPaypal: false,
    };
  }

  componentDidMount() {
    this.props.fetchClientSecret();
  }

  handleRedirectToPaypal = () => {
    const { loading, isBasketProcessing, isPaypalRedirect } = this.props;
    const { hasRedirectedToPaypal } = this.state;
    const submissionDisabled = loading || isBasketProcessing;

    if (!submissionDisabled && isPaypalRedirect && !hasRedirectedToPaypal) {
      this.setState({ hasRedirectedToPaypal: true });
      this.handleSubmitPayPal();
    }
  };

  handleSubmitPayPal = () => {
    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for ApplePay and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'PayPal',
        stripeEnabled: this.props.enableStripePaymentProcessor,
      },
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
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Apple Pay',
        stripeEnabled: this.props.enableStripePaymentProcessor,
      },
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
        stripeEnabled: this.props.enableStripePaymentProcessor,
      },
    );
  };

  handleSubmitStripe = (formData) => {
    this.props.submitPayment({ method: 'stripe', ...formData });
  };

  handleSubmitStripeButtonClick = (stripeSelectedPaymentMethod) => {
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: stripeSelectedPaymentMethod === 'affirm' ? 'Affirm - Stripe' : 'Credit Card - Stripe',
        checkoutType: 'client_side',
        stripeEnabled: this.props.enableStripePaymentProcessor,
      },
    );
  };

  handleSubmitFreeCheckout = () => {
    sendTrackEvent(
      'edx.bi.ecommerce.basket.free_checkout',
      { type: 'click', category: 'checkout', stripeEnabled: this.props.enableStripePaymentProcessor },
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
      stripe,
    } = this.props;
    const submissionDisabled = loading || isBasketProcessing;
    const isBulkOrder = orderType === ORDER_TYPES.BULK_ENROLLMENT;
    const isQuantityUpdating = isBasketProcessing && loaded;

    this.handleRedirectToPaypal();

    // Stripe element config
    // TODO: Move these to a better home
    const options = {
      clientSecret: this.props.clientSecretId,
      appearance: {
        // Normally these styling values would come from Paragon,
        // however since stripe requires styling to be passed
        // in through the appearance object they are currently placed here.
        // TODO: Investigate if these values can be pulled into javascript from the Paragon css files
        rules: {
          '.Input': {
            border: 'solid 1px #707070', // $gray-500
            borderRadius: '0',
          },
          '.Input:hover': {
            border: 'solid 1px #1f3226',
          },
          '.Input:focus': {
            color: '#454545',
            backgroundColor: '#FFFFFF', // $white
            borderColor: '#0A3055', // $primary
            outline: '0',
            boxShadow: '0 0 0 1px #0A3055', // $primary
          },
          '.Label': {
            fontSize: '1.125rem',
            fontFamily: 'Inter,Helvetica Neue,Arial,sans-serif',
            fontWeight: '400',
            marginBottom: '0.5rem',
          },
        },
      },
      fields: {
        billingDetails: {
          address: 'never',
        },
      },
      wallets: {
        applePay: 'never',
        googlePay: 'never',
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

    // TODO: Right now when fetching capture context, CyberSource's captureKey is saved as clientSecretId
    // so we cannot rely on !options.clientSecret to distinguish btw payment processors
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
              data-testid="PayPalButton"
            />

            {/* Apple Pay temporarily disabled per REV-927  - https://github.com/openedx/frontend-app-payment/pull/256 */}
          </p>
        </div>
        {/* Passing the enableStripePaymentProcessor flag down the Stripe form component to
        be used in the CardHolderInformation component (child). We could get the flag value
        from Basket selector from the child component but this would require more change for a temp feature,
        since the flag will not be needed when we remove CyberSource.
        This is not needed in CyberSource form component since the default is set to false. */}
        {shouldDisplayStripePaymentForm ? (
          <Elements options={options} stripe={stripe}>
            <StripePaymentForm
              options={options}
              onSubmitPayment={this.handleSubmitStripe}
              onSubmitButtonClick={this.handleSubmitStripeButtonClick}
              isBulkOrder={isBulkOrder}
              isProcessing={stripeIsSubmitting}
              isQuantityUpdating={isQuantityUpdating}
              paymentDataSelector={basketSelector}
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
  fetchClientSecret: PropTypes.func.isRequired,
  submitPayment: PropTypes.func.isRequired,
  isFreeBasket: PropTypes.bool,
  submitting: PropTypes.bool,
  isBasketProcessing: PropTypes.bool,
  paymentMethod: PropTypes.oneOf(['paypal', 'apple-pay', 'cybersource', 'stripe']),
  orderType: PropTypes.oneOf(Object.values(ORDER_TYPES)),
  enableStripePaymentProcessor: PropTypes.bool,
  stripe: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  clientSecretId: PropTypes.string,
  isPaypalRedirect: PropTypes.bool,
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
  stripe: null,
  clientSecretId: null,
  isPaypalRedirect: false,
};

const mapStateToProps = (state) => ({
  ...paymentSelector(state),
  ...updateClientSecretSelector(state),
});

export default connect(mapStateToProps, { fetchClientSecret, submitPayment })(injectIntl(Checkout));
