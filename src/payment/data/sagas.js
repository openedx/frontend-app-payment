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

// Services
import * as PaymentApiService from './service';

import { checkout as checkoutCybersource } from '../payment-methods/cybersource';
import { checkout as checkoutPaypal } from '../payment-methods/paypal';
import { checkout as checkoutApplePay } from '../payment-methods/apple-pay';
import { handleErrors, handleMessages } from '../../feedback';

export const paymentMethods = {
  cybersource: checkoutCybersource,
  paypal: checkoutPaypal,
  'apple-pay': checkoutApplePay,
};

export function* handleFetchBasket() {
  try {
    yield put(fetchBasket.request());
    const result = yield call(PaymentApiService.getBasket);
    yield put(fetchBasket.success(result));
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  } catch (error) {
    yield put(fetchBasket.failure(error.message));
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(fetchBasket.fulfill());
  }
}

export function* handleAddCoupon({ payload }) {
  try {
    yield put(addCoupon.request());
    const result = yield call(PaymentApiService.postCoupon, payload.code);
    yield put(addCoupon.success(result));
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  } catch (error) {
    yield put(addCoupon.failure(error.message));
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(addCoupon.fulfill());
  }
}

export function* handleRemoveCoupon({ payload }) {
  try {
    yield put(removeCoupon.request());
    const result = yield call(PaymentApiService.deleteCoupon, payload.code);
    yield put(removeCoupon.success(result));
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  } catch (error) {
    yield put(removeCoupon.failure(error.message));
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(removeCoupon.fulfill());
  }
}

export function* handleUpdateQuantity({ payload }) {
  try {
    yield put(updateQuantity.request());
    const result = yield call(PaymentApiService.postQuantity, payload);
    yield put(updateQuantity.success(result));
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true);
  } catch (error) {
    yield put(updateQuantity.failure(error.message));
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(updateQuantity.fulfill());
  }
}

export function* handleSubmitPayment({ payload }) {
  const { method, ...paymentArgs } = payload;
  try {
    const paymentMethodCheckout = paymentMethods[method];
    const basket = yield select(state => ({ ...state.payment.basket }));
    yield put(submitPayment.request());
    const result = yield call(paymentMethodCheckout, basket, paymentArgs);
    yield put(submitPayment.success(result));
  } catch (error) {
    if (error.aborted === true) {
      // This an a user aborted action, do nothing
    } else {
      yield put(submitPayment.failure(error));
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
