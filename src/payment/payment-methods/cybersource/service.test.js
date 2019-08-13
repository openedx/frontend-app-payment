import {
  configureApiService,
  checkout,
} from './service';

jest.mock('../../../common/utils', () => ({
  generateAndSubmitForm: jest.fn(),
}));

import { generateAndSubmitForm } from '../../../common/utils'; // eslint-disable-line import/first

const config = {
  ECOMMERCE_BASE_URL: 'ecommerce.org',
  CYBERSOURCE_URL: 'cybersource.org',
};

const SDN_URL = `${config.ECOMMERCE_BASE_URL}/api/v2/sdn/search/`;
const CYBERSOURCE_API = `${config.ECOMMERCE_BASE_URL}/payment/cybersource/api-submit/`;


describe('Cybersource Service', () => {
  const basket = { basketId: 1 };
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
      cardNumber: '4111111111111111',
      cardTypeId: 'VISA??',
      securityCode: '123',
      cardExpirationMonth: '10',
      cardExpirationYear: '2022',
    },
  };
  const cardValues = Object.values(formDetails.cardDetails);

  const apiClient = {};
  configureApiService(config, apiClient);

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

  it('should generate and submit a form on success', () => {
    const successResponse = {
      data: {
        form_fields: {
          allThe: 'all the form fields form cybersource',
        },
      },
    };
    const sdnResponse = { data: { hits: 0 } };

    apiClient.post = (url, postData) => new Promise((resolve) => {
      expectNoCardDataToBePresent(postData);
      if (url === CYBERSOURCE_API) {
        resolve(successResponse);
      }
      if (url === SDN_URL) {
        resolve(sdnResponse);
      }
    });

    return checkout(basket, formDetails).then(() => {
      expect(generateAndSubmitForm)
        .toHaveBeenCalledWith(config.CYBERSOURCE_URL, expect.objectContaining({
          ...successResponse.data.form_fields,
          card_number: '4111111111111111',
          card_type: 'VISA??',
          card_cvn: '123',
          card_expiry_date: '10-2022',
        }));
    });
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

    apiClient.post = (url, postData) => new Promise((resolve) => {
      expectNoCardDataToBePresent(postData);
      if (url === CYBERSOURCE_API) {
        resolve(successResponse);
      }
      if (url === SDN_URL) {
        resolve(sdnResponse);
      }
    });

    return expect(checkout(basket, formDetails)).rejects.toEqual(new Error('SDN Failure'));
  });
});
