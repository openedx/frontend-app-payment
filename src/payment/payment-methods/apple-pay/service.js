import pick from 'lodash.pick';
import { logAPIErrorResponse } from '@edx/frontend-logging';
import { applyConfiguration } from '../../../common/serviceUtils';

let apiClient = null;

let config = {
  ECOMMERCE_BASE_URL: null,
  ECOMMERCE_RECEIPT_BASE_URL: null,
  ENVIRONMENT: null,
  APPLE_PAY_MERCHANT_IDENTIFIER: null,
  APPLE_PAY_MERCHANT_NAME: null,
  APPLE_PAY_COUNTRY_CODE: null,
  APPLE_PAY_CURRENCY_CODE: null,
  APPLE_PAY_START_SESSION_URL: null,
  APPLE_PAY_AUTHORIZE_URL: null,
  APPLE_PAY_SUPPORTED_NETWORKS: null,
  APPLE_PAY_MERCHANT_CAPABILITIES: null,
};

export function configureApiService(_config, _apiClient) {
  applyConfiguration(config, _config);
  config = pick(_config, Object.keys(config));
  apiClient = _apiClient;
}

/**
 * Given an order number, and an optional arg of whether to disable the back button, redirects the
 * user to the receipt page with the correct query parameters.
 *
 * @param orderNumber The number of the order
 * @param disableBackButton Whether to disable the back button on the receipt page. We default to
 * false since the receipt page is referenced in emails/etc. We only disable the back button when
 * the flow goes through the payment page.
 */
/* istanbul ignore next - you can't mock window.location.href in jsdom */
export const redirectToReceipt = (orderNumber, disableBackButton = false) => {
  const queryParams = `order_number=${orderNumber}&disable_back_button=${Number(disableBackButton)}`;
  if (config.ENVIRONMENT !== 'test') {
    /* istanbul ignore next */
    global.location.href = `${config.ECOMMERCE_RECEIPT_BASE_URL}?${queryParams}`;
  }
};

export function checkout(basket) {
  return new Promise((resolve, reject) => {
    // Session Set Up
    // ------------------------

    const version = 2;
    const totalAmount = basket.orderTotal;
    const paymentRequest = {
      countryCode: config.APPLE_PAY_COUNTRY_CODE,
      currencyCode: config.APPLE_PAY_CURRENCY_CODE,
      supportedNetworks: config.APPLE_PAY_SUPPORTED_NETWORKS,
      merchantCapabilities: config.APPLE_PAY_MERCHANT_CAPABILITIES,
      total: {
        label: config.APPLE_PAY_MERCHANT_NAME,
        type: 'final',
        amount: totalAmount,
      },
      requiredBillingContactFields: ['postalAddress'],
    };

    const applePaySession = new global.ApplePaySession(version, paymentRequest);

    // Set Up Event Handlers on Payment Session
    // ------------------------

    applePaySession.onvalidatemerchant = (event) => {
      const postData = {
        url: event.validationURL,
        is_payment_microfrontend: true,
      };

      return apiClient.post(config.APPLE_PAY_START_SESSION_URL, postData)
        .then((response) => {
          applePaySession.completeMerchantValidation(response.data);
        })
        .catch((error) => {
          // eslint-disable-next-line no-param-reassign
          error.code = 'apple-pay-merchant-validation-failure';
          logAPIErrorResponse(error, {
            messagePrefix: 'Apple Pay Merchant Validation Failure',
            paymentMethod: 'Apple Pay',
            paymentErrorType: 'Merchant Validation',
            basketId: basket.basketId,
          });
          applePaySession.abort();
          reject(error);
        });
    };

    applePaySession.onpaymentauthorized = (event) => {
      const postData = event.payment;

      return apiClient.post(config.APPLE_PAY_AUTHORIZE_URL, postData)
        .then(({ data }) => {
          const orderNumber = data.number;
          applePaySession.completePayment(global.ApplePaySession.STATUS_SUCCESS);
          redirectToReceipt(orderNumber);
          resolve(orderNumber);
        })
        .catch((error) => {
          // eslint-disable-next-line no-param-reassign
          error.code = 'apple-pay-authorization-failure';
          logAPIErrorResponse(error, {
            messagePrefix: 'Apple Pay Authorization Failure',
            paymentMethod: 'Apple Pay',
            paymentErrorType: 'Authorization',
            basketId: basket.basketId,
          });
          applePaySession.completePayment(global.ApplePaySession.STATUS_FAILURE);
          reject(error);
        });
    };

    applePaySession.oncancel = () => {
      const abortError = new Error('Cancelled');
      abortError.aborted = true;
      reject(abortError);
    };

    // // Begin transaction
    // // ------------------------
    applePaySession.begin();
  });
}
