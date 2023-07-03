import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
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
import SubscriptionSubmitButton from '../../../subscription/checkout/submit-button/SubscriptionSubmitButton';
import MonthlyBillingNotification from '../../../subscription/checkout/monthly-billing-notification/MonthlyBillingNotification';
import { Secure3DModal } from '../../../subscription/secure-3d/secure-3d-modal/Secure3dModal';

import {
  getRequiredFields, validateRequiredFields, validateAsciiNames,
} from './utils/form-validators';

import { getPerformanceProperties, markPerformanceIfAble } from '../../performanceEventing';

const StripePaymentForm = ({
  handleSubmit,
  isBulkOrder,
  isQuantityUpdating,
  isProcessing,
  onSubmitButtonClick,
  onSubmitPayment,
  options,
  submitErrors,
  isSubscription,
  paymentDataSelector,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const context = useContext(AppContext);

  // Local state needed to control the Stripe Element loading state,
  // since 'stripe' and 'element' instances are there before the PaymentElement actually loads
  const [isStripeElementLoading, setIsStripeElementLoading] = useState(true);

  // Show error on CardHolderInformation input box
  const inputElement = useRef(null);
  const [firstErrorId, setfirstErrorId] = useState(false);
  const [shouldFocusFirstError, setshouldFocusFirstError] = useState(false);

  const checkoutDetails = useSelector(paymentDataSelector);
  const {
    enableStripePaymentProcessor, loading, submitting, products,
  } = checkoutDetails;

  // Loading button should appear when: basket and stripe elements are loading, quantity is updating and not submitting
  // isQuantityUpdating is true when isBasketProcessing is true when there is an update in the quantity for
  // bulk purchases but also happens on submit, when the 'processing' button state should show instead
  const showLoadingButton = (
    loading || isQuantityUpdating || !stripe || !elements || isStripeElementLoading
  ) && !isProcessing;

  // Generate comma separated list of product SKUs
  const skus = products.map(({ sku }) => sku).join(',');

  useEffect(() => {
    // Focus on first input with an error in the form
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

    setshouldFocusFirstError(true);
    const requiredFields = getRequiredFields(values, isBulkOrder, enableStripePaymentProcessor);
    const {
      firstName,
      lastName,
    } = values;

    let stripeElementErrors = null;
    if (isSubscription) {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        stripeElementErrors = submitError;
      }
    }

    const errors = {
      ...validateRequiredFields(requiredFields),
      ...validateAsciiNames(
        firstName,
        lastName,
      ),
    };

    if (Object.keys(errors).length > 0 || stripeElementErrors) {
      // Trigger form validation and wallet collection
      throw new SubmissionError({ ...errors, stripe: stripeElementErrors });
    }

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    onSubmitPayment({
      skus, elements, stripe, context, values,
    });
  };

  const stripeElementsOnReady = () => {
    setIsStripeElementLoading(false);
    markPerformanceIfAble('Stripe Elements component rendered');

    let subscriptionEventProps = {};

    if (isSubscription) {
      subscriptionEventProps = {
        isTrialEligible: checkoutDetails.isTrialEligible,
        isNewSubscription: checkoutDetails.isTrialEligible,
        paymentProcessor: checkoutDetails.paymentMethod,
        programUuid: checkoutDetails.programUuid,
      };
    }

    sendTrackEvent(
      'edx.bi.ecommerce.payment_mfe.payment_form_rendered',
      {
        ...getPerformanceProperties(),
        paymentProcessor: 'Stripe',
        ...subscriptionEventProps,
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
      {isSubscription ? (
        <>
          <MonthlyBillingNotification />
          <SubscriptionSubmitButton
            onSubmitButtonClick={onSubmitButtonClick}
            showLoadingButton={showLoadingButton}
            disabled={submitting}
            isProcessing={isProcessing}
          />
          <Secure3DModal stripe={stripe} elements={elements} />
        </>
      ) : (
        // Standard Purchase Flow
        <PlaceOrderButton
          onSubmitButtonClick={onSubmitButtonClick}
          showLoadingButton={showLoadingButton}
          disabled={submitting}
          isProcessing={isProcessing}
        />
      )}

    </form>
  );
};

StripePaymentForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isBulkOrder: PropTypes.bool,
  isQuantityUpdating: PropTypes.bool,
  isProcessing: PropTypes.bool,
  onSubmitButtonClick: PropTypes.func.isRequired,
  onSubmitPayment: PropTypes.func.isRequired,
  options: PropTypes.object, // eslint-disable-line react/forbid-prop-types,
  submitErrors: PropTypes.objectOf(PropTypes.string),
  isSubscription: PropTypes.bool,
  paymentDataSelector: PropTypes.func.isRequired,
};

StripePaymentForm.defaultProps = {
  isBulkOrder: false,
  isQuantityUpdating: false,
  isProcessing: false,
  submitErrors: {},
  options: null,
  isSubscription: false,
};

export default reduxForm({ form: 'stripe' })((injectIntl(StripePaymentForm)));
