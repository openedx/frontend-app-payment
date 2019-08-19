import { call, put, takeEvery, select } from 'redux-saga/effects';

// Actions
import {
  basketDataReceived,
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

export const paymentMethods = {
  cybersource: checkoutCybersource,
  paypal: checkoutPaypal,
  'apple-pay': checkoutApplePay,
};

/**
 * Many of the handlers here have identical error handling, and are also all processing the same
 * sort of response object (a basket).  This helper is just here to dedupe that code, since its
 * all identical.
 */
export function* catchBasketError(handler) {
  try {
    yield call(handler);
  } catch (error) {
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(fetchBasket.fulfill());
  }
}

function* isBasketProcessing() {
  return yield select(state => state.payment.basket.isBasketProcessing);
}

export function* handleFetchBasket() {
  yield call(catchBasketError, function* processFetchBasket() {
    const result = yield call(PaymentApiService.getBasket);
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  });
}

export function* handleAddCoupon({ payload }) {
  if (yield isBasketProcessing()) return;

  yield call(catchBasketError, function* processFetchBasket() {
    yield put(addCoupon.request());
    const result = yield call(PaymentApiService.postCoupon, payload.code);
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  });
}

export function* handleRemoveCoupon({ payload }) {
  if (yield isBasketProcessing()) return;

  yield call(catchBasketError, function* processFetchBasket() {
    yield put(removeCoupon.request());
    const result = yield call(PaymentApiService.deleteCoupon, payload.id);
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  });
}

export function* handleUpdateQuantity({ payload }) {
  if (yield isBasketProcessing()) return;

  yield call(catchBasketError, function* processFetchBasket() {
    yield put(updateQuantity.request());
    const result = yield call(PaymentApiService.postQuantity, payload);
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  });
}

export function* handleSubmitPayment({ payload }) {
  if (yield isBasketProcessing()) return;

  const { method, ...paymentArgs } = payload;
  try {
    yield put(submitPayment.request());
    const paymentMethodCheckout = paymentMethods[method];
    const basket = yield select(state => ({ ...state.payment.basket }));
    yield call(paymentMethodCheckout, basket, paymentArgs);
    yield put(submitPayment.success());
  } catch (error) {
    // Do not handle errors on user aborted actions
    if (!error.aborted) {
      if (error.code) {
        // Client side generated errors are simple error objects and
        // here we wrap them into the same format as the api returns them in
        yield call(handleErrors, { messages: [error] }, true);
      } else {
        yield call(handleErrors, error, true);
      }
      if (error.basket) {
        yield put(basketDataReceived(error.basket));
      }
    }
  } finally {
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
