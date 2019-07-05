import pick from 'lodash.pick';

import { configureApiService as configureCouponApiService } from '../coupon';
import { applyConfiguration, handleRequestError } from '../../common/serviceUtils';


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
  const transformedResults = {
    basketId: data.basket_id,
    currency: data.currency,
    isFreeBasket: data.is_free_basket,
    showCouponForm: data.show_coupon_form,
    orderTotal: Number.parseInt(data.order_total, 10),
    summaryDiscounts: data.summary_discounts !== null ?
      Number.parseInt(data.summary_discounts, 10) : null,
    summaryPrice: Number.parseInt(data.summary_price, 10),
    products: data.products.map(({
      image_url: imageUrl,
      title,
      certificate_type: certificateType,
      sku,
      product_type: productType,
    }) => ({
      imageUrl, title, certificateType, sku, productType,
    })),
    coupons: data.coupons,
  };
  return transformedResults;
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
