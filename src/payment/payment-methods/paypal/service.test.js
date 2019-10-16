import { App } from '@edx/frontend-base';
import { logApiClientError } from '@edx/frontend-logging';

import checkout from './service';
import { generateAndSubmitForm } from '../../data/utils';

jest.mock('../../data/utils', () => ({
  generateAndSubmitForm: jest.fn(),
}));

jest.mock('@edx/frontend-logging', () => ({
  logApiClientError: jest.fn(),
}));

describe('Paypal Service', () => {
  const config = {
    ECOMMERCE_BASE_URL: 'ecommerce.org',
  };
  const basket = { basketId: 1, discountJwt: 'i_am_a_jwt' };
  App.config = config;
  App.apiClient = {};

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Object.values(generateAndSubmitForm).map(handler => handler.mockClear);
  });

  it('should generate and submit a form on success', () => {
    const successResponse = { data: { payment_page_url: 'theurl' } };

    App.apiClient.post = jest.fn().mockReturnValue(new Promise((resolve) => {
      resolve(successResponse);
    }));

    return checkout(basket).then(() => {
      expect(generateAndSubmitForm)
        .toHaveBeenCalledWith(successResponse.data.payment_page_url);
    });
  });

  it('should throw and log on error', () => {
    const errorResponse = {};

    App.apiClient.post = jest.fn().mockReturnValue(new Promise((resolve, reject) => {
      reject(errorResponse);
    }));

    return checkout(basket).catch(() => {
      expect(logApiClientError)
        .toHaveBeenCalledWith(errorResponse, {
          messagePrefix: 'PayPal Checkout Error',
          paymentMethod: 'PayPal',
          paymentErrorType: 'Checkout',
          basketId: basket.basketId,
        });
    });
  });
});
