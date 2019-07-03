import pick from 'lodash.pick';

import { handleRequestError, applyConfiguration } from '../../../common/serviceUtils';
import { transformResults } from '../../data/service';

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
  const { data } = await apiClient
    .post(
      `${config.ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/`,
      { code },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    .catch(handleRequestError);
  return transformResults(data);
}

export async function deleteCoupon(voucherId) {
  const { data } = await apiClient
    .delete(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/${voucherId}`)
    .catch(handleRequestError);
  return transformResults(data);
}
