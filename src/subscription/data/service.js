import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import handleRequestError from '../../payment/data/handleRequestError';
import { camelCaseObject } from '../../payment/data/utils';

/**
 * Transform the data and return the camelCase object with parsed price value
 * @param {data} to transform
 * @returns transformed data
 */
const transformSubscriptionDetails = (data) => {
  const obj = camelCaseObject(data);
  obj.price = parseFloat(obj.price);
  obj.totalPrice = parseFloat(obj.totalPrice);
  return obj;
};

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'SUBSCRIPTIONS_BASE_URL',
], 'subscription API service');

export function handleDetailsApiError(requestError) {
  try {
    // Always throws an error:
    handleRequestError(requestError);
  } catch (errorWithMessages) {
    const processedError = new Error();
    processedError.messages = errorWithMessages.messages;
    processedError.errors = errorWithMessages.errors;
    processedError.fieldErrors = errorWithMessages.fieldErrors;

    if (requestError.response.data) {
      processedError.details = transformSubscriptionDetails(requestError.response.data);
    }

    throw processedError;
  }
}

export async function getDetails() {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`)
    .catch(handleDetailsApiError);
  return transformSubscriptionDetails(data);
}

export async function postDetails(postData) {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`,
      postData,
      { timeout: 15000 }, // wait at least 15 seconds
    )
    .catch(handleDetailsApiError);
  return transformSubscriptionDetails(data);
}
