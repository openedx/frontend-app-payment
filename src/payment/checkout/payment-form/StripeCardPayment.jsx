import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import CardHolderInformation from './CardHolderInformation';
// onSubmitPayment, onSubmitButtonClick
export default function StripeCardPayment({ clientSecret, disabled, isBulkOrder }) {
  const stripe = useStripe();
  const elements = useElements();

  const context = useContext(AppContext);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // onSubmitButtonClick();
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
        // to handle the formData in a non vanilla JS way
        payment_method_data: {
          billing_details: {
            address: {
              city: e.target[4].value,
              country: e.target[5].value,
              line1: e.target[2].value,
              line2: e.target[3].value,
              postal_code: e.target[7].value,
              state: e.target[6].value,
            },
            email: context.authenticatedUser.email,
            name: `${e.target[0].value} ${e.target[1].value}`,
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
    <form id="payment-form" onSubmit={handleSubmit}>
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
      <button type="submit" disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner" /> : 'Pay now' }
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

StripeCardPayment.propTypes = {
  clientSecret: PropTypes.string,
  disabled: PropTypes.bool,
  isBulkOrder: PropTypes.bool,
  // onSubmitPayment: PropTypes.func.isRequired,
  // onSubmitButtonClick: PropTypes.func.isRequired,
};

StripeCardPayment.defaultProps = {
  clientSecret: null,
  disabled: false,
  isBulkOrder: false,
};
