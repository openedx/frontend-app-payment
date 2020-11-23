import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { logError } from '@edx/frontend-platform/logging';

import { normalizeFieldErrors } from './service';

jest.mock('../../data/utils', () => ({
  generateAndSubmitForm: jest.fn(),
  isWaffleFlagEnabled: jest.fn(),
}));

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

describe('Cybersource Service', () => {
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

  // FIXME: TEST: need to fake the microform somehow for this test to work and convert to checkoutWithToken
  /*
  describe('checkout', () => {
    beforeEach(() => {
      // Clear all instances and calls to constructor and all methods:
      Object.values(generateAndSubmitForm).map(handler => handler.mockClear);
    });

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

    const expectNoCardDataToBePresent = (value) => {
      if (typeof value === 'object') {
        Object.values(value).forEach(expectNoCardDataToBePresent);
      } else {
        expect(cardValues.includes(value)).toBe(false);
      }
    };

    it('should generate and submit a form on success', async () => {
      const successResponseData = {
        form_fields: {
          allThe: 'all the form fields form cybersource',
        },
      };
      axiosMock.onPost(CYBERSOURCE_API).reply(200, successResponseData);

      await expect(checkout(basket, formDetails)).resolves.toEqual(undefined);
      expectNoCardDataToBePresent(axiosMock.history.post[0].data);
      expect(generateAndSubmitForm).toHaveBeenCalledWith(
        getConfig().CYBERSOURCE_URL,
        expect.objectContaining({
          ...successResponseData.form_fields,
          card_number: '4111111111111111',
          card_type: 'VISA??',
          card_cvn: '123',
          card_expiry_date: '10-2022',
        }),
      );
    });

    it('should throw an error if the cybersource checkout request errors on the fields', async () => {
      const errorResponseData = {
        field_errors: {
          booyah: 'Booyah is bad.',
        },
      };

      axiosMock.onPost(CYBERSOURCE_API).reply(403, errorResponseData);

      expect.hasAssertions();
      await checkout(basket, formDetails).catch(() => {
        expectNoCardDataToBePresent(axiosMock.history.post[0].data);
        expect(logError).toHaveBeenCalledWith(expect.any(Error), {
          messagePrefix: 'Cybersource Submit Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'Submit Error',
          basketId: basket.basketId,
        });
      });
    });

    it('should throw an error if the cybersource checkout request errors on the SDN check', async () => {
      const errorResponseData = {
        error: 'There was an error submitting the basket',
        sdn_check_failure: { hit_count: 1 },
      };

      axiosMock.onPost(CYBERSOURCE_API).reply(403, errorResponseData);

      expect.hasAssertions();
      await expect(checkout(basket, formDetails)).rejects.toEqual(
        new Error('This card holder did not pass the SDN check.')
      );
      expect(logError).toHaveBeenCalledWith(expect.any(Error), {
        messagePrefix: 'SDN Check Error',
        paymentMethod: 'Cybersource',
        paymentErrorType: 'SDN Check Submit Api',
        basketId: basket.basketId,
      });
    });

    it('should throw an unknown error if the cybersource checkout request without a response body', async () => {
      const errorResponseData = {};

      axiosMock.onPost(CYBERSOURCE_API).reply(403, errorResponseData);

      expect.hasAssertions();
      await checkout(basket, formDetails).catch(() => {
        expectNoCardDataToBePresent(axiosMock.history.post[0].data);
        expect(logError).toHaveBeenCalledWith(expect.any(Error), {
          messagePrefix: 'Cybersource Submit Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'Submit Error',
          basketId: basket.basketId,
        });
      });
    });
  });
  */
});
