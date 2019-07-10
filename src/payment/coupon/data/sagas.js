import { call, put, takeEvery, select } from 'redux-saga/effects';
import {
  ADD_COUPON,
  addCouponBegin,
  addCouponSuccess,
  removeCouponBegin,
  removeCouponSuccess,
  REMOVE_COUPON,
  addCouponFailure,
  removeCouponFailure,
} from './actions';
import { fetchBasketSuccess } from '../../data/actions';
import { deleteCoupon, postCoupon } from './service';

import {
  addMessage,
  handleErrors,
  INFO,
} from '../../../feedback';

export function* handleAddCoupon(action) {
  yield put(addCouponBegin());
  try {
    const result = yield call(postCoupon, action.payload.code);
    yield put(fetchBasketSuccess(result));
    if (result.coupons.length === 0) {
      yield put(addCouponSuccess(null, null, null));
    } else {
      yield put(addCouponSuccess(
        result.coupons[0].id,
        result.coupons[0].code,
        result.coupons[0].benefit_value,
      ));
      yield put(addMessage('payment.coupon.added', null, {
        code: result.coupons[0].code,
      }, INFO));
    }
  } catch (e) {
    yield put(addCouponFailure());
    yield call(handleErrors, e);
  }
}

export function* handleRemoveCoupon(action) {
  const code = yield select(state => state.payment.coupon.code);
  yield put(removeCouponBegin());
  try {
    const result = yield call(deleteCoupon, action.payload.id);
    yield put(fetchBasketSuccess(result));
    yield put(removeCouponSuccess(result));
    yield put(addMessage('payment.coupon.removed', null, {
      code,
    }, INFO));
  } catch (e) {
    yield put(removeCouponFailure());
    yield call(handleErrors, e);
  }
}

export default function* saga() {
  yield takeEvery(ADD_COUPON.BASE, handleAddCoupon);
  yield takeEvery(REMOVE_COUPON.BASE, handleRemoveCoupon);
}
