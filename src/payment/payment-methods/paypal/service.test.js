import {
  configureApiService,
  checkout,
} from './service';

jest.mock('../../../common/utils', () => ({
  generateAndSubmitForm: jest.fn(),
}));

import { generateAndSubmitForm } from '../../../common/utils'; // eslint-disable-line import/first

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
});
