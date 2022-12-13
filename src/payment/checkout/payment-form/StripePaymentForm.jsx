import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { connect, useSelector } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import PropTypes from 'prop-types';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import CardHolderInformation from './CardHolderInformation';
import PlaceOrderButton from './PlaceOrderButton';
import {
  getRequiredFields, validateRequiredFields, validateAsciiNames,
} from './utils/form-validators';

import { getPerformanceProperties, markPerformanceIfAble } from '../../performanceEventing';

function StripePaymentForm({
  handleSubmit,
  isBulkOrder,
  isQuantityUpdating,
  isProcessing,
  onSubmitButtonClick,
  onSubmitPayment,
  options,
  submitErrors,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const context = useContext(AppContext);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstErrorId, setfirstErrorId] = useState(false);
  const [shouldFocusFirstError, setshouldFocusFirstError] = useState(false);
  const inputElement = useRef(null);

  const {
    enableStripePaymentProcessor, loading, submitting, products,
  } = useSelector(state => state.payment.basket);

  // TODO: rename to distinguish loading of data and loading of card details
  const showLoadingButton = loading || isQuantityUpdating || isLoading || !stripe || !elements;

  // Generate comma separated list of product SKUs
  const skus = products.map(({ sku }) => sku).join(',');

  useEffect(() => {
    // Focus on first input with an errror in the form
    if (
      shouldFocusFirstError
      && Object.keys(submitErrors).length > 0
    ) {
      const form = inputElement.current;
      const elementSelectors = Object.keys(submitErrors).map((fieldName) => `[id=${fieldName}]`);
      const firstElementWithError = form.querySelector(elementSelectors.join(', '));
      if (firstElementWithError) {
        if (['input', 'select'].includes(firstElementWithError.tagName.toLowerCase())) {
          firstElementWithError.focus();
          setshouldFocusFirstError(false);
          setfirstErrorId(null);
        } else if (firstErrorId !== firstElementWithError.id) {
          setfirstErrorId(firstElementWithError.id);
        }
      }
    }
  }, [firstErrorId, shouldFocusFirstError, submitErrors]);

  const onSubmit = async (values) => {
    // istanbul ignore if
    if (submitting) { return; }

    // Clear the error message displayed at the bottom of the Stripe form
    setMessage('');

    setshouldFocusFirstError(true);
    const requiredFields = getRequiredFields(values, isBulkOrder, enableStripePaymentProcessor);
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

    const errors = {
      ...validateRequiredFields(requiredFields),
      ...validateAsciiNames(
        firstName,
        lastName,
      ),
    };

    if (Object.keys(errors).length > 0) {
      throw new SubmissionError(errors);
    }

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Disable submit button before sending billing info to Stripe and calling ecommerce
    setIsLoading(true);
    try {
      const result = await stripe.updatePaymentIntent({
        elements,
        params: {
          payment_method_data: {
            billing_details: {
              address: {
                city,
                country,
                line1: address,
                line2: unit || '',
                postal_code: postalCode || '',
                state: state || '',
              },
              email: context.authenticatedUser.email,
              name: `${firstName} ${lastName}`,
            },
            metadata: {
              organization, // JK TODO: check how ecommerce is receiving this
              purchased_for_organization: purchasedForOrganization,
            },
          },
        },
      });
      onSubmitPayment({
        paymentIntentId: result.paymentIntent.id,
        skus,
      });
    } catch (error) {
      // Show updatePaymentIntent error by the Stripe billing form fields
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
      // Submit button should not be disabled after an error occured that the user can fix and re-submit
      setIsLoading(false);
    }
  };

  const stripeElementsOnReady = () => {
    setIsLoading(false);
    markPerformanceIfAble('Stripe Elements component rendered');
    sendTrackEvent(
      'edx.bi.ecommerce.payment_mfe.payment_form_rendered',
      {
        ...getPerformanceProperties(),
        paymentProcessor: 'Stripe',
      },
    );
  };

  return (
    <form id="payment-form" ref={inputElement} onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardHolderInformation
        showBulkEnrollmentFields={isBulkOrder}
        disabled={submitting}
        enableStripePaymentProcessor={enableStripePaymentProcessor}
      />
      <h5 aria-level="2">
        <FormattedMessage
          id="payment.card.details.billing.information.heading"
          defaultMessage="Billing Information (Required)"
          description="The heading for the required credit card details billing information form"
        />
      </h5>
      <PaymentElement
        id="payment-element"
        options={options}
        onReady={stripeElementsOnReady}
      />
      <PlaceOrderButton
        onSubmitButtonClick={onSubmitButtonClick}
        showLoadingButton={showLoadingButton}
        disabled={submitting}
        isProcessing={isProcessing}
      />
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

StripePaymentForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isBulkOrder: PropTypes.bool,
  isQuantityUpdating: PropTypes.bool,
  isProcessing: PropTypes.bool,
  onSubmitButtonClick: PropTypes.func.isRequired,
  onSubmitPayment: PropTypes.func.isRequired,
  options: PropTypes.object, // eslint-disable-line react/forbid-prop-types,
  submitErrors: PropTypes.objectOf(PropTypes.string),
};

StripePaymentForm.defaultProps = {
  isBulkOrder: false,
  isQuantityUpdating: false,
  isProcessing: false,
  submitErrors: {},
  options: null,
};

export default reduxForm({ form: 'stripe' })(connect(
  null,
)(injectIntl(StripePaymentForm)));
