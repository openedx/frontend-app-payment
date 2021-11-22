import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import qs from 'qs';
import { logError } from '@edx/frontend-platform/logging';
import handleRequestError from '../../data/handleRequestError';
import { CARD_TYPES } from '../../checkout/payment-form/utils/credit-card';

import { checkoutWithToken, normalizeFieldErrors } from './service';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../data/handleRequestError');

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

  describe('checkout', () => {
    // eslint-disable-next-line no-unused-vars
    const mockCreateToken = jest.fn(({ expirationMonth, expirationYear }, callback) => callback(null, 'mocktoken'));

    window.microform = {
      fields: {
        number: {
          valid: true,
          cybsCardType: CARD_TYPES.visa,
        },
      },
      createToken: mockCreateToken,
      Mockroform: true,
    };

    const mockSetLocation = jest.fn();

    const CYBERSOURCE_API = `${getConfig().ECOMMERCE_BASE_URL}/payment/cybersource/authorize/`;

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
        cardExpirationMonth: '10',
        cardExpirationYear: '2022',
      },
    };
    const cardValues = Object.values(formDetails.cardDetails);

    const expectNoCardDataToBePresent = (value) => {
      const noLeakMessage = 'Value is not in card details';
      if (typeof value === 'object') {
        Object.values(value).forEach(expectNoCardDataToBePresent);
      } else {
        const isLeak = cardValues.includes(value)
          ? `Found leaked card details value: ${value}`
          : noLeakMessage;
        expect(isLeak).toBe(noLeakMessage);
      }
    };

    it('should generate and submit a form on success', async () => {
      const successResponseData = {
        receipt_page_url: 'mock://receipt.page',
      };
      axiosMock.onPost(CYBERSOURCE_API).reply(200, successResponseData);

      await expect(checkoutWithToken(basket, formDetails, mockSetLocation)).resolves.toEqual(undefined);

      const postedData = qs.parse(axiosMock.history.post[0].data);
      expectNoCardDataToBePresent(postedData);
      expect(mockCreateToken).toHaveBeenCalledWith(
        {
          expirationMonth: formDetails.cardDetails.cardExpirationMonth,
          expirationYear: formDetails.cardDetails.cardExpirationYear,
        },
        expect.any(Function),
      );
      expect(mockSetLocation).toHaveBeenCalledWith(successResponseData.receipt_page_url);
    });

    it('should redirect if the cybersource checkout request returns a url to redirect to', async () => {
      const errorRedirectData = {
        redirectTo: 'mock://error.page',
      };
      axiosMock.onPost(CYBERSOURCE_API).reply(403, errorRedirectData);
      mockSetLocation.mockClear();

      await expect(checkoutWithToken(basket, formDetails, mockSetLocation)).rejects.toEqual(expect.any(Error));

      const postedData = qs.parse(axiosMock.history.post[0].data);
      expectNoCardDataToBePresent(postedData);
      expect(mockSetLocation).toHaveBeenCalledWith(errorRedirectData.redirectTo);
    });

    it('should throw an error if the cybersource checkout request errors on the fields', async () => {
      const errorResponseData = {
        field_errors: {
          booyah: 'Booyah is bad.',
        },
      };

      axiosMock.onPost(CYBERSOURCE_API).reply(403, errorResponseData);

      expect.hasAssertions();
      await checkoutWithToken(basket, formDetails).catch(() => {
        expectNoCardDataToBePresent(axiosMock.history.post[0].data);
        expect(handleRequestError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should throw an error if the cybersource checkout request errors on the SDN check', async () => {
      const errorResponseData = {
        error: 'There was an error submitting the basket',
        sdn_check_failure: { hit_count: 1 },
      };

      axiosMock.onPost(CYBERSOURCE_API).reply(403, errorResponseData);
      mockSetLocation.mockClear();

      expect.hasAssertions();
      await expect(checkoutWithToken(basket, formDetails, mockSetLocation)).rejects.toEqual(
        new Error('This card holder did not pass the SDN check.'),
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
      await checkoutWithToken(basket, formDetails).catch(() => {
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
});
