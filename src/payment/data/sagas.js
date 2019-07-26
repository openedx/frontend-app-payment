import { all, call, put, takeEvery } from 'redux-saga/effects';

// Actions
import {
  basketDataReceived,
  fetchBasket,
  addCoupon,
  removeCoupon,
  updateQuantity,
} from './actions';

// Services
import * as PaymentApiService from './service';

import { saga as cybersourceSaga } from '../cybersource';
import { saga as payPalSaga } from '../paypal';
import { handleErrors, handleMessages } from '../../feedback';

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

export function* handleUpdateEnrollmentCodeQuantity({ payload }) {
  try {
    yield put(updateQuantity.request());
    const result = yield call(PaymentApiService.postQuantity, payload.quantity);
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

export default function* saga() {
  yield takeEvery(fetchBasket.TRIGGER, handleFetchBasket);
  yield takeEvery(addCoupon.TRIGGER, handleAddCoupon);
  yield takeEvery(removeCoupon.TRIGGER, handleRemoveCoupon);
  yield takeEvery(updateQuantity.TRIGGER, handleUpdateEnrollmentCodeQuantity);

  yield all([
    cybersourceSaga(),
    payPalSaga(),
  ]);
}
