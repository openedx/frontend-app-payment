import pick from 'lodash.pick';
import { logAPIErrorResponse } from '@edx/frontend-logging';

import { applyConfiguration } from '../../../common/serviceUtils';
import { generateAndSubmitForm } from '../../../common/utils';


let config = {
  ECOMMERCE_BASE_URL: null,
};

let apiClient = null; // eslint-disable-line no-unused-vars

export function configureApiService(newConfig, newApiClient) {
  applyConfiguration(config, newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;
}

export async function checkout(basket) {
  const { basketId } = basket;

  const { data } = await apiClient.post(
    `${config.ECOMMERCE_BASE_URL}/api/v2/checkout/`,
    {
      basket_id: basketId,
      payment_processor: 'paypal',
    },
  ).catch((error) => {
    logAPIErrorResponse(error, {
      messagePrefix: 'PayPal Checkout Error',
      paymentMethod: 'PayPal',
      paymentErrorType: 'Checkout',
      basketId,
    });

    throw error;
  });

  generateAndSubmitForm(data.payment_page_url);
}
