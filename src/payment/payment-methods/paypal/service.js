import { App } from '@edx/frontend-base';
import { logApiClientError } from '@edx/frontend-logging';

import { generateAndSubmitForm } from '../../data/utils';

App.ensureConfig(['ECOMMERCE_BASE_URL'], 'PayPal API service');

/**
 * Checkout with PayPal
 *
 * 1. Send the basket_id and payment_processor to our /api/v2/checkout/
 * 2. Receive a paypal url
 * 3. Generate an submit an empty form to the paypal url
 */
export default async function checkout(basket) {
  const { basketId } = basket;

  const formData = {
    basket_id: basketId,
    payment_processor: 'paypal',
  };
  if (basket.discountJwt) {
    formData.discount_jwt = basket.discountJwt;
  }

  const { data } = await App.apiClient
    .post(`${App.config.ECOMMERCE_BASE_URL}/api/v2/checkout/`, formData)
    .catch((error) => {
      logApiClientError(error, {
        messagePrefix: 'PayPal Checkout Error',
        paymentMethod: 'PayPal',
        paymentErrorType: 'Checkout',
        basketId,
      });

      throw error;
    });

  generateAndSubmitForm(data.payment_page_url);
}
