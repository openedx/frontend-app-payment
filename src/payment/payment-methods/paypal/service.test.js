import {
  configureApiService,
  checkout,
} from './service';

jest.mock('../../../common/utils', () => ({
  generateAndSubmitForm: jest.fn(),
}));

jest.mock('@edx/frontend-logging', () => ({
  logAPIErrorResponse: jest.fn(),
}));

import { generateAndSubmitForm } from '../../../common/utils'; // eslint-disable-line import/first
import { logAPIErrorResponse } from '@edx/frontend-logging'; // eslint-disable-line import/first

describe('Paypal Service', () => {
  const config = {
    ECOMMERCE_BASE_URL: 'ecommerce.org',
  };
  const basket = { basketId: 1 };
  const apiClient = {};
  configureApiService(config, apiClient);

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Object.values(generateAndSubmitForm).map(handler => handler.mockClear);
  });

  it('should generate and submit a form on success', () => {
    const successResponse = { data: { payment_page_url: 'theurl' } };

    apiClient.post = jest.fn().mockReturnValue(new Promise((resolve) => {
      resolve(successResponse);
    }));

    return checkout(basket).then(() => {
      expect(generateAndSubmitForm)
        .toHaveBeenCalledWith(successResponse.data.payment_page_url);
    });
  });

  it('should throw and log on error', () => {
    const errorResponse = {};

    apiClient.post = jest.fn().mockReturnValue(new Promise((resolve, reject) => {
      reject(errorResponse);
    }));

    return checkout(basket).catch(() => {
      expect(logAPIErrorResponse)
        .toHaveBeenCalledWith(errorResponse, {
          messagePrefix: 'PayPal Checkout Error',
          paymentMethod: 'PayPal',
          paymentErrorType: 'Checkout',
          basketId: basket.basketId,
        });
    });
  });
});
