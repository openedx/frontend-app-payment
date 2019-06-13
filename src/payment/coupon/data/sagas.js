import { call, put, takeEvery } from 'redux-saga/effects';
import {
  ADD_COUPON,
  addCouponBegin,
  addCouponSuccess,
  addCouponFailure,
  removeCouponBegin,
  removeCouponSuccess,
  removeCouponFailure,
  REMOVE_COUPON,
} from './actions';
import { postCoupon } from './service';

function* handleAddCoupon(action) {
  yield put(addCouponBegin());
  try {
    const result = yield call(postCoupon, action.payload.code);
    const { id: voucherId, code, benefit } = result.voucher;
    yield put(addCouponSuccess(voucherId, code, benefit));
  } catch (e) {
    yield put(addCouponFailure(e.message));
  }
}

function* handleRemoveCoupon(action) {
  yield put(removeCouponBegin());
  try {
    const result = yield call(postCoupon, action.payload.codel);
    yield put(removeCouponSuccess(result));
  } catch (e) {
    removeCouponFailure(e.message);
  }
}

export default function* saga() {
  yield takeEvery(ADD_COUPON.BASE, handleAddCoupon);
  yield takeEvery(REMOVE_COUPON.BASE, handleRemoveCoupon);
}
