import { all, call, put, takeEvery } from 'redux-saga/effects';

// Actions
import {
  FETCH_BASKET,
  fetchBasketBegin,
  fetchBasketSuccess,
  fetchBasketFailure,
  UPDATE_QUANTITY,
  updateEnrollmentCodeQuantityBegin,
  updateEnrollmentCodeQuantitySuccess,
  updateEnrollmentCodeQuantityFailure,
} from './actions';

// Services
import * as PaymentApiService from './service';

import { saga as couponSaga, addCouponSuccess, addCouponBegin } from '../coupon';
import { saga as cybersourceSaga } from '../cybersource';
import { saga as payPalSaga } from '../paypal';
import { handleErrors, handleMessages } from '../../feedback';

export function* handleFetchBasket() {
  yield put(fetchBasketBegin());
  yield put(addCouponBegin());
  try {
    const result = yield call(PaymentApiService.getBasket);
    yield put(fetchBasketSuccess(result));
    yield call(handleMessages, result.messages);
    if (result.coupons.length === 0) {
      yield put(addCouponSuccess(null, null, null));
    } else {
      yield put(addCouponSuccess(
        result.coupons[0].id,
        result.coupons[0].code,
        result.coupons[0].benefitValue,
      ));
    }
  } catch (e) {
    yield put(fetchBasketFailure());
    yield call(handleErrors, e);
  }
}

export function* handleUpdateEnrollmentCodeQuantity({ payload }) {
  yield put(updateEnrollmentCodeQuantityBegin());
  try {
    const newQuantity = payload.quantity;
    const result = yield call(PaymentApiService.postQuantity, newQuantity);
    yield put(updateEnrollmentCodeQuantitySuccess());
    yield put(fetchBasketSuccess(result));
  } catch (e) {
    yield put(updateEnrollmentCodeQuantityFailure());
    yield call(handleErrors, e);
  }
}

export default function* saga() {
  yield takeEvery(FETCH_BASKET.BASE, handleFetchBasket);
  yield takeEvery(UPDATE_QUANTITY.BASE, handleUpdateEnrollmentCodeQuantity);

  yield all([
    couponSaga(),
    cybersourceSaga(),
    payPalSaga(),
  ]);
}
