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
    if (result.voucher === undefined) {
      yield put(addCouponSuccess(null, null, null));
    } else {
      yield put(addCouponSuccess(result.voucher.id, result.voucher.code, result.voucher.benefit));
    }
    const { id: voucherId, code, benefit } = result.voucher;
    yield put(addCouponSuccess(voucherId, code, benefit));
    yield put(addMessage('payment.coupon.added', null, {
      code,
    }, INFO));
  } catch (e) {
    yield put(addCouponFailure());
    yield call(handleErrors, e);
  }
}

export function* handleRemoveCoupon(action) {
  const code = yield select(state => state.payment.coupon.code);
  yield put(removeCouponBegin());
  try {
    const result = yield call(deleteCoupon, action.payload.voucherId);
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
