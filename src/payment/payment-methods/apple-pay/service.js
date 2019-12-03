import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'ECOMMERCE_BASE_URL',
  'ENVIRONMENT',
  'APPLE_PAY_MERCHANT_NAME',
  'APPLE_PAY_COUNTRY_CODE',
  'APPLE_PAY_CURRENCY_CODE',
  'APPLE_PAY_START_SESSION_URL',
  'APPLE_PAY_AUTHORIZE_URL',
  'APPLE_PAY_SUPPORTED_NETWORKS',
  'APPLE_PAY_MERCHANT_CAPABILITIES',
], 'ApplePay API service');

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
  if (getConfig().ENVIRONMENT !== 'test') {
    /* istanbul ignore next */
    global.location.href = `${getConfig().ECOMMERCE_BASE_URL}/checkout/receipt/?${queryParams}`;
  }
};

/**
 * Checkout with Apple Pay overview:
 *
 * 1. Create an ApplePaySession with a payment request object
 * 2. Add event handlers to the created applePaySession
 * 3. Begin the session.
 * 4. Safari will call onvalidatemerchant with a validationURL
 * 5. We send the validationURL to APPLE_PAY_START_SESSION_URL.
 * 6. On success we complete the merchant validation with Safari
 * 7. Safari will call onpaymentauthorized with a payment object
 * 8. We send the payment object to APPLE_PAY_AUTHORIZE_URL
 * 9. On success we redirect to the order receipt using the
 *    returned order number.
 */
export function checkout(basket) {
  return new Promise((resolve, reject) => {
    // Session Set Up
    // ------------------------

    const version = 2;
    const totalAmount = basket.orderTotal;
    const paymentRequest = {
      countryCode: getConfig().APPLE_PAY_COUNTRY_CODE,
      currencyCode: getConfig().APPLE_PAY_CURRENCY_CODE,
      supportedNetworks: getConfig().APPLE_PAY_SUPPORTED_NETWORKS,
      merchantCapabilities: getConfig().APPLE_PAY_MERCHANT_CAPABILITIES,
      total: {
        label: getConfig().APPLE_PAY_MERCHANT_NAME,
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

      return getAuthenticatedHttpClient().post(getConfig().APPLE_PAY_START_SESSION_URL, postData)
        .then((response) => {
          applePaySession.completeMerchantValidation(response.data);
        })
        .catch((error) => {
          // eslint-disable-next-line no-param-reassign
          error.code = 'apple-pay-merchant-validation-failure';
          logError(error, {
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

      return getAuthenticatedHttpClient().post(getConfig().APPLE_PAY_AUTHORIZE_URL, postData)
        .then(({ data }) => {
          const orderNumber = data.number;
          applePaySession.completePayment(global.ApplePaySession.STATUS_SUCCESS);
          redirectToReceipt(orderNumber);
          resolve(orderNumber);
        })
        .catch((error) => {
          // eslint-disable-next-line no-param-reassign
          error.code = 'apple-pay-authorization-failure';
          logError(error, {
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
