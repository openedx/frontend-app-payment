import pick from 'lodash.pick';
import { logError } from '@edx/frontend-logging';
import { applyConfiguration } from '../../common/serviceUtils';

let apiClient = null;

let config = {
  ECOMMERCE_BASE_URL: null,
  ECOMMERCE_RECEIPT_BASE_URL: null,
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

export const performApplePayPayment = ({
  totalAmount,
  onPaymentBegin,
  onPaymentComplete,
  onPaymentAuthorizationFailure,
  onMerchantValidationFailure,
  onPaymentCancel,
}) => {
  // Session Set Up
  // ------------------------

  const version = 2;
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
        logError(error);
        applePaySession.abort();
        /* istanbul ignore else */
        if (onMerchantValidationFailure) onMerchantValidationFailure(error);
      });
  };

  applePaySession.onpaymentauthorized = (event) => {
    const postData = event.payment;

    return apiClient.post(config.APPLE_PAY_AUTHORIZE_URL, postData)
      .then(({ data }) => {
        const orderNumber = data.number;
        applePaySession.completePayment(global.ApplePaySession.STATUS_SUCCESS);
        /* istanbul ignore else */
        if (onPaymentComplete) onPaymentComplete(orderNumber);
      })
      .catch((error) => {
        logError(error);
        applePaySession.completePayment(global.ApplePaySession.STATUS_FAILURE);
        /* istanbul ignore else */
        if (onPaymentAuthorizationFailure) onPaymentAuthorizationFailure(error);
      });
  };

  applePaySession.oncancel = (event) => {
    /* istanbul ignore else */
    if (onPaymentCancel) onPaymentCancel(event);
  };

  // Begin transaction
  // ------------------------
  applePaySession.begin();
  if (onPaymentBegin) onPaymentBegin();
};

/* istanbul ignore next - you can't mock window.location.href in jsdom */
export const redirectToReceipt = (orderNumber) => {
  global.location.href = `${config.ECOMMERCE_RECEIPT_BASE_URL}?order_number=${orderNumber}`;
};
