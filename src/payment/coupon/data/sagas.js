import { call, put, takeEvery } from 'redux-saga/effects';
import {
  ADD_COUPON,
  addCouponBegin,
  removeCouponBegin,
  removeCouponSuccess,
  REMOVE_COUPON,
  addCouponFailure,
  removeCouponFailure,
} from './actions';
import { handleBasketResult } from '../../data/sagas';
import { deleteCoupon, postCoupon } from './service';

import { handleErrors, handleMessages } from '../../../feedback';

export function* handleAddCoupon(action) {
  yield put(addCouponBegin());
  try {
    const result = yield call(postCoupon, action.payload.code);
    yield call(handleBasketResult, result);
    yield call(handleMessages, result.messages, true);
  } catch (e) {
    if (e.basketData) {
      yield call(handleBasketResult, e.basketData);
    }
    yield put(addCouponFailure());
    yield call(handleErrors, e, true);
  }
}

export function* handleRemoveCoupon(action) {
  yield put(removeCouponBegin());
  try {
    const result = yield call(deleteCoupon, action.payload.id);
    yield call(handleBasketResult, result);
    yield put(removeCouponSuccess(result));
    yield call(handleMessages, result.messages, true);
  } catch (e) {
    if (e.basketData) {
      yield call(handleBasketResult, e.basketData);
    }
    yield put(removeCouponFailure());
    yield call(handleErrors, e, true);
  }
}

export default function* saga() {
  yield takeEvery(ADD_COUPON.BASE, handleAddCoupon);
  yield takeEvery(REMOVE_COUPON.BASE, handleRemoveCoupon);
}
