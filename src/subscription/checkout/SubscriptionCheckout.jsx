import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  getLocale,
  useIntl,
} from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import messages from '../../payment/checkout/Checkout.messages';
import { subscriptionSelector, subscriptionDetailsSelector } from '../data/details/selectors';
import { submitPayment } from '../data/details/actions';
import { fetchClientSecret } from '../data/client-secret/actions';
import { getClientSecretSelector } from '../data/client-secret/selectors';

import StripePaymentForm from '../../payment/checkout/payment-form/StripePaymentForm';
import CheckoutSkeleton from './skeleton/CheckoutSkeleton';
import { getStripeOptions } from './StripeOptions';
import MonthlyBillingNotification from './monthly-billing-notification/MonthlyBillingNotification';

/**
 * SubscriptionCheckout component
 * renders Address and Stripe form
 */
export const SubscriptionCheckout = () => {
  const {
    loading,
    loaded,
    submitting,
    isSubscriptionDetailsProcessing,
    paymentMethod,
  } = useSelector(subscriptionSelector);
  const { clientSecretId, isClientSecretProcessing } = useSelector(getClientSecretSelector);

  const dispatch = useDispatch();
  const intl = useIntl();

  const handleSubmitStripe = (formData) => {
    dispatch(submitPayment({ method: 'stripe', ...formData }));
  };

  const handleSubmitStripeButtonClick = () => {
    /**
     * TODO: update subscription events here
     * https://2u-internal.atlassian.net/wiki/spaces/RS/pages/377192460/Segment+events+to+monitor+KPIs
     * */
    sendTrackEvent(
      'edx.bi.ecommerce.details.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Credit Card - Stripe',
        checkoutType: 'client_side',
        stripeEnabled: true,
      },
    );
  };

  const isQuantityUpdating = isSubscriptionDetailsProcessing && loaded;
  const options = getStripeOptions(clientSecretId);

  // istanbul ignore next
  const stripeIsSubmitting = submitting && paymentMethod === 'stripe';

  // TODO: Right now when fetching capture context, CyberSource's captureKey is saved as clientSecretId
  // so we cannot rely on !options.clientSecret to distinguish btw payment processors
  const shouldDisplayStripePaymentForm = !loading && options.clientSecret;

  // Doing this within the Checkout component so locale is configured and available
  let stripePromise;
  if (shouldDisplayStripePaymentForm) {
    stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY, {
      betas: [process.env.STRIPE_BETA_FLAG],
      apiVersion: process.env.STRIPE_API_VERSION,
      locale: getLocale(),
    });
  }

  useEffect(() => {
    dispatch(fetchClientSecret());
  }, [dispatch]);

  return (
    <section aria-label={intl.formatMessage(messages['payment.section.payment.details.label'])}>
      {shouldDisplayStripePaymentForm ? (
        <Elements options={options} stripe={stripePromise}>
          <StripePaymentForm
            options={options}
            onSubmitPayment={handleSubmitStripe}
            onSubmitButtonClick={handleSubmitStripeButtonClick}
            isProcessing={stripeIsSubmitting}
            isQuantityUpdating={isQuantityUpdating}
            isSubscription
            paymentDataSelector={subscriptionDetailsSelector}
          />
          <MonthlyBillingNotification />
        </Elements>
      ) : ((loading || isClientSecretProcessing) && (<CheckoutSkeleton />))}

    </section>
  );
};

export default SubscriptionCheckout;
