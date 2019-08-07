/* eslint-disable no-console */
import pick from 'lodash.pick';
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

/* istanbul ignore next */
const tempLogAxiosError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.data.statusMessage);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
  }
  console.log(error.config);
};


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
    console.log('Validating merchant...');

    const postData = {
      url: event.validationURL,
      is_payment_microfrontend: true,
    };

    return apiClient.post(config.APPLE_PAY_START_SESSION_URL, postData)
      .then((response) => {
        console.log('Merchant validation succeeded.', response.data);
        applePaySession.completeMerchantValidation(response.data);
      })
      .catch((error) => {
        tempLogAxiosError(error);
        applePaySession.abort();
        /* istanbul ignore else */
        if (onMerchantValidationFailure) onMerchantValidationFailure(error);
      });
  };

  applePaySession.onpaymentauthorized = (event) => {
    console.log('Submitting Apple Pay payment to CyberSource...');

    const postData = event.payment;

    return apiClient.post(config.APPLE_PAY_AUTHORIZE_URL, postData)
      .then(({ data }) => {
        const orderNumber = data.number;
        console.log('CyberSource successfully authorized Apple Pay payment.', data);
        applePaySession.completePayment(global.ApplePaySession.STATUS_SUCCESS);
        /* istanbul ignore else */
        if (onPaymentComplete) onPaymentComplete(orderNumber, true);
      })
      .catch((error) => {
        tempLogAxiosError(error);
        applePaySession.completePayment(global.ApplePaySession.STATUS_FAILURE);
        /* istanbul ignore else */
        if (onPaymentAuthorizationFailure) onPaymentAuthorizationFailure(error);
      });
  };

  applePaySession.oncancel = (event) => {
    console.log('Cancel', event);
    /* istanbul ignore else */
    if (onPaymentCancel) onPaymentCancel(event);
  };


  // Begin transaction
  // ------------------------
  applePaySession.begin();
  if (onPaymentBegin) onPaymentBegin();
};

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
  global.location.href = `${config.ECOMMERCE_RECEIPT_BASE_URL}?${queryParams}`;
};
