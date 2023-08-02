import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import handleRequestError from './handleRequestError';
import { transformResults } from './utils';
import { isWaffleFlagEnabled } from '../../data/waffleFlags';
import { WAFFLE_FLAGS } from './constants';

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'LMS_BASE_URL',
], 'payment API service');

/* eslint-disable no-use-before-define */ /* Chicken vs Egg...
    but it is preferred the interpreter pickup errors rather than use magic strings */

/**
 * Ecommerce IDA/Coordinator IDA URLs keyed by the function name they are meant for.
 *
 * @type {{[p: string]: string}}
 */
const urlsByFunction = {
  /* Shared common paths */
  [getClientSecret.name]: '/bff/payment/v0/capture-context', // no forward slash at the end or we will explode
  [getBasket.name]: '/bff/payment/v0/payment/',

  /* Ecommerce IDA Specific */
  [getCaptureKey.name]: '/bff/payment/v0/payment/',
  [postQuantity.name]: '/bff/payment/v0/quantity/',
  [postCoupon.name]: '/bff/payment/v0/vouchers/',
  [deleteCoupon.name]: '/bff/payment/v0/vouchers/',

  /* Commerce Coordinator Specific */
  [getCurrentPaymentState.name]: '/payment',
};

/* eslint-enable no-use-before-define */

/**
 * Get a fully resolvable base URL by function name.
 *
 * @param {Function} serviceFunction the function.name value for the URL intended to be resolved
 * @param {boolean} [testsOnlyForceCoordinator=false] **TEST-CODE ONLY**; Forces the base URL to be Coordinators
 * @return {string|undefined} A resolved URL or `undefined` if not found.
 *
 * @see getUrlBase
 * @see WAFFLE_FLAGS.COMMERCE_COORDINATOR_ENABLED
 */
export const resolveUrlForFunction = (serviceFunction, testsOnlyForceCoordinator = false) => {
  let base = getConfig().ECOMMERCE_BASE_URL;

  if (isWaffleFlagEnabled(WAFFLE_FLAGS.COMMERCE_COORDINATOR_ENABLED) || testsOnlyForceCoordinator) {
    ensureConfig(['COMMERCE_COORDINATOR_BASE_URL']);
    const coordBase = getConfig().COMMERCE_COORDINATOR_BASE_URL;
    // CC Endpoints must target receiving app, even though we use the root in the config for consistency's sake.
    base = `${coordBase}/frontend-app-payment`;
  }

  const url = urlsByFunction[serviceFunction.name];

  if (url === undefined) {
    return undefined;
  }

  return `${base}${url}`;
};

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

// Shared Service Calls
export async function getClientSecret() { // Stripe Only, Both backends
  const { data } = await getAuthenticatedHttpClient()
    .get(resolveUrlForFunction(getClientSecret))
    .catch(handleBasketApiError);
  return data;
}

export async function getBasket(discountJwt) { // Both Backends
  const discountJwtArg = typeof discountJwt !== 'undefined' ? `?discount_jwt=${discountJwt}` : '';
  const { data } = await getAuthenticatedHttpClient()
    .get(`${resolveUrlForFunction(getBasket)}${discountJwtArg}`)
    .catch(handleBasketApiError);
  return transformResults(data);
}

// Ecomm Specific Calls
export async function getCaptureKey() { // CyberSource Only, Ecomm Only
  const { data } = await getAuthenticatedHttpClient()
    .get(resolveUrlForFunction(getCaptureKey))
    .catch(handleBasketApiError);
  return data;
}

export async function postQuantity(quantity) { // Ecomm Only
  const { data } = await getAuthenticatedHttpClient()
    .post(resolveUrlForFunction(postQuantity), { quantity })
    .catch(handleBasketApiError);
  return transformResults(data);
}

export async function postCoupon(code) { // Ecomm Only
  const { data } = await getAuthenticatedHttpClient()
    .post(
      resolveUrlForFunction(postCoupon),
      { code },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    .catch(handleBasketApiError);
  return transformResults(data);
}

export async function deleteCoupon(id) { // Ecomm Only
  const { data } = await getAuthenticatedHttpClient()
    .delete(resolveUrlForFunction(deleteCoupon) + id)
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
export async function getCurrentPaymentState(paymentNumber, basketId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(
      resolveUrlForFunction(getCurrentPaymentState),
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
