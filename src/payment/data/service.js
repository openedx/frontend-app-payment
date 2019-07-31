import pick from 'lodash.pick';
import { logError } from '@edx/frontend-logging';

import { configureApiService as configureCybersourceApiService } from '../cybersource';
import { configureApiService as configurePayPalApiService } from '../paypal';
import { configureApiService as configureApplePayApiService } from '../apple-pay';
import { applyConfiguration } from '../../common/serviceUtils';
import handleBasketApiError from '../utils/handleBasketApiError';
import { camelCaseObject } from '../../common/utils';
import { ORDER_TYPES } from './constants';

let config = {
  ACCOUNTS_API_BASE_URL: null,
  ECOMMERCE_BASE_URL: null,
  ECOMMERCE_API_BASE_URL: null,
  ECOMMERCE_RECEIPT_BASE_URL: null,
  LMS_BASE_URL: null,
};

let apiClient = null; // eslint-disable-line no-unused-vars

export function configureApiService(newConfig, newApiClient) {
  applyConfiguration(config, newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;

  configureCybersourceApiService(config, apiClient);
  configurePayPalApiService(config, apiClient);
  configureApplePayApiService(newConfig, apiClient);

  // For every ajax response, check if the API has
  // responded with a redirect value. If so, redirect.
  apiClient.interceptors.response.use((response) => {
    const { status, data } = response;
    if (status >= 200 && status < 300 && data && data.redirect) {
      // Redirecting this SPA to itself is likely to cause
      // a redirect loop.
      if (global.location.href === data.redirect) {
        logError('The api response is redirecting to the same payment page url', {
          url: global.location.href,
        });
      }
      global.location.href = data.redirect;
    }
    return response;
  });
}

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
  const results = camelCaseObject(data) || {};

  const lastProduct = results.products && results.products[results.products.length - 1];
  results.orderType = getOrderType(lastProduct && lastProduct.productType);
  results.orderTotal = Number(results.orderTotal);
  results.summaryDiscounts =
    results.summaryDiscounts !== null ? Number(results.summaryDiscounts) : null;
  results.summaryPrice = Number(results.summaryPrice);

  if (results.offers != null) {
    results.offers = results.offers
      .filter(({ provider }) => provider !== null)
      .map(offer => ({
        ...offer,
        benefitValue: Number(offer.benefitValue),
      }));
  }

  return results;
}

export async function getBasket() {
  const { data } = await apiClient
    .get(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/payment/`)
    .catch(handleBasketApiError);

  return transformResults(data);
}

export async function postQuantity(quantity) {
  const { data } = await apiClient
    .post(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/quantity/`, { quantity })
    .catch(handleBasketApiError);
  return transformResults(data);
}

export async function postCoupon(code) {
  const { data } = await apiClient
    .post(
      `${config.ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/`,
      { code },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    .catch(handleBasketApiError);
  return transformResults(data);
}

export async function deleteCoupon(id) {
  const { data } = await apiClient
    .delete(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/${id}`)
    .catch(handleBasketApiError);
  return transformResults(data);
}
