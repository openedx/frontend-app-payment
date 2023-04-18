import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import handleRequestError from './handleRequestError';
import { camelCaseObject } from '../../payment/data/utils';

/**
 * Transform the data and return the camelCase object with parsed price value
 * @param {data} to transform
 * @returns transformed data
 */
const transformSubscriptionDetails = (data) => {
  const obj = camelCaseObject(data);
  obj.price = parseFloat(obj.price);
  return obj;
};

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'SUBSCRIPTIONS_BASE_URL',
], 'subscription API service');

export function handleDetailsApiError(requestError) {
  // TODO: refactor this method with the new BE service error structure
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

// TODO: add SUBSCRIPTIONS_BASE_URL for production environments
export async function getDetails() {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`)
    .catch(handleDetailsApiError);
  return transformSubscriptionDetails(data);
}
