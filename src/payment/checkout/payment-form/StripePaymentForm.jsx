import React, { useContext, useState } from 'react';
import { reduxForm } from 'redux-form';
import formurlencoded from 'form-urlencoded';
import PropTypes from 'prop-types';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';

import handleRequestError from '../../data/handleRequestError';

import CardHolderInformation from './CardHolderInformation';
import PlaceOrderButton from './PlaceOrderButton';

function StripePaymentForm({
  disabled, handleSubmit, isBulkOrder, loading, isQuantityUpdating, isProcessing, onSubmitButtonClick,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const context = useContext(AppContext);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: bug on loading state, showLoadingButton is true before Stripe card detail is fully rendered
  // TODO: rename to distinguish loading of data and loading of card details
  const showLoadingButton = loading || isQuantityUpdating || isLoading || !stripe || !elements;

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
    setMessage('');
    setIsLoading(true);

    // Processes API errors and converts them to error objects the sagas can use.
    const handleApiError = (requestError) => {
      try {
        // Always throws an error:
        handleRequestError(requestError);
      } catch (errorWithMessages) {
        const processedError = new Error();
        processedError.messages = errorWithMessages.messages;
        processedError.errors = errorWithMessages.errors;
        processedError.fieldErrors = errorWithMessages.fieldErrors;

        throw processedError;
      }
    };

    const stripePaymentMethodHandler = async (
      result,
      setLocation = href => { global.location.href = href; }, // HACK: allow tests to mock setting location
    ) => {
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
            setLocation(response.data.receipt_page_url);
          })
          .catch(error => {
            const errorData = error.response ? error.response.data : null;
            if (errorData && error.response.data.sdn_check_failure) {
              // SDN failure: redirect to Ecommerce SDN error page.
              setLocation(`${getConfig().ECOMMERCE_BASE_URL}/payment/sdn/failure/`);
            } else if (errorData && errorData.user_message) {
              // Stripe error: show to user.
              setMessage(errorData.user_message);
              handleApiError(error);
            } else {
              // Unknown error: log, attempt to handle, and throw.
              logError(error, {
                messagePrefix: 'Stripe Submit Error',
                paymentMethod: 'Stripe',
                paymentErrorType: 'Submit Error',
              });
              handleApiError(error);
              throw error;
            }
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
  disabled: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  isBulkOrder: PropTypes.bool,
  loading: PropTypes.bool,
  isQuantityUpdating: PropTypes.bool,
  isProcessing: PropTypes.bool,
  onSubmitButtonClick: PropTypes.func.isRequired,
};

StripePaymentForm.defaultProps = {
  disabled: false,
  isBulkOrder: false,
  loading: false,
  isQuantityUpdating: false,
  isProcessing: false,
};

export default reduxForm({ form: 'stripe' })(StripePaymentForm);
