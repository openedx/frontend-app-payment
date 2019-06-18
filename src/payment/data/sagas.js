import { all, call, put, takeEvery } from 'redux-saga/effects';

// Actions
import {
  FETCH_BASKET,
  fetchBasketBegin,
  fetchBasketSuccess,
} from './actions';

// Services
import * as PaymentApiService from './service';

import { saga as couponSaga, addCouponSuccess, addCouponBegin } from '../coupon';

export function* handleFetchBasket() {
  yield put(fetchBasketBegin());
  yield put(addCouponBegin());
  const result = yield call(PaymentApiService.getBasket);
  yield put(fetchBasketSuccess(result));
  if (result.voucher === undefined) {
    yield put(addCouponSuccess(null, null, null));
  } else {
    yield put(addCouponSuccess(result.voucher.id, result.voucher.code, result.voucher.benefit));
  }
}

export default function* saga() {
  yield takeEvery(FETCH_BASKET.BASE, handleFetchBasket);
  yield all([
    couponSaga(),
  ]);
}
