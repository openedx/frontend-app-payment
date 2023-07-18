import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import handleRequestError from './handleRequestError';
import { transformResults } from './utils';

/* eslint-disable max-classes-per-file */

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'LMS_BASE_URL',
  'COMMERCE_COORDINATOR_BASE_URL',
], 'payment API service');

function handleBasketApiError(requestError) {
  try {
    // Always throws an error:
    handleRequestError(requestError);
  } catch (errorWithMessages) {
    const processedError = new Error();
    processedError.messages = errorWithMessages.messages;
    processedError.errors = errorWithMessages.errors;
    processedError.fieldErrors = errorWithMessages.fieldErrors;

    if (requestError.response.data) {
      processedError.basket = transformResults(requestError.response.data);
    }

    throw processedError;
  }
}

// Ecomm Specific Calls

export async function getCaptureKey() { // CyberSource Only
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/capture-context/`)
    .catch(handleBasketApiError);
  return data;
}

export async function getClientSecret() { // Stripe Only
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/capture-context`)
    .catch(handleBasketApiError);
  return data;
}

export async function getBasket(discountJwt) {
  const discountJwtArg = typeof discountJwt !== 'undefined' ? `?discount_jwt=${discountJwt}` : '';
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/payment/${discountJwtArg}`)
    .catch(handleBasketApiError);
  return transformResults(data);
}

export async function postQuantity(quantity) {
  const { data } = await getAuthenticatedHttpClient()
    .post(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/quantity/`, { quantity })
    .catch(handleBasketApiError);
  return transformResults(data);
}

export async function postCoupon(code) {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/`,
      { code },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    .catch(handleBasketApiError);
  return transformResults(data);
}

export async function deleteCoupon(id) {
  const { data } = await getAuthenticatedHttpClient()
    .delete(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/${id}`)
    .catch(handleBasketApiError);
  return transformResults(data);
}

// LMS Specific Calls

export async function getDiscountData(courseKey) {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getConfig().LMS_BASE_URL}/api/discounts/course/${courseKey}`,
    {
      withCredentials: true,
    },
  );
  return data;
}

// Commerce Coordinator Specific Calls
const CC_BASE = getConfig().COMMERCE_COORDINATOR_BASE_URL;

export class CommerceCoordinator {
  // This URL cant end in `/` or it fails to pattern match in CC
  static GET_ACTIVE_ORDER_URL = `${CC_BASE}/frontend-app-payment/order/active`;

  static GET_CURRENT_PAYMENT_STATE_URL = `${CC_BASE}/frontend-app-payment/payment`;

  static GET_CLIENT_SECRET_URL = `${CC_BASE}/frontend-app-payment/payment/draft`;

  static async getActiveOrder() {
    const { data } = await getAuthenticatedHttpClient()
      .get(CommerceCoordinator.GET_ACTIVE_ORDER_URL)
      .catch(handleBasketApiError);
    return transformResults(data);
  }

  static async getCurrentPaymentState(paymentNumber, basketId) {
    const { data } = await getAuthenticatedHttpClient()
      .get(
        CommerceCoordinator.GET_CURRENT_PAYMENT_STATE_URL,
        {
          params:
            {
              payment_number: paymentNumber,
              order_uuid: basketId,
            },
        },
      )
      .catch(handleBasketApiError);
    return data;
  }

  /**
   * Get the Client Secret for a Payment Intent
   * @note This is used only for the Stripe Payment Processor
   * @return {Promise<*>}
   */
  static async getClientSecret() {
    const { data } = await getAuthenticatedHttpClient()
      .put(CommerceCoordinator.GET_CLIENT_SECRET_URL)
      .catch(handleBasketApiError);
    return data;
  }
}
