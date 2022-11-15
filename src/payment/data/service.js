import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import handleRequestError from './handleRequestError';
import { camelCaseObject } from './utils';
import { ORDER_TYPES } from './constants';

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'LMS_BASE_URL',
], 'payment API service');

function getOrderType(productType) {
  switch (productType) {
    case 'Enrollment Code':
      return ORDER_TYPES.BULK_ENROLLMENT;
    case 'Course Entitlement':
      return ORDER_TYPES.ENTITLEMENT;
    case 'Seat':
    default:
      return ORDER_TYPES.SEAT;
  }
}

export function transformResults(data) {
  const results = camelCaseObject(data);

  const lastProduct = results.products && results.products[results.products.length - 1];
  results.orderType = getOrderType(lastProduct && lastProduct.productType);

  return results;
}

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
