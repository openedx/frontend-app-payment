import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  getLocale,
  useIntl,
} from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import messages from './messages';
import { subscriptionSelector, subscriptionDetailsSelector } from '../data/details/selectors';
import { submitPayment } from '../data/details/actions';

import StripePaymentForm from '../../payment/checkout/payment-form/StripePaymentForm';
import CheckoutSkeleton from './skeleton/CheckoutSkeleton';
import { getStripeOptions } from './StripeOptions';
import MonthlyBillingNotification from './monthly-billing-notification/MonthlyBillingNotification';

/**
 * SubscriptionCheckout component
 * renders Address and Stripe form
 * TODO: add process.env.STRIPE_DEFERRED_INTENT_BETA_FLAG under production flags
 */
export const SubscriptionCheckout = () => {
  // selectors
  const {
    loading,
    submitting,
    paymentMethod,
    currency,
    price,
  } = useSelector(subscriptionSelector);

  const options = getStripeOptions({ currency, price });
  const stripeIsSubmitting = submitting && paymentMethod === 'stripe';

  // state
  // Doing this within the Checkout component so locale is configured and available
  // https://stackoverflow.com/a/64694798
  const [stripePromise] = useState(() => loadStripe(process.env.STRIPE_PUBLISHABLE_KEY, {
    betas: [process.env.STRIPE_DEFERRED_INTENT_BETA_FLAG],
    apiVersion: process.env.STRIPE_API_VERSION,
    locale: getLocale(),
  }));

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

  return (
    <section aria-label={intl.formatMessage(messages['subscription.checkout.payment.label'])}>
      {
        !loading ? (
          <>
            <Elements options={options} stripe={stripePromise}>
              <StripePaymentForm
                options={options}
                onSubmitPayment={handleSubmitStripe}
                onSubmitButtonClick={handleSubmitStripeButtonClick}
                isProcessing={stripeIsSubmitting}
                isSubscription
                paymentDataSelector={subscriptionDetailsSelector}
              />
            </Elements>
            <MonthlyBillingNotification />
          </>
        ) : <CheckoutSkeleton />
}

    </section>
  );
};

export default SubscriptionCheckout;
