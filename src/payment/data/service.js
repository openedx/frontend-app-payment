import pick from 'lodash.pick';

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
let getParameters = {};
let firstRequestParameters = {};

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
      window.location.href = data.redirect;
    }
    return response;
  });

  const decodeURLParams = (search) => {
    const hashes = search
      .slice(search.indexOf('?') + 1)
      .split('&')
      .filter(hash => hash !== '');

    return hashes.reduce((params, hash) => {
      const split = hash.indexOf('=');
      const key = hash.slice(0, split);
      const value = hash.slice(split + 1);
      return Object.assign(params, { [key]: decodeURIComponent(value) });
    }, {});
  };

  getParameters = decodeURLParams(window.location.search);

  if (getParameters.consent_failed !== undefined) {
    firstRequestParameters.consent_failed = getParameters.consent_failed;
  }
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
  results.summaryDiscounts = results.summaryDiscounts !== null ?
    Number(results.summaryDiscounts) : null;
  results.summaryPrice = Number(results.summaryPrice);

  if (results.offers != null) {
    results.offers = results.offers.filter(({ provider }) => provider !== null);
  }

  return results;
}

export async function getBasket() {
  const { data } = await apiClient
    .get(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/payment/`, { params: firstRequestParameters })
    .catch(handleBasketApiError);

  // unset first request get params
  firstRequestParameters = {};

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

