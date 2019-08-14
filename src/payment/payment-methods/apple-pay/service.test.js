import {
  configureApiService,
  checkout,
} from './service';

jest.mock('@edx/frontend-logging', () => ({
  logError: jest.fn(),
}));

describe('Perform Apple Pay Payment', () => {
  const config = {
    APPLE_PAY_MERCHANT_IDENTIFIER: 'ecommerce.edx.org',
    APPLE_PAY_MERCHANT_NAME: 'edX e-commerce',
    APPLE_PAY_COUNTRY_CODE: 'USA',
    APPLE_PAY_CURRENCY_CODE: 'USD',
    APPLE_PAY_START_SESSION_URL: '/start-session',
    APPLE_PAY_AUTHORIZE_URL: '/authorize',
    APPLE_PAY_SUPPORTED_NETWORKS: ['amex', 'discover', 'visa', 'masterCard'],
    APPLE_PAY_MERCHANT_CAPABILITIES: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    ECOMMERCE_BASE_URL: 'ecommerce.org',
    ECOMMERCE_RECEIPT_BASE_URL: 'ecommerce.org/receipt',
    ENVIRONMENT: 'test',
  };
  const basket = { orderTotal: 50 };
  const apiClient = {};
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

  configureApiService(config, apiClient);

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
    const successResponse = { data: 1234 };

    apiClient.post = jest.fn().mockReturnValue(new Promise((resolve) => {
      resolve(successResponse);
    }));

    return checkout(basket).then(() => {
      expect(global.ApplePaySession).toHaveBeenCalledWith(
        applePayVersion,
        expect.objectContaining({
          countryCode: config.APPLE_PAY_COUNTRY_CODE,
          currencyCode: config.APPLE_PAY_CURRENCY_CODE,
          supportedNetworks: config.APPLE_PAY_SUPPORTED_NETWORKS,
          merchantCapabilities: config.APPLE_PAY_MERCHANT_CAPABILITIES,
          total: {
            label: config.APPLE_PAY_MERCHANT_NAME,
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
    const validateSuccessResponse = { data: 1234 };
    const authSuccessResponse = { data: { number: 'the order number' } };

    apiClient.post = jest.fn(url => new Promise((resolve) => {
      if (url === config.APPLE_PAY_START_SESSION_URL) {
        resolve(validateSuccessResponse);
      } else if (url === config.APPLE_PAY_AUTHORIZE_URL) {
        resolve(authSuccessResponse);
      }
    }));

    return checkout(basket).then((orderNumber) => {
      expect(applePaySession.completeMerchantValidation)
        .toHaveBeenCalledWith(validateSuccessResponse.data);

      expect(orderNumber).toEqual(authSuccessResponse.data.number);
      expect(applePaySession.completePayment)
        .toHaveBeenCalledWith(global.ApplePaySession.STATUS_SUCCESS);
    });
  });


  it('should abort if merchant validation fails', () => {
    apiClient.post = jest.fn(url => new Promise((resolve, reject) => {
      if (url === config.APPLE_PAY_START_SESSION_URL) {
        reject(new Error('error'));
      }

      resolve({});
    }));

    return checkout(basket).catch((error) => {
      expect(error.code).toEqual('apple-pay-merchant-validation-failure');
    });
  });

  it('should complete the session with a failed status if authorization fails', () => {
    apiClient.post = jest.fn(url => new Promise((resolve, reject) => {
      if (url === config.APPLE_PAY_AUTHORIZE_URL) {
        reject(new Error('error'));
      }

      resolve({});
    }));

    return checkout(basket).catch((error) => {
      expect(applePaySession.completePayment)
        .toHaveBeenCalledWith(global.ApplePaySession.STATUS_FAILURE);
      expect(error.code).toEqual('apple-pay-authorization-failure');
    });
  });

  it('should fire the cancel handler on cancel', () => {
    apiClient.post = jest.fn().mockReturnValue(new Promise((resolve) => {
      setTimeout(resolve, 250); // wait long enough to cancel the session
    }));

    const checkoutPromise = checkout(basket)
      .catch(error => expect(error.aborted).toEqual(true));

    applePaySession.oncancel('cancel event');

    return checkoutPromise;
  });
});
