import pick from 'lodash.pick';

import { handleRequestError, applyConfiguration } from '../../../common/serviceUtils';

let config = {
  ECOMMERCE_BASE_URL: null,
};

let apiClient = null; // eslint-disable-line no-unused-vars

export function configureApiService(newConfig, newApiClient) {
  applyConfiguration(config, newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;
}

export async function postCoupon(code) {
  const response = await apiClient
    .post(
      `${config.ECOMMERCE_BASE_URL}/payment-bff/v0/payment/vouchers/`,
      { code },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    .catch(handleRequestError);

  return response.data;
}

export async function deleteCoupon(voucherId) {
  const response = await apiClient
    .delete(`${config.ECOMMERCE_BASE_URL}/payment-bff/v0/payment/vouchers/${voucherId}`)
    .catch(handleRequestError);

  return response.data;
}
