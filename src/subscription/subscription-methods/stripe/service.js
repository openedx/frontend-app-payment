import { logError } from '@edx/frontend-platform/logging';

/**
 * Checkout with Stripe
 * Stripe Deferred Intent with Finalizing payment on server side
 * 1. Billing form data sent to Stripe via createPaymentMethod
 * 2. Subs service will use this to create subscription customer and payment
 * 2. POST request to Subscription service program_uuid, paymentMethod ID and billing details
 * 3. Show confirmation modal for subscription customer
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
    if (error) {
      throw error;
    }
    const postData = {
      program_uuid: programUuid,
      payment_method_id: paymentMethod.id,
      billing_details: { ...paymentMethod.billing_details, firstname: firstName, lastname: lastName },
    };
    return postData;
  } catch (error) {
    logError(error, {
      messagePrefix: 'Stripe Submit Error',
      paymentMethod: 'createPaymentMethod',
      paymentErrorType: 'createPaymentMethod Error',
      programUuid,
    });
    throw new Error((error?.message ? `${error?.name}: ${error.message}` : 'Something went wrong!'), {
      cause: 'create-paymentMethod',
      // cause: error.name,
    });
  }
}

export default subscriptionStripeCheckout;
