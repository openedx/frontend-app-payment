import pick from 'lodash.pick';

import { configureApiService as configureCouponApiService } from '../coupon';
import { configureApiService as configureCybersourceApiService } from '../cybersource';
import { configureApiService as configurePayPalApiService } from '../paypal';
import { applyConfiguration, handleRequestError } from '../../common/serviceUtils';
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

  configureCouponApiService(config, apiClient);
  configureCybersourceApiService(config, apiClient);
  configurePayPalApiService(config, apiClient);

  // For every ajax response, check if the API has
  // responded with a redirect value. If so, redirect.
  apiClient.interceptors.response.use((response) => {
    const { status, data } = response;
    if (status >= 200 && status < 300 && data && data.redirect) {
      window.location.href = data.redirect;
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
  const results = camelCaseObject(data);

  const lastProduct = results.products && results.products[results.products.length - 1];
  results.orderType = getOrderType(lastProduct && lastProduct.productType);
  results.orderTotal = Number.parseInt(results.orderTotal, 10);
  results.summaryDiscounts = results.summaryDiscounts !== null ?
    Number.parseInt(results.summaryDiscounts, 10) : null;
  results.summaryPrice = Number.parseInt(results.summaryPrice, 10);

  if (results.offers != null) {
    results.offers = results.offers.filter(({ provider }) => provider !== null);
  }

  return results;
}

export async function getBasket() {
  const { data } = await apiClient
    .get(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/payment/`)
    .catch(handleRequestError);
  return transformResults(data);
}

export async function postQuantity(quantity) {
  const { data } = await apiClient
    .post(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/quantity/`, { quantity })
    .catch(handleRequestError);
  return transformResults(data);
}
