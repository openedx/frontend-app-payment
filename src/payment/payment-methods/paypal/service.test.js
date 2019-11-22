import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import checkout from './service';
import { generateAndSubmitForm } from '../../data/utils';

jest.mock('../../data/utils', () => ({
  generateAndSubmitForm: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

describe('Paypal Service', () => {
  const basket = { basketId: 1, discountJwt: 'i_am_a_jwt' };

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Object.values(generateAndSubmitForm).map(handler => handler.mockClear);
  });

  it('should generate and submit a form on success', () => {
    const successResponseData = { payment_page_url: 'theurl' };

    axiosMock.onPost(`${getConfig().ECOMMERCE_BASE_URL}/api/v2/checkout/`)
      .reply(200, successResponseData);

    return checkout(basket).then(() => {
      expect(generateAndSubmitForm)
        .toHaveBeenCalledWith(successResponseData.payment_page_url);
    });
  });

  it('should throw and log on error', () => {
    axiosMock.onPost(`${getConfig().ECOMMERCE_BASE_URL}/api/v2/checkout/`).reply(403);

    return checkout(basket).catch(() => {
      expect(logError)
        .toHaveBeenCalledWith(expect.any(Error), {
          messagePrefix: 'PayPal Checkout Error',
          paymentMethod: 'PayPal',
          paymentErrorType: 'Checkout',
          basketId: basket.basketId,
        });
    });
  });
});
