import React, { useContext, useEffect, useState } from 'react';
import { reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import CardHolderInformation from './CardHolderInformation';
import PlaceOrderButton from './PlaceOrderButton';
// onSubmitPayment, onSubmitButtonClick
function StripePaymentForm({
  clientSecret, disabled, handleSubmit, isBulkOrder, loading, isQuantityUpdating, isProcessing, onSubmitButtonClick,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const context = useContext(AppContext);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: bug on loading state, showLoadingButton is true before Stripe card detail is fully rendered
  // TODO: rename to distinguish loading of data and loading of card details
  const showLoadingButton = loading || isQuantityUpdating || isLoading || !stripe || !elements;

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, clientSecret]);

  const onSubmit = async (values) => {
    // istanbul ignore if
    if (disabled) { return; }

    const {
      firstName,
      lastName,
      address,
      unit,
      city,
      country,
      state,
      postalCode,
      // TODO: find if the below can be saved in Stripe
      // organization,
      // purchasedForOrganization,
    } = values;

    // TODO: CardHolderInformation validation (validateRequiredFields)

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // TODO: add STRIPE_RESPONSE_URL to frontend-platform so we can use it with getConfig()
        return_url: process.env.STRIPE_RESPONSE_URL,
        // TODO: refactor and use a checkout function (like checkoutWithToken)
        payment_method_data: {
          billing_details: {
            address: {
              city,
              country,
              line1: address,
              line2: unit,
              postal_code: postalCode,
              state,
            },
            email: context.authenticatedUser.email,
            name: `${firstName} ${lastName}`,
          },
        },
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message);
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit(onSubmit)}>
      <CardHolderInformation
        showBulkEnrollmentFields={isBulkOrder}
        disabled={disabled}
      />
      <h5 aria-level="2">
        <FormattedMessage
          id="payment.card.details.billing.information.heading"
          defaultMessage="Billing Information"
          description="The heading for the credit card details billing information form"
        />
      </h5>
      <PaymentElement id="payment-element" />
      <PlaceOrderButton
        onSubmitButtonClick={onSubmitButtonClick}
        showLoadingButton={showLoadingButton}
        disabled={disabled}
        isProcessing={isProcessing}
      />
      {/* <button type="submit" disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner" /> : 'Pay now' }
        </span>
      </button> */}
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

StripePaymentForm.propTypes = {
  clientSecret: PropTypes.string,
  disabled: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  isBulkOrder: PropTypes.bool,
  loading: PropTypes.bool,
  isQuantityUpdating: PropTypes.bool,
  isProcessing: PropTypes.bool,
  onSubmitButtonClick: PropTypes.func.isRequired,
};

StripePaymentForm.defaultProps = {
  clientSecret: null,
  disabled: false,
  isBulkOrder: false,
  loading: false,
  isQuantityUpdating: false,
  isProcessing: false,
};

export default reduxForm({ form: 'stripe' })(StripePaymentForm);
