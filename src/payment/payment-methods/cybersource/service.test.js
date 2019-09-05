import { configureApiService, checkout, normalizeFieldErrors } from './service';

jest.mock('../../../common/utils', () => ({
  generateAndSubmitForm: jest.fn(),
}));

jest.mock('@edx/frontend-logging', () => ({
  logApiClientError: jest.fn(),
}));

import { generateAndSubmitForm } from '../../../common/utils'; // eslint-disable-line import/first
import { logApiClientError } from '@edx/frontend-logging'; // eslint-disable-line import/first

const config = {
  ECOMMERCE_BASE_URL: 'ecommerce.org',
  CYBERSOURCE_URL: 'cybersource.org',
  ENVIRONMENT: 'test',
};

const SDN_URL = `${config.ECOMMERCE_BASE_URL}/api/v2/sdn/search/`;
const CYBERSOURCE_API = `${config.ECOMMERCE_BASE_URL}/payment/cybersource/api-submit/`;

describe('Cybersource Service', () => {
  const basket = { basketId: 1, discountJwt: 'i_am_a_jwt' };
  const formDetails = {
    cardHolderInfo: {
      firstName: 'Yo',
      lastName: 'Yoyo',
      address: 'Green ln',
      unit: '#1',
      city: 'City',
      country: 'Everyland',
      postalCode: '24631',
      organization: 'skunkworks',
    },
    cardDetails: {
      cardNumber: '4111-1111-1111-1111 ',
      cardTypeId: 'VISA??',
      securityCode: '123',
      cardExpirationMonth: '10',
      cardExpirationYear: '2022',
    },
  };
  const cardValues = Object.values(formDetails.cardDetails);

  const apiClient = {};
  configureApiService(config, apiClient);

  describe('normalizeCheckoutErrors', () => {
    it('should return fieldErrors if fieldErrors is not an object', () => {
      let result = normalizeFieldErrors(undefined);
      expect(result).toBeUndefined();

      result = normalizeFieldErrors(null);
      expect(result).toBeNull();

      result = normalizeFieldErrors('boo');
      expect(result).toEqual('boo');

      result = normalizeFieldErrors([]);
      expect(result).toEqual([]);

      result = normalizeFieldErrors(123);
      expect(result).toEqual(123);
    });

    it('should return an empty object if given an empty object', () => {
      const result = normalizeFieldErrors({});
      expect(result).toEqual({});
    });

    it('should return a normalized field_errors object', () => {
      const result = normalizeFieldErrors({
        field_name: 'Error message.',
        other_field_name: 'Other error message.',
      });
      expect(result).toEqual({
        field_name: { user_message: 'Error message.', error_code: null },
        other_field_name: { user_message: 'Other error message.', error_code: null },
      });
    });
  });

  describe('checkout', () => {
    beforeEach(() => {
      // Clear all instances and calls to constructor and all methods:
      Object.values(generateAndSubmitForm).map(handler => handler.mockClear);
    });

    const expectNoCardDataToBePresent = (postData) => {
      Object.values(postData).forEach((value) => {
        if (typeof value === 'object') {
          expectNoCardDataToBePresent(postData);
        } else {
          expect(cardValues.includes(value)).toBe(false);
        }
      });
    };

    it('should generate and submit a form on success', async () => {
      const successResponse = {
        data: {
          form_fields: {
            allThe: 'all the form fields form cybersource',
          },
        },
      };
      const sdnResponse = { data: { hits: 0 } };

      apiClient.post = (url, postData) =>
        new Promise((resolve) => {
          expectNoCardDataToBePresent(postData);
          if (url === CYBERSOURCE_API) {
            resolve(successResponse);
          }
          if (url === SDN_URL) {
            resolve(sdnResponse);
          }
        });

      await expect(checkout(basket, formDetails)).resolves.toEqual(undefined);
      expect(generateAndSubmitForm).toHaveBeenCalledWith(
        config.CYBERSOURCE_URL,
        expect.objectContaining({
          ...successResponse.data.form_fields,
          card_number: '4111111111111111',
          card_type: 'VISA??',
          card_cvn: '123',
          card_expiry_date: '10-2022',
        }),
      );
    });

    it('should throw an error if there are SDN hits', () => {
      const successResponse = {
        data: {
          form_fields: {
            allThe: 'all the form fields form cybersource',
          },
        },
      };
      const sdnResponse = { data: { hits: 1 } };

      apiClient.post = (url, postData) =>
        new Promise((resolve) => {
          expectNoCardDataToBePresent(postData);
          if (url === CYBERSOURCE_API) {
            resolve(successResponse);
          }
          if (url === SDN_URL) {
            resolve(sdnResponse);
          }
        });

      return expect(checkout(basket, formDetails)).rejects.toEqual(new Error('This card holder did not pass the SDN check.'));
    });

    it('should throw an error if the SDN check errors', async () => {
      const sdnErrorResponse = { boo: 'yah' };

      apiClient.post = () =>
        new Promise((resolve, reject) => {
          reject(sdnErrorResponse);
        });

      await expect(checkout(basket, formDetails)).rejects.toEqual(sdnErrorResponse);
      expect(logApiClientError).toHaveBeenCalledWith(sdnErrorResponse, {
        messagePrefix: 'SDN Check Error',
        paymentMethod: 'Cybersource',
        paymentErrorType: 'SDN Check',
        basketId: basket.basketId,
      });
    });

    it('should throw an error if the cybersource checkout request errors', async () => {
      const errorResponse = {
        data: {
          field_errors: {
            booyah: 'Booyah is bad.',
          },
        },
      };
      const error = new Error();
      error.response = errorResponse;
      const sdnResponse = { data: { hits: 0 } };

      apiClient.post = url =>
        new Promise((resolve, reject) => {
          if (url === SDN_URL) {
            resolve(sdnResponse);
          }
          if (url === CYBERSOURCE_API) {
            reject(error);
          }
        });

      await expect(checkout(basket, formDetails)).rejects.toEqual(error);
      expect(logApiClientError).toHaveBeenCalledWith(error, {
        messagePrefix: 'Cybersource Submit Error',
        paymentMethod: 'Cybersource',
        paymentErrorType: 'Submit Error',
        basketId: basket.basketId,
      });
    });

    it('should throw an unknown error if the cybersource checkout request without a response body', async () => {
      const errorResponse = {};
      const error = new Error();
      error.response = errorResponse;
      const sdnResponse = { data: { hits: 0 } };

      apiClient.post = url =>
        new Promise((resolve, reject) => {
          if (url === SDN_URL) {
            resolve(sdnResponse);
          }
          if (url === CYBERSOURCE_API) {
            reject(error);
          }
        });

      await expect(checkout(basket, formDetails)).rejects.toEqual(error);

      expect(logApiClientError).toHaveBeenCalledWith(error, {
        messagePrefix: 'Cybersource Submit Error',
        paymentMethod: 'Cybersource',
        paymentErrorType: 'Submit Error',
        basketId: basket.basketId,
      });
    });
  });
});
