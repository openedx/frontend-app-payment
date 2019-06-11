import { call, put, takeEvery } from 'redux-saga/effects';
import { ADD_COUPON, addCouponBegin, addCouponSuccess, addCouponFailure, addCouponReset, removeCouponBegin, removeCouponSuccess, removeCouponFailure, removeCouponReset, REMOVE_COUPON } from './actions';
import { postCoupon } from './service';

function* handleAddCoupon(action) {
  yield put(addCouponBegin());
  try {
    const result = yield call(postCoupon, action.payload.code);
    const { code, id: voucherId } = result.voucher;
    yield put(addCouponSuccess(code, voucherId));
  } catch (e) {
    yield put(addCouponFailure(e.message));
    yield put(addCouponReset());
  }
}

function* handleRemoveCoupon(action) {
  yield put(removeCouponBegin());
  try {
    const result = yield call(postCoupon, action.payload.codel);
    yield put(removeCouponSuccess(result));
  } catch (e) {
    removeCouponFailure(e.message);
    removeCouponReset();
  }
}

export default function* saga() {
  yield takeEvery(ADD_COUPON.BASE, handleAddCoupon);
  yield takeEvery(REMOVE_COUPON.BASE, handleRemoveCoupon);
}
