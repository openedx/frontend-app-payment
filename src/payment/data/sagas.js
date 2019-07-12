import { all, call, put, takeEvery } from 'redux-saga/effects';

// Actions
import {
  FETCH_BASKET,
  SDN_CHECK,
  fetchBasketBegin,
  fetchBasketSuccess,
  fetchBasketFailure,
} from './actions';

// Services
import * as PaymentApiService from './service';

import { saga as couponSaga, addCouponSuccess, addCouponBegin } from '../coupon';
import { handleErrors, handleMessages } from '../../feedback';
import { configuration } from '../../environment';

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

export function* handleSdnCheck(action) {
  try {
    const result = yield call(
      PaymentApiService.sdnCheck,
      ...action.payload,
    );

    if (result.hits > 0) {
      window.location.href = `${configuration.ECOMMERCE_BASE_URL}/payment/sdn/failure/`;
    }
  } catch (e) {
    yield call(handleErrors, e);
  }
}

export default function* saga() {
  yield takeEvery(FETCH_BASKET.BASE, handleFetchBasket);
  yield takeEvery(SDN_CHECK.BASE, handleSdnCheck);
  yield all([
    couponSaga(),
  ]);
}
