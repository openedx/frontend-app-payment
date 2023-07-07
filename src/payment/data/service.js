import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import handleRequestError from './handleRequestError';
import { transformResults } from './utils';

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'LMS_BASE_URL',
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

export async function getCaptureKey() {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/capture-context/`)
    .catch(handleBasketApiError);
  return data;
}

export async function getClientSecret() {
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

export async function getActiveOrder() {
  // This call cant end in `/` or it fails to pattern match in CC
  const { data } = await getAuthenticatedHttpClient()
    .get(`${process.env.COMMERCE_COORDINATOR_BASE_URL}/frontend-app-payment/order/active`)
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

export async function getDiscountData(courseKey) {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getConfig().LMS_BASE_URL}/api/discounts/course/${courseKey}`,
    {
      withCredentials: true,
    },
  );
  return data;
}

export async function getCurrentPaymentState(paymentNumber, basketId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(
      `${process.env.COMMERCE_COORDINATOR_BASE_URL}/frontend-app-payment/payment`,
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
