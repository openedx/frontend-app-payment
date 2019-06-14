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
    if (e.code !== undefined) {
      yield put(addCouponFailure(e.code));
    } else {
      throw e;
    }
  }
}

function* handleRemoveCoupon(action) {
  yield put(removeCouponBegin());
  try {
    const result = yield call(postCoupon, action.payload.codel);
    yield put(removeCouponSuccess(result));
  } catch (e) {
    if (e.code !== undefined) {
      removeCouponFailure(e.code);
    } else {
      throw e;
    }
  }
}

export default function* saga() {
  yield takeEvery(ADD_COUPON.BASE, handleAddCoupon);
  yield takeEvery(REMOVE_COUPON.BASE, handleRemoveCoupon);
}
