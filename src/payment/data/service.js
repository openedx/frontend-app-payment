import formurlencoded from 'form-urlencoded';
import pick from 'lodash.pick';

import { configureApiService as configureCouponApiService } from '../coupon';
import { configureApiService as configurePayPalApiService } from '../paypal';
import { applyConfiguration, handleRequestError } from '../../common/serviceUtils';
import { camelCaseObject } from '../../common/utils';


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

export function transformResults(data) {
  const results = camelCaseObject(data);

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

export async function sdnCheck(firstName, lastName, city, country) {
  const { data } = await apiClient.post(
    `${config.ECOMMERCE_BASE_URL}/api/v2/sdn/search/`,
    {
      name: `${firstName} ${lastName}`,
      city,
      country,
    },
  );

  return data;
}

export async function checkout(basketId, cardHolderInfo) {
  const { data } = await apiClient.post(
    `${config.ECOMMERCE_BASE_URL}/payment/cybersource/api-submit/`,
    formurlencoded({
      basket: basketId,
      first_name: cardHolderInfo.firstName,
      last_name: cardHolderInfo.lastName,
      address_line1: cardHolderInfo.address,
      address_line2: cardHolderInfo.unit,
      city: cardHolderInfo.city,
      country: cardHolderInfo.country,
      state: cardHolderInfo.state,
      postal_code: cardHolderInfo.postalCode,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return data;
}
