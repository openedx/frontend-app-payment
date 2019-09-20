import { call, put, takeEvery, select } from 'redux-saga/effects';
import { stopSubmit } from 'redux-form';
import { utils } from '../../common';

// Actions
import {
  basketDataReceived,
  basketProcessing,
  fetchBasket,
  addCoupon,
  removeCoupon,
  updateQuantity,
  submitPayment,
} from './actions';

// Sagas
import { handleErrors, handleMessages } from '../../feedback';

// Services
import * as PaymentApiService from './service';
import { checkout as checkoutCybersource } from '../payment-methods/cybersource';
import { checkout as checkoutPaypal } from '../payment-methods/paypal';
import { checkout as checkoutApplePay } from '../payment-methods/apple-pay';

const { camelCaseObject, convertKeyNames } = utils;

export const paymentMethods = {
  cybersource: checkoutCybersource,
  paypal: checkoutPaypal,
  'apple-pay': checkoutApplePay,
};

function* isBasketProcessing() {
  return yield select(state => state.payment.basket.isBasketProcessing);
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
        yield call(handleMessages, result.messages, false);
      }
    }
  }
}

export function* handleFetchBasket() {
  if (yield isBasketProcessing()) {
    return;
  }

  try {
    yield put(basketProcessing(true));
    const result = yield call(PaymentApiService.getBasket);
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
    yield call(handleDiscountCheck);
  } catch (error) {
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(basketProcessing(false));
    yield put(fetchBasket.fulfill());
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
    yield call(handleMessages, result.messages, true);
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
    yield put(submitPayment.request());
    const paymentMethodCheckout = paymentMethods[method];
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
      }
    }
  } finally {
    yield put(basketProcessing(false));
    yield put(submitPayment.fulfill());
  }
}

export default function* saga() {
  yield takeEvery(fetchBasket.TRIGGER, handleFetchBasket);
  yield takeEvery(addCoupon.TRIGGER, handleAddCoupon);
  yield takeEvery(removeCoupon.TRIGGER, handleRemoveCoupon);
  yield takeEvery(updateQuantity.TRIGGER, handleUpdateQuantity);
  yield takeEvery(submitPayment.TRIGGER, handleSubmitPayment);
}
