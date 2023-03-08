import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import handleRequestError from '../../payment/data/handleRequestError';
import { transformResults } from '../../payment/data/utils';

// TODO: update the new subs API endpoint later
ensureConfig([
  'ECOMMERCE_BASE_URL',
  'LMS_BASE_URL',
], 'payment API service');

function handleDetailsApiError(requestError) {
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
      processedError.details = transformResults(requestError.response.data);
    }

    throw processedError;
  }
}

export async function getClientSecret() {
  // TODO: update capture context URL from new subs BE
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/capture-context`)
    .catch(handleDetailsApiError);
  return data;
}

export async function getDetails() {
  // TODO: update getSubscriptionDetails URL from new subs BE
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/payment/`)
    .catch(handleDetailsApiError);
  return transformResults(data);
}
