import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { handleApiError } from '../../../payment/data/handleRequestError';

ensureConfig(['ECOMMERCE_BASE_URL', 'SUBSCRIPTIONS_BASE_URL'], 'Stripe API service');

/**
 * Checkout with Stripe
 * Stripe Deferred Intent with Finalizing payment on server side
 * 1. Billing form data sent to Stripe via createPaymentMethod
 * 2. Subs service will use this to create subscription customer and payment
 * 2. POST request to Subscription service program_uuid, paymentMethod ID and billing details
 * 3. Show confirmation modal for subscription customer
 * TODO: Refactor this function for subscription data / endpoints
 */
export async function subscriptionStripeCheckout(
  { programUuid },
  {
    elements, stripe, context, values,
  },
) {
  const {
    firstName,
    lastName,
    address,
    unit,
    city,
    country,
    state,
    postalCode,
  } = values;

  try {
    // Create the PaymentMethod using the details collected by the Payment Element
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      elements,
      params: {
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
      },
    });
    if (error?.code === 'payment_intent_unexpected_state' && error?.type === 'invalid_request_error') {
      // handleApiError(error);
      throw error;
    }

    const postData = {
      program_uuid: programUuid,
      payment_method_id: paymentMethod.id,
      billing_details: { ...paymentMethod.billing_details, firstname: firstName, lastname: lastName },
    };
    return postData;
  } catch (error) {
    // TODO: handle all stripe errors here

    console.log('errorMessage: ', error.message);
    console.log('errorName: ', error.name);

    const errorData = error?.response ? error.response?.data : null;
    if (errorData && error.response.data.sdn_check_failure) {
      if (getConfig().ENVIRONMENT !== 'test') {
        // SDN failure: redirect to Ecommerce SDN error page.
        // TODO: refactor to use different endpoint for subs
        // setLocation(`${getConfig().ECOMMERCE_BASE_URL}/payment/sdn/failure/`);
      }
      logError(error, {
        messagePrefix: 'SDN Check Error',
        paymentMethod: 'Stripe',
        paymentErrorType: 'SDN Check Submit Api',
        programUuid,
      });
      // throw new Error('This card holder did not pass the SDN check.');
      // handleApiError(new Error('This card holder did not pass the SDN check.'));
    } else {
      // Log error and tell user.
      logError(error, {
        messagePrefix: 'Stripe Submit Error',
        paymentMethod: 'Stripe',
        paymentErrorType: 'Submit Error',
        programUuid,
      });
      // handleApiError(error);
    }
    throw error;
    // console.log('Stripe Error: ', error);
    // handleApiError(error);
  }
}

export default subscriptionStripeCheckout;
