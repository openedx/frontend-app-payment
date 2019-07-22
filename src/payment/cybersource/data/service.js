import formurlencoded from 'form-urlencoded';
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
