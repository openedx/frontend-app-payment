import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { camelCaseObject } from '../../payment/data/utils';

/**
 * Transform the data and return the camelCase object with parsed price value
 * @param {data} to transform
 * @returns transformed data
 */
export const transformSubscriptionDetails = (data) => {
  const obj = camelCaseObject(data);
  obj.price = parseFloat(obj.price);
  obj.totalPrice = parseFloat(obj.totalPrice);
  return obj;
};

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'SUBSCRIPTIONS_BASE_URL',
], 'subscription API service');

/**
 * handleDetailsApiError
 * handle the server api error and
 * transform them into what feedback alerts
 * should render
 */
export function handleDetailsApiError(requestError) {
  const errors = [];
  /* eslint-disable camelcase */
  // Always throws an error:
  if (requestError.response && requestError.response.data.error_code) {
    const { error_code } = requestError.response.data;
    const { user_message } = requestError.response.data;
    errors.push({
      code: error_code,
      userMessage: user_message,
      data: this?.payload,
    });
  }
  const apiError = new Error();
  apiError.errors = errors;
  throw apiError;
}

/**
 * getDetails
 * fetches the user cart details for subscription
 * @returns program details
 */
export async function getDetails() {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`)
    .catch(handleDetailsApiError);
  return transformSubscriptionDetails(data);
}

/**
 * postDetails
 * will post checkout form details details
 * @param {object} postData
 * @returns server response object
 */
export async function postDetails(postData) {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`,
      postData,
    )
    .catch(handleDetailsApiError.bind({ payload: postData }));
  return transformSubscriptionDetails(data);
}

/**
 * checkoutComplete
 * notifies the successful 3ds completion
 * @param {object} postData
 * @returns server response object
 */
export async function checkoutComplete(postData) {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout-complete/`,
      postData,
    )
    .catch(handleDetailsApiError.bind({ payload: postData }));
  return transformSubscriptionDetails(data);
}
