import pick from 'lodash.pick';

import { applyConfiguration } from '../../../common/serviceUtils';


let config = {
  ECOMMERCE_BASE_URL: null,
};

let apiClient = null; // eslint-disable-line no-unused-vars

export function configureApiService(newConfig, newApiClient) {
  applyConfiguration(config, newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;
}

export async function checkout(basketId) {
  const { data } = await apiClient.post(
    `${config.ECOMMERCE_BASE_URL}/api/v2/checkout/`,
    {
      basket_id: basketId,
      payment_processor: 'paypal',
    },
  );

  return data;
}
