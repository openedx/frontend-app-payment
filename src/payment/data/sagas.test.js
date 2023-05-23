import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { runSaga } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';
import { stopSubmit } from 'redux-form';
import { Factory } from 'rosie';
import paymentSaga, {
  handleFetchBasket,
  handleSubmitPayment,
  handleUpdateQuantity,
  handleRemoveCoupon,
  handleAddCoupon,
  handleFetchCaptureKey,
  handleCaptureKeyTimeout,
  handleFetchClientSecret,
} from './sagas';
import { transformResults } from './utils';
import {
  basketDataReceived,
  basketProcessing,
  fetchBasket,
  fetchCaptureKey,
  addCoupon,
  removeCoupon,
  updateQuantity,
  submitPayment,
  CAPTURE_KEY_START_TIMEOUT,
  fetchClientSecret,
} from './actions';
import { clearMessages, MESSAGE_TYPES, addMessage } from '../../feedback';

import '../__factories__/basket.factory';

import * as cybersourceService from '../payment-methods/cybersource';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/logging');
jest.mock('../payment-methods/cybersource', () => ({
  checkoutWithToken: jest.fn(),
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const BASKET_API_ENDPOINT = `${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/payment/`;
const DISCOUNT_API_ENDPOINT = `${getConfig().LMS_BASE_URL}/api/discounts/course/`;
const COUPON_API_ENDPOINT = `${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/vouchers/`;
const QUANTITY_API_ENDPOINT = `${getConfig().ECOMMERCE_BASE_URL}/bff/payment/v0/quantity/`;

axiosMock.reset();
axiosMock.onAny().reply(200);

describe('saga tests', () => {
  let dispatched;
  let caughtErrors;
  let sagaOptions;
  let basketProcessingState;
  let basketNotProcessingState;
  let courseKey;

  beforeEach(() => {
    dispatched = [];
    caughtErrors = [];
    axiosMock.reset();

    // Used to reset the dispatch and onError handlers for runSaga.
    sagaOptions = {
      dispatch: action => dispatched.push(action),
      onError: err => caughtErrors.push(err),
    };

    courseKey = 'test';
    basketProcessingState = { payment: { basket: { isBasketProcessing: true } } };
    basketNotProcessingState = {
      payment: { basket: { isBasketProcessing: false, products: [{ courseKey, productType: 'Seat' }] } },
    };
  });

  describe('handleFetchBasket', () => {
    it('should bail if the basket is processing', async () => {
      try {
        await runSaga(
          {
            getState: () => basketProcessingState,
            ...sagaOptions,
          },
          handleFetchBasket,
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([]);
      expect(caughtErrors).toEqual([]);
    });

    it('should update basket data', async () => {
      const basketResponseData = Factory.build(
        'basket',
        {
          // We include offers here solely to exercise some logic in transformResults.  It's
          // otherwise unrelated to this particular test.
          offers: [
            { provider: 'me', benefitValue: '12' },
            { provider: null, benefitValue: '15' },
          ],
        },
        // We use a different product type here SOLELY to exercise a different clause in
        // getOrderType in the service.  It's otherwise unrelated to this test.
        { numProducts: 1, productType: 'Seat' },
      );

      axiosMock.onGet(BASKET_API_ENDPOINT).reply(200, basketResponseData);
      axiosMock.onGet(`${DISCOUNT_API_ENDPOINT}${courseKey}`).reply(200, { discount_applicable: true });

      try {
        await runSaga({
          getState: () => basketNotProcessingState,
          ...sagaOptions,
        }, handleFetchBasket).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        basketProcessing(true),
        basketDataReceived(transformResults(basketResponseData)),
        clearMessages(),
        basketDataReceived(transformResults(basketResponseData)),
        basketProcessing(false),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.get.length).toBe(3);
      expect(axiosMock.history.get[0].url).toEqual(BASKET_API_ENDPOINT);
      expect(axiosMock.history.get[1].url).toMatch(`${DISCOUNT_API_ENDPOINT}${courseKey}`);
      expect(axiosMock.history.get[1].withCredentials).toBe(true);
      expect(axiosMock.history.get[2].url).toEqual(BASKET_API_ENDPOINT);
    });

    it('should update basket data with jwt on second call', async () => {
      const basketResponseData = Factory.build(
        'basket',
        {
          // We include offers here solely to exercise some logic in transformResults.  It's
          // otherwise unrelated to this particular test.
          offers: [
            { provider: 'me', benefitValue: '12' },
            { provider: null, benefitValue: '15' },
          ],
        },
        // We use a different product type here SOLELY to exercise a different clause in
        // getOrderType in the service.  It's otherwise unrelated to this test.
        { numProducts: 1, productType: 'Seat' },
      );
      const basketResponseData2 = {
        ...basketResponseData,
        discountJwt: 'i_am_a_jwt',
      };

      axiosMock.onGet(BASKET_API_ENDPOINT).reply(200, basketResponseData);
      axiosMock.onGet(`${DISCOUNT_API_ENDPOINT}${courseKey}`)
        .reply(200, { discount_applicable: true, jwt: 'i_am_a_jwt' });
      axiosMock.onGet(`${BASKET_API_ENDPOINT}?discount_jwt=i_am_a_jwt`)
        .reply(200, basketResponseData2);

      try {
        await runSaga({
          getState: () => basketNotProcessingState,
          ...sagaOptions,
        }, handleFetchBasket).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        basketProcessing(true),
        basketDataReceived(transformResults(basketResponseData)),
        clearMessages(),
        basketDataReceived(transformResults(basketResponseData2)),
        basketProcessing(false),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);

      expect(axiosMock.history.get.length).toBe(3);
      expect(axiosMock.history.get[0].url).toEqual(BASKET_API_ENDPOINT);
      expect(axiosMock.history.get[1].url).toMatch(`${DISCOUNT_API_ENDPOINT}${courseKey}`);
      expect(axiosMock.history.get[1].withCredentials).toBe(true);
      expect(axiosMock.history.get[2].url).toEqual(`${BASKET_API_ENDPOINT}?discount_jwt=i_am_a_jwt`);
    });

    it('should update basket data without calling discount check API', async () => {
      const basketResponseData = Factory.build('basket'); // No products!

      axiosMock.onGet(BASKET_API_ENDPOINT).reply(200, basketResponseData);
      axiosMock.onGet(`${DISCOUNT_API_ENDPOINT}${courseKey}`)
        .reply(200, { discount_applicable: true });

      try {
        await runSaga(
          {
            getState: () => ({
              // No products in store either
              payment: { basket: { isBasketProcessing: false, products: [] } },
            }),
            ...sagaOptions,
          },
          handleFetchBasket,
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        basketProcessing(true),
        basketDataReceived(transformResults(basketResponseData)),
        clearMessages(),
        basketProcessing(false),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);

      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toEqual(BASKET_API_ENDPOINT);
    });

    it('should update basket data and show an info message', async () => {
      const basketResponseData = Factory.build('basket', {}, { numProducts: 1, numInfoMessages: 1 });

      axiosMock.onGet(BASKET_API_ENDPOINT).reply(200, basketResponseData);
      axiosMock.onGet(`${DISCOUNT_API_ENDPOINT}${courseKey}`)
        .reply(200, { discount_applicable: false });

      try {
        await runSaga(
          {
            getState: () => basketNotProcessingState,
            ...sagaOptions,
          },
          handleFetchBasket,
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      const message = basketResponseData.messages[0];

      expect(dispatched).toEqual([
        basketProcessing(true),
        basketDataReceived(transformResults(basketResponseData)),
        clearMessages(),
        addMessage(message.code, null, message.data, MESSAGE_TYPES.INFO),
        basketProcessing(false),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.get.length).toBe(2);
    });

    it('should update basket data and show an error message', async () => {
      const basketResponseData = Factory.build(
        'basket',
        {},
        { numProducts: 1, numErrorMessages: 1 },
      );

      axiosMock.onGet(BASKET_API_ENDPOINT).replyOnce(403, basketResponseData);
      axiosMock.onGet(`${DISCOUNT_API_ENDPOINT}${courseKey}`)
        .reply(200, { discount_applicable: true });
      axiosMock.onGet(BASKET_API_ENDPOINT).replyOnce(200, basketResponseData);

      try {
        await runSaga(
          {
            getState: () => basketNotProcessingState,
            ...sagaOptions,
          },
          handleFetchBasket,
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      const message = basketResponseData.messages[0];
      expect(dispatched).toEqual([
        basketProcessing(true),
        clearMessages(),
        addMessage(message.code, message.user_message, message.data, MESSAGE_TYPES.ERROR),
        basketDataReceived(transformResults(basketResponseData)),
        basketDataReceived(transformResults(basketResponseData)),
        addMessage(message.code, message.user_message, message.data, MESSAGE_TYPES.ERROR),
        basketProcessing(false),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.get.length).toBe(3);
    });

    it('should show a fallback error message', async () => {
      axiosMock.onGet(BASKET_API_ENDPOINT).reply(403);

      try {
        await runSaga(
          {
            getState: () => basketNotProcessingState,
            ...sagaOptions,
          },
          handleFetchBasket,
        ).toPromise();
      } catch (e) {} // eslint-disable-line no-empty

      expect(dispatched).toEqual([
        basketProcessing(true),
        clearMessages(),
        addMessage('fallback-error', null, {}, MESSAGE_TYPES.ERROR),
        basketProcessing(false),
        fetchBasket.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.get.length).toBe(1);
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
      const basketResponseData = Factory.build('basket', {}, { numProducts: 1 });

      axiosMock.onPost(COUPON_API_ENDPOINT).replyOnce(200, basketResponseData);

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
        basketProcessing(true),
        basketDataReceived(transformResults(basketResponseData)),
        clearMessages(),
        basketProcessing(false),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(COUPON_API_ENDPOINT);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ code: 'DEMO25' }));
    });

    it('should update basket data and show an error message', async () => {
      const basketResponseData = Factory.build('basket', {}, { numProducts: 1, numErrorMessages: 1 });

      axiosMock.onPost(COUPON_API_ENDPOINT).replyOnce(403, basketResponseData);

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

      const message = basketResponseData.messages[0];

      expect(dispatched).toEqual([
        basketProcessing(true),
        clearMessages(),
        addMessage(message.code, message.user_message, message.data, MESSAGE_TYPES.ERROR),
        basketDataReceived(transformResults(basketResponseData)),
        basketProcessing(false),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(COUPON_API_ENDPOINT);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ code: 'DEMO25' }));
    });

    it('should show a fallback error message', async () => {
      axiosMock.onPost(COUPON_API_ENDPOINT).replyOnce(500);

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
        basketProcessing(true),
        clearMessages(),
        addMessage('fallback-error', null, {}, MESSAGE_TYPES.ERROR),
        basketProcessing(false),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.post.length).toBe(1);
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
      const basketResponseData = Factory.build('basket', {}, { numProducts: 1 });

      axiosMock.onDelete(`${COUPON_API_ENDPOINT}my_personal_coupon_id`).replyOnce(200, basketResponseData);

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
        basketProcessing(true),
        basketDataReceived(transformResults(basketResponseData)),
        clearMessages(),
        basketProcessing(false),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.delete.length).toBe(1);
      expect(axiosMock.history.delete[0].url).toBe(`${COUPON_API_ENDPOINT}my_personal_coupon_id`);
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
      const basketResponseData = Factory.build('basket', {}, { numProducts: 1 });

      axiosMock.onPost(QUANTITY_API_ENDPOINT).replyOnce(200, basketResponseData);

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
        basketProcessing(true),
        basketDataReceived(transformResults(basketResponseData)),
        clearMessages(),
        basketProcessing(false),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(QUANTITY_API_ENDPOINT);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ quantity: 10 }));
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
        basketProcessing(true),
        clearMessages(),
        submitPayment.request(),
        submitPayment.success(),
        basketProcessing(false),
        submitPayment.fulfill(),
      ]);
      expect(caughtErrors).toEqual([]);
      expect(cybersourceService.checkoutWithToken).toHaveBeenCalledTimes(1);
      expect(cybersourceService.checkoutWithToken).toHaveBeenCalledWith(
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
      cybersourceService.checkoutWithToken.mockImplementation(() => Promise.reject(error));

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
        basketProcessing(true),
        clearMessages(),
        submitPayment.request(),
        basketProcessing(false),
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
      cybersourceService.checkoutWithToken.mockImplementation(() => Promise.reject(error));

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
        basketProcessing(true),
        clearMessages(),
        submitPayment.request(),
        clearMessages(),
        addMessage('uhoh', null, null, 'error'),
        basketProcessing(false),
        submitPayment.fulfill(),
      ]);
    });

    it('should perform error handling and updating basket data if error was not aborted', async () => {
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
      cybersourceService.checkoutWithToken.mockImplementation(() => Promise.reject(error));

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
        basketProcessing(true),
        clearMessages(),
        submitPayment.request(),
        clearMessages(),
        addMessage('ohboy', null, null, 'error'),
        basketDataReceived({
          i: 'am',
          a: 'basket',
        }),
        basketProcessing(false),
        submitPayment.fulfill(),
      ]);
    });
  });

  it('should perform error handling for field errors', async () => {
    const error = new Error();
    error.aborted = false;
    error.fieldErrors = [
      {
        code: null,
        data: null,
        userMessage: 'This is a field error!',
        fieldName: 'field1',
      },
    ];
    error.basket = {
      i: 'am',
      a: 'basket',
    };
    cybersourceService.checkoutWithToken.mockImplementation(() => Promise.reject(error));

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
      basketProcessing(true),
      clearMessages(),
      submitPayment.request(),
      clearMessages(),
      stopSubmit('payment', {
        field1: 'This is a field error!',
      }),
      basketDataReceived({
        i: 'am',
        a: 'basket',
      }),
      basketProcessing(false),
      submitPayment.fulfill(),
    ]);
  });

  it('should pass actions to the correct sagas', () => {
    const gen = paymentSaga();

    expect(gen.next().value).toEqual(takeEvery(fetchCaptureKey.TRIGGER, handleFetchCaptureKey));
    expect(gen.next().value).toEqual(takeEvery(CAPTURE_KEY_START_TIMEOUT, handleCaptureKeyTimeout));
    expect(gen.next().value).toEqual(takeEvery(fetchClientSecret.TRIGGER, handleFetchClientSecret));
    expect(gen.next().value).toEqual(takeEvery(fetchBasket.TRIGGER, handleFetchBasket));
    expect(gen.next().value).toEqual(takeEvery(addCoupon.TRIGGER, handleAddCoupon));
    expect(gen.next().value).toEqual(takeEvery(removeCoupon.TRIGGER, handleRemoveCoupon));
    expect(gen.next().value).toEqual(takeEvery(updateQuantity.TRIGGER, handleUpdateQuantity));
    expect(gen.next().value).toEqual(takeEvery(submitPayment.TRIGGER, handleSubmitPayment));

    // If you find yourself adding something here, there are probably more tests to write!

    expect(gen.next().value).toBeUndefined();
  });
});
