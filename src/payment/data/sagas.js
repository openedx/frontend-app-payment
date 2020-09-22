import {
  call, put, takeEvery, select, delay,
} from 'redux-saga/effects';
import { stopSubmit } from 'redux-form';
import { camelCaseObject, convertKeyNames, isWaffleFlagEnabled } from './utils';
import { MESSAGE_TYPES } from '../../feedback/data/constants';

// Actions
import {
  basketDataReceived,
  basketProcessing,
  captureKeyDataReceived,
  captureKeyProcessing,
  CAPTURE_KEY_START_TIMEOUT,
  captureKeyStartTimeout,
  microformStatus,
  fetchBasket,
  addCoupon,
  removeCoupon,
  updateQuantity,
  submitPayment,
  fetchCaptureKey,
} from './actions';

import { DEFAULT_STATUS } from '../checkout/payment-form/flex-microform/constants'

// Sagas
import { handleErrors, handleMessages, clearMessages } from '../../feedback';

// Services
import * as PaymentApiService from './service';
import { checkout as checkoutCybersource, checkoutWithToken } from '../payment-methods/cybersource';
import { checkout as checkoutPaypal } from '../payment-methods/paypal';
import { checkout as checkoutApplePay } from '../payment-methods/apple-pay';

export const paymentMethods = {
  cybersource: checkoutCybersource,
  paypal: checkoutPaypal,
  'apple-pay': checkoutApplePay,
};

function* isBasketProcessing() {
  return yield select(state => state.payment.basket.isBasketProcessing);
}

function* isCaptureKeyProcessing() {
  return yield select(state => state.payment.captureKey.isCaptureKeyProcessing);
}

export function* handleReduxFormValidationErrors(error) {
  // error.fieldErrors is an array, and the fieldName key in it is snake case.
  // We need to convert this into an object with snakeCase keys and values that are the
  // userMessages.
  if (error.fieldErrors) {
    let fieldErrors = {};
    // Turn the error objects into key-value pairs on our new fieldErrors object.
    error.fieldErrors.forEach((fieldError) => {
      fieldErrors[fieldError.fieldName] = fieldError.userMessage;
    });

    // Modify the key names to be what the UI needs and then camelCase the whole thing.
    fieldErrors = camelCaseObject(convertKeyNames(fieldErrors, {
      address_line1: 'address',
      address_line2: 'unit',
    }));

    yield put(stopSubmit('payment', fieldErrors));
  }
}
export function* handleDiscountCheck() {
  const basket = yield select(state => state.payment.basket);
  if (basket.products.length === 1) {
    const [product] = basket.products;
    const { courseKey } = product;
    if (product.productType === 'Seat') {
      const discount = yield call(
        PaymentApiService.getDiscountData,
        courseKey,
      );
      if (discount.discount_applicable) {
        const result = yield call(
          PaymentApiService.getBasket,
          discount.jwt,
        );
        result.discountJwt = discount.jwt;
        yield put(basketDataReceived(result));
        yield call(handleMessages, result.messages, false, window.location.search);
      }
    }
  }
}

export function* handleFetchBasket() {
  if (yield isBasketProcessing()) {
    // Do nothing if there is a request currently in flight to get or modify the basket
    return;
  }

  try {
    yield put(basketProcessing(true)); // we are going to modify the basket, don't make changes
    const result = yield call(PaymentApiService.getBasket);
    yield put(basketDataReceived(result)); // update redux store with basket data
    yield call(handleMessages, result.messages, true, window.location.search);
    yield call(handleDiscountCheck); // check if a discount should be added to the basket
  } catch (error) {
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket)); // update redux store with basket data
      yield call(handleDiscountCheck); // check if a discount should be added to the basket
    }
  } finally {
    yield put(basketProcessing(false)); // we are done modifying the basket
    yield put(fetchBasket.fulfill()); // mark the basket as finished loading
  }
}

export function* handleCaptureKeyTimeout() {
  try {
    // Start at the 12min mark to leave 1 min of buffer on the 15min timeout
    yield delay(12 * 60 * 1000);  // BJH: commented out to shorten testing
    yield call(
      handleMessages,
      [{
        code: '2mins',
        userMessage: 'Please complete your purchase within two minutes',
        messageType: MESSAGE_TYPES.INFO,
      }],
      true, // Clear other messages
      window.location.search,
    );

    yield delay(1 * 60 * 1000);
    yield call(
      handleMessages,
      [{
        code: '1mins',
        userMessage: 'Please complete your purchase within one minute',
        messageType: MESSAGE_TYPES.INFO,
      }],
      true, // Clear other messages
      window.location.search,
    );

    yield delay(1 * 60 * 1000);
    yield put(clearMessages());
    yield put(fetchCaptureKey());
  } catch (error) {
    // TODO: how should errors here be handled?
  }
}

export function* handleFetchCaptureKey() {
  if (yield isCaptureKeyProcessing()) {
    // Do nothing if there is a request currently in flight
    return;
  }

  try {
    yield put(captureKeyProcessing(true)); // we are waiting for a capture key
    yield put(microformStatus(DEFAULT_STATUS)); // we are refreshing the capture key
    const result = yield call(PaymentApiService.getCaptureKey);
    yield put(captureKeyDataReceived(result)); // update redux store with capture key data
    yield put(captureKeyStartTimeout());
  } catch (error) {
    // TODO: how should errors here be handled?
  } finally {
    yield put(captureKeyProcessing(false)); // we are done capture key
    yield put(fetchCaptureKey.fulfill()); // mark the capture key as finished loading
  }
}

/**
 * Many of the handlers here have identical error handling, and are also all processing the same
 * sort of response object (a basket).  This helper is just here to dedupe that code, since its
 * all identical.
 */
export function* performBasketOperation(operation, ...operationArgs) {
  if (yield isBasketProcessing()) {
    return;
  }

  try {
    yield put(basketProcessing(true));
    const result = yield call(operation, ...operationArgs);
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true, window.location.search);
  } catch (error) {
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(basketProcessing(false));
  }
}

export function* handleAddCoupon({ payload }) {
  yield call(performBasketOperation, PaymentApiService.postCoupon, payload.code);
}

export function* handleRemoveCoupon({ payload }) {
  yield call(performBasketOperation, PaymentApiService.deleteCoupon, payload.id);
}

export function* handleUpdateQuantity({ payload }) {
  yield call(performBasketOperation, PaymentApiService.postQuantity, payload);
}

export function* handleSubmitPayment({ payload }) {
  if (yield isBasketProcessing()) {
    return;
  }

  const { method, ...paymentArgs } = payload;
  try {
    yield put(basketProcessing(true));
    yield put(clearMessages()); // Don't leave messages floating on the page after clicking submit
    yield put(submitPayment.request());
    let paymentMethodCheckout = paymentMethods[method];
    if (method === 'cybersource' && isWaffleFlagEnabled('payment.cybersource.flex_microform_enabled', false)) {
      paymentMethodCheckout = checkoutWithToken;
    }
    const basket = yield select(state => ({ ...state.payment.basket }));
    yield call(paymentMethodCheckout, basket, paymentArgs);
    yield put(submitPayment.success());
  } catch (error) {
    // Do not handle errors on user aborted actions
    if (!error.aborted) {
      // Client side generated errors are simple error objects.  If we have one, wrap it in the
      // same format the API uses.
      if (error.code) {
        yield call(handleErrors, { messages: [error] }, true);
      } else {
        yield call(handleErrors, error, true);
        yield call(handleReduxFormValidationErrors, error);
      }

      if (error.basket) {
        yield put(basketDataReceived(error.basket));
        yield call(handleDiscountCheck);
      }
    }
  } finally {
    yield put(basketProcessing(false));
    yield put(submitPayment.fulfill());
  }
}

export default function* saga() {
  yield takeEvery(fetchCaptureKey.TRIGGER, handleFetchCaptureKey);
  yield takeEvery(CAPTURE_KEY_START_TIMEOUT, handleCaptureKeyTimeout);
  yield takeEvery(fetchBasket.TRIGGER, handleFetchBasket);
  yield takeEvery(addCoupon.TRIGGER, handleAddCoupon);
  yield takeEvery(removeCoupon.TRIGGER, handleRemoveCoupon);
  yield takeEvery(updateQuantity.TRIGGER, handleUpdateQuantity);
  yield takeEvery(submitPayment.TRIGGER, handleSubmitPayment);
}
