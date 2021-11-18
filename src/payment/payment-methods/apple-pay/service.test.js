import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { logError } from '@edx/frontend-platform/logging';

import { checkout } from './service';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

beforeEach(() => {
  axiosMock.reset();
  logError.mockReset();
});

describe('Perform Apple Pay Payment', () => {
  const basket = { orderTotal: 50 };
  const applePayVersion = 2;
  const appleEndpointResponses = {
    validateMerchant: { validationURL: 'validationURL' },
    authorized: { payment: 'paymentAuthData' },
  };
  const applePaySession = {
    begin: jest.fn(() => {
      applePaySession.onvalidatemerchant(appleEndpointResponses.validateMerchant);
    }),
    abort: jest.fn(),
    completeMerchantValidation: jest.fn(() => {
      applePaySession.onpaymentauthorized(appleEndpointResponses.authorized);
    }),
    completePayment: jest.fn(),
  };
  global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
  global.ApplePaySession.STATUS_SUCCESS = 'STATUS_SUCCESS';
  global.ApplePaySession.STATUS_FAILURE = 'STATUS_FAILURE';

  const eventHandlers = {
    onPaymentBegin: jest.fn(),
    onPaymentComplete: jest.fn(),
    onMerchantValidationFailure: jest.fn(),
    onPaymentAuthorizationFailure: jest.fn(),
    onPaymentCancel: jest.fn(),
  };

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    global.ApplePaySession.mockClear();
    applePaySession.begin.mockClear();
    applePaySession.abort.mockClear();
    applePaySession.completeMerchantValidation.mockClear();
    applePaySession.completePayment.mockClear();
    Object.values(eventHandlers).map(handler => handler.mockClear);
  });

  it('should create a new apple pay session', () => {
    const successResponseData = 1234;
    axiosMock.onPost(getConfig().APPLE_PAY_START_SESSION_URL).reply(200, successResponseData);
    axiosMock.onPost(getConfig().APPLE_PAY_AUTHORIZE_URL).reply(200, {});

    return checkout(basket).then(() => {
      expect(global.ApplePaySession).toHaveBeenCalledWith(
        applePayVersion,
        expect.objectContaining({
          countryCode: getConfig().APPLE_PAY_COUNTRY_CODE,
          currencyCode: getConfig().APPLE_PAY_CURRENCY_CODE,
          supportedNetworks: getConfig().APPLE_PAY_SUPPORTED_NETWORKS,
          merchantCapabilities: getConfig().APPLE_PAY_MERCHANT_CAPABILITIES,
          total: {
            label: getConfig().APPLE_PAY_MERCHANT_NAME,
            type: 'final',
            amount: 50,
          },
          requiredBillingContactFields: ['postalAddress'],
        }),
      );
      expect(typeof applePaySession.onvalidatemerchant).toBe('function');
      expect(typeof applePaySession.onpaymentauthorized).toBe('function');
      expect(applePaySession.begin).toHaveBeenCalled();
    });
  });

  it('should validate the merchant and submit the payment for authorization', () => {
    const validateSuccessResponseData = 1234;
    const authSuccessResponseData = { number: 'the order number' };
    axiosMock.onPost(getConfig().APPLE_PAY_START_SESSION_URL)
      .reply(200, validateSuccessResponseData);
    axiosMock.onPost(getConfig().APPLE_PAY_AUTHORIZE_URL).reply(200, authSuccessResponseData);

    return checkout(basket).then((orderNumber) => {
      expect(applePaySession.completeMerchantValidation)
        .toHaveBeenCalledWith(validateSuccessResponseData);

      expect(orderNumber).toEqual(authSuccessResponseData.number);
      expect(applePaySession.completePayment)
        .toHaveBeenCalledWith(global.ApplePaySession.STATUS_SUCCESS);
    });
  });

  it('should abort if merchant validation fails', () => {
    axiosMock.onPost(getConfig().APPLE_PAY_START_SESSION_URL).reply(403);

    return checkout(basket).catch((error) => {
      expect(error.code).toEqual('apple-pay-merchant-validation-failure');
    });
  });

  it('should complete the session with a failed status if authorization fails', () => {
    axiosMock.onPost(getConfig().APPLE_PAY_START_SESSION_URL).reply(200);
    axiosMock.onPost(getConfig().APPLE_PAY_AUTHORIZE_URL).reply(403, {});

    return checkout(basket).catch((error) => {
      expect(applePaySession.completePayment)
        .toHaveBeenCalledWith(global.ApplePaySession.STATUS_FAILURE);
      expect(error.code).toEqual('apple-pay-authorization-failure');
    });
  });

  it('should fire the cancel handler on cancel', () => {
    axiosMock.onPost(getConfig().APPLE_PAY_START_SESSION_URL)
      .reply(() => new Promise((resolve) => {
        setTimeout(() => {
          resolve([200]);
        }, 250);
      }));

    const checkoutPromise = checkout(basket)
      .catch(error => expect(error.aborted).toEqual(true));

    applePaySession.oncancel('cancel event');

    return checkoutPromise;
  });
});
