import React, { useContext, useEffect, useState } from 'react';
import { reduxForm } from 'redux-form';
import formurlencoded from 'form-urlencoded';
import PropTypes from 'prop-types';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import CardHolderInformation from './CardHolderInformation';
import PlaceOrderButton from './PlaceOrderButton';

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
      organization,
      purchasedForOrganization,
    } = values;

    // TODO: CardHolderInformation validation (validateRequiredFields)

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const stripePaymentMethodHandler = async (result) => {
      if (result.error) {
        // Show error in payment form
        if (result.error.type === 'card_error' || result.error.type === 'validation_error') {
          setMessage(result.error.message);
        } else {
          setMessage('An unexpected error occurred.');
        }
        setIsLoading(false);
      } else {
        // Otherwise send paymentIntent.id to your server
        // TODO: refactor to fetch in service.js
        const postData = formurlencoded({ payment_intent_id: result.paymentIntent.id });
        await getAuthenticatedHttpClient()
          .post(
            `${process.env.STRIPE_RESPONSE_URL}`,
            postData,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            },
          )
          .then(response => {
            // TODO: This hits the receipt page twice, but Axios doesn't seem
            // to support maxRedirects outside of NodeJS. Need to shift to a
            // way that does not make two calls.
            if (response.headers['content-type'].startsWith('text/html')) {
              global.location.href = response.request.responseURL;
            }
          })
          .catch(error => {
            console.log('[Project Zebra] POST error: ', error.message);
          });
      }
    };

    const result = await stripe.updatePaymentIntent({
      elements,
      params: {
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
          metadata: {
            organization,
            purchasedForOrganization,
          },
        },
      },
    });
    stripePaymentMethodHandler(result);
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
