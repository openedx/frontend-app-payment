import { runSaga } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';
import { Factory } from 'rosie';
import paymentSaga, {
  handleFetchBasket,
  handleSubmitPayment,
  handleUpdateQuantity,
  handleRemoveCoupon,
  handleAddCoupon,
} from './sagas';
import { configureApiService, transformResults } from './service';
import {
  basketDataReceived,
  fetchBasket,
  addCoupon,
  removeCoupon,
  updateQuantity,
  submitPayment,
} from './actions';
import { clearMessages, MESSAGE_TYPES, addMessage } from '../../feedback';

import './__factories__/basket.factory';

import * as cybersourceService from '../payment-methods/cybersource';

jest.mock('@edx/frontend-logging');
jest.mock('../payment-methods/cybersource', () => ({
  checkout: jest.fn(),
  configureApiService: jest.fn(),
}));

describe('saga tests', () => {
  let dispatched;
  let caughtErrors;
  let sagaOptions;
  let response;
  let configuration;
  let basketProcessingState;
  let basketNotProcessingState;

  beforeEach(() => {
    dispatched = [];
    caughtErrors = [];

    configuration = {
      // Any necessary "configuration" the service needs.
      ACCOUNTS_API_BASE_URL: 'http://localhost/accounts',
      APPLE_PAY_MERCHANT_IDENTIFIER: null,
      APPLE_PAY_MERCHANT_NAME: null,
      APPLE_PAY_COUNTRY_CODE: null,
      APPLE_PAY_CURRENCY_CODE: null,
      APPLE_PAY_START_SESSION_URL: null,
      APPLE_PAY_AUTHORIZE_URL: null,
      APPLE_PAY_SUPPORTED_NETWORKS: null,
      APPLE_PAY_MERCHANT_CAPABILITIES: null,
      ECOMMERCE_BASE_URL: 'http://localhost/ecommerce/base',
      ECOMMERCE_API_BASE_URL: 'http://localhost/ecommerce/api',
      ECOMMERCE_RECEIPT_BASE_URL: 'http://localhost/ecommerce/receipts',
      CYBERSOURCE_URL: 'http://localhost/cybersource',
      ENVIRONMENT: 'test',
      LMS_BASE_URL: 'http://localhost/lms',
    };

    // Used to reset the dispatch and onError handlers for runSaga.
    sagaOptions = {
      dispatch: action => dispatched.push(action),
      onError: err => caughtErrors.push(err),
    };

    basketProcessingState = { payment: { basket: { isBasketProcessing: true } } };
    basketNotProcessingState = { payment: { basket: { isBasketProcessing: false } } };
  });

  /**
   * Creates a mock of the apiClient's "get" method.  Will resolve all calls to it with the same
   * data response. This means it may not be as useful if you need to test a service that makes
   * multiple, different API calls.
   */
  function createBasketMockApiClient(data, options = { throws: false }) {
    const mockHandler = () =>
      new Promise((resolve, reject) => {
        if (options.throws) {
          const error = new Error();
          error.response = data;
          reject(error);
        } else {
          resolve(data); // resolving here results in a successful server response.
        }
      });
    return {
      // Mocked apiClient methods
      get: jest.fn(mockHandler),
      post: jest.fn(mockHandler),
      delete: jest.fn(mockHandler),
      interceptors: { response: { use: jest.fn() } },
    };
  }

  describe('handleFetchBasket', () => {
    it('should update basket data', async () => {
      response = {
        data: Factory.build(
          'basket',
          {
            // We include offers here solely to exercise some logic in transformResults.  It's
            // otherwise unrelated to this particular test.
            offers: [
              {
                provider: 'me',
                benefitValue: '12',
              },
              {
                provider: null,
                benefitValue: '15',
              },
            ],
          },
          // We use a different product type here SOLELY to exercise a different clause in
          // getOrderType in the service.  It's otherwise unrelated to this test.
          { numProducts: 1, productType: 'Seat' },
        ),
      };

      const mockApiClient = createBasketMockApiClient(response);
      configureApiService(configuration, mockApiClient);

      try {
        await runSaga(sagaOptions, handleFetchBasket).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        basketDataReceived(transformResults(response.data)),
        clearMessages(),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should update basket data and show an info message', async () => {
      response = {
        data: Factory.build('basket', {}, { numProducts: 1, numInfoMessages: 1 }),
      };

      const mockApiClient = createBasketMockApiClient(response);
      configureApiService(configuration, mockApiClient);

      try {
        await runSaga(sagaOptions, handleFetchBasket).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      const message = response.data.messages[0];

      expect(dispatched).toEqual([
        basketDataReceived(transformResults(response.data)),
        clearMessages(),
        addMessage(message.code, null, message.data, MESSAGE_TYPES.INFO),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should update basket data and show an error message', async () => {
      response = {
        // We use a different product type here SOLELY to exercise a different clause in
        // getOrderType in the service.  It's otherwise unrelated to this test.
        data: Factory.build(
          'basket',
          {},
          { numProducts: 1, numErrorMessages: 1, productType: 'Enrollment Code' },
        ),
      };

      const mockApiClient = createBasketMockApiClient(response, { throws: true });
      configureApiService(configuration, mockApiClient);

      try {
        await runSaga(sagaOptions, handleFetchBasket).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      const message = response.data.messages[0];

      expect(dispatched).toEqual([
        clearMessages(),
        addMessage(message.code, message.user_message, message.data, MESSAGE_TYPES.ERROR),
        basketDataReceived(transformResults(response.data)),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should show a fallback error message', async () => {
      response = {}; // no meaningful data

      const mockApiClient = createBasketMockApiClient(response, { throws: true });
      configureApiService(configuration, mockApiClient);

      try {
        await runSaga(sagaOptions, handleFetchBasket).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        clearMessages(),
        addMessage('fallback-error', null, {}, MESSAGE_TYPES.ERROR),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleAddCoupon', () => {
    it('should bail if the basket is processing', async () => {
      try {
        await runSaga(
          {
            getState: () => basketProcessingState,
            ...sagaOptions,
          },
          handleAddCoupon,
          { payload: { code: 'DEMO25' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([]);
      expect(caughtErrors).toEqual([]);
    });

    it('should update basket data', async () => {
      response = { data: Factory.build('basket', {}, { numProducts: 1 }) };

      const mockApiClient = createBasketMockApiClient(response);
      configureApiService(configuration, mockApiClient);

      try {
        await runSaga(
          {
            getState: () => basketNotProcessingState,
            ...sagaOptions,
          },
          handleAddCoupon,
          { payload: { code: 'DEMO25' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        addCoupon.request(),
        basketDataReceived(transformResults(response.data)),
        clearMessages(),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `${configuration.ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/`,
        { code: 'DEMO25' },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });
  });

  describe('handleRemoveCoupon', () => {
    it('should bail if the basket is processing', async () => {
      try {
        await runSaga(
          {
            getState: () => basketProcessingState,
            ...sagaOptions,
          },
          handleRemoveCoupon,
          { payload: { id: 'my_personal_coupon_id' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([]);
      expect(caughtErrors).toEqual([]);
    });

    it('should update basket data', async () => {
      response = { data: Factory.build('basket', {}, { numProducts: 1 }) };

      const mockApiClient = createBasketMockApiClient(response);
      configureApiService(configuration, mockApiClient);

      try {
        await runSaga(
          {
            getState: () => basketNotProcessingState,
            ...sagaOptions,
          },
          handleRemoveCoupon,
          { payload: { id: 'my_personal_coupon_id' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        removeCoupon.request(),
        basketDataReceived(transformResults(response.data)),
        clearMessages(),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
      expect(mockApiClient.delete).toHaveBeenCalledWith(`${configuration.ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/my_personal_coupon_id`);
    });
  });

  describe('handleUpdateQuantity', () => {
    it('should bail if the basket is processing', async () => {
      try {
        await runSaga(
          {
            getState: () => basketProcessingState,
            ...sagaOptions,
          },
          handleUpdateQuantity,
          { payload: 10 }, // payload is a quantity in this case
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([]);
      expect(caughtErrors).toEqual([]);
    });

    it('should update basket data', async () => {
      response = { data: Factory.build('basket', {}, { numProducts: 1 }) };

      const mockApiClient = createBasketMockApiClient(response);
      configureApiService(configuration, mockApiClient);

      try {
        await runSaga(
          {
            getState: () => basketNotProcessingState,
            ...sagaOptions,
          },
          handleUpdateQuantity,
          { payload: 10 }, // payload is a quantity in this case
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        updateQuantity.request(),
        basketDataReceived(transformResults(response.data)),
        clearMessages(),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `${configuration.ECOMMERCE_BASE_URL}/bff/payment/v0/quantity/`,
        { quantity: 10 },
      );
    });
  });

  describe('handleSubmitPayment', () => {
    it('should bail if the basket is processing', async () => {
      try {
        await runSaga(
          {
            getState: () => basketProcessingState,
            ...sagaOptions,
          },
          handleSubmitPayment,
          { payload: { method: 'cybersource', foo: 'bar' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([]);
      expect(caughtErrors).toEqual([]);
    });

    it('should successfully call cybersource checkout method', async () => {
      try {
        await runSaga(
          {
            getState: () => ({
              payment: {
                basket: {
                  foo: 'bar',
                  isBasketProcessing: false,
                },
              },
            }),
            ...sagaOptions,
          },
          handleSubmitPayment,
          { payload: { method: 'cybersource', meh: 'wut' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        submitPayment.request(),
        submitPayment.success(),
        submitPayment.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(cybersourceService.checkout).toHaveBeenCalledTimes(1);
      expect(cybersourceService.checkout).toHaveBeenCalledWith(
        {
          foo: 'bar',
          isBasketProcessing: false,
        },
        {
          meh: 'wut',
        },
      );
    });

    it('should bail on error handling if the error was aborted', async () => {
      const error = new Error();
      error.aborted = true;
      cybersourceService.checkout.mockImplementation(() => Promise.reject(error));

      try {
        await runSaga(
          {
            getState: () => ({
              payment: {
                basket: {
                  foo: 'bar',
                  isBasketProcessing: false,
                },
              },
            }),
            ...sagaOptions,
          },
          handleSubmitPayment,
          { payload: { method: 'cybersource', meh: 'wut' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        submitPayment.request(),
        submitPayment.fulfill(),
      ]);
    });

    it('should perform single-error error handling if error was not aborted', async () => {
      const error = new Error();
      error.aborted = false;
      error.code = 'uhoh';
      error.data = null;
      error.userMessage = null;
      error.messageType = 'error';
      cybersourceService.checkout.mockImplementation(() => Promise.reject(error));

      try {
        await runSaga(
          {
            getState: () => ({
              payment: {
                basket: {
                  foo: 'bar',
                  isBasketProcessing: false,
                },
              },
            }),
            ...sagaOptions,
          },
          handleSubmitPayment,
          { payload: { method: 'cybersource', meh: 'wut' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        submitPayment.request(),
        clearMessages(),
        addMessage('uhoh', null, null, 'error'),
        submitPayment.fulfill(),
      ]);
    });

    it('should perform single-error error handling and updating basket data if error was not aborted', async () => {
      const error = new Error();
      error.aborted = false;
      error.messages = [
        {
          code: 'ohboy',
          data: null,
          userMessage: null,
          messageType: 'error',
        },
      ];
      error.basket = {
        i: 'am',
        a: 'basket',
      };
      cybersourceService.checkout.mockImplementation(() => Promise.reject(error));

      try {
        await runSaga(
          {
            getState: () => ({
              payment: {
                basket: {
                  foo: 'bar',
                  isBasketProcessing: false,
                },
              },
            }),
            ...sagaOptions,
          },
          handleSubmitPayment,
          { payload: { method: 'cybersource', meh: 'wut' } },
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        submitPayment.request(),
        clearMessages(),
        addMessage('ohboy', null, null, 'error'),
        basketDataReceived({
          i: 'am',
          a: 'basket',
        }),
        submitPayment.fulfill(),
      ]);
    });
  });

  it('should pass actions to the correct sagas', () => {
    const gen = paymentSaga();

    expect(gen.next().value).toEqual(takeEvery(fetchBasket.TRIGGER, handleFetchBasket));
    expect(gen.next().value).toEqual(takeEvery(addCoupon.TRIGGER, handleAddCoupon));
    expect(gen.next().value).toEqual(takeEvery(removeCoupon.TRIGGER, handleRemoveCoupon));
    expect(gen.next().value).toEqual(takeEvery(updateQuantity.TRIGGER, handleUpdateQuantity));
    expect(gen.next().value).toEqual(takeEvery(submitPayment.TRIGGER, handleSubmitPayment));

    // If you find yourself adding something here, there are probably more tests to write!

    expect(gen.next().value).toBeUndefined();
  });
});
