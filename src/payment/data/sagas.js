import { all, call, put, select, takeEvery } from 'redux-saga/effects';

// Actions
import {
  FETCH_BASKET,
  SUBMIT_PAYMENT,
  fetchBasketBegin,
  fetchBasketSuccess,
  fetchBasketFailure,
  submitPaymentBegin,
  submitPaymentFailure,
  checkoutSuccess,
} from './actions';

// Services
import * as PaymentApiService from './service';

import { basketSelector } from './selectors';

import { saga as couponSaga, addCouponSuccess, addCouponBegin } from '../coupon';
import { handleErrors } from '../../feedback';
import { configuration } from '../../environment';

export function* handleFetchBasket() {
  yield put(fetchBasketBegin());
  yield put(addCouponBegin());
  try {
    const result = yield call(PaymentApiService.getBasket);
    yield put(fetchBasketSuccess(result));
    if (result.coupons.length === 0) {
      yield put(addCouponSuccess(null, null, null));
    } else {
      yield put(addCouponSuccess(
        result.coupons[0].id,
        result.coupons[0].code,
        result.coupons[0].benefit_value,
      ));
    }
  } catch (e) {
    yield put(fetchBasketFailure());
    yield call(handleErrors, e);
  }
}

export function* handleSubmitPayment(action) {
  yield put(submitPaymentBegin());
  try {
    const sdnCheck = yield call(
      PaymentApiService.sdnCheck,
      action.payload.cardHolderInfo.firstName,
      action.payload.cardHolderInfo.lastName,
      action.payload.cardHolderInfo.city,
      action.payload.cardHolderInfo.country,
    );

    if (sdnCheck.hits > 0) {
      window.location.href = `${configuration.ECOMMERCE_BASE_URL}/payment/sdn/failure/`;
    }

    const basket = yield select(basketSelector);
    const checkout = yield call(
      PaymentApiService.checkout,
      basket.basketId,
      action.payload.cardHolderInfo,
    );

    yield put(checkoutSuccess(configuration.CYBERSOURCE_URL, checkout.form_fields));
  } catch (e) {
    yield put(submitPaymentFailure());
    yield call(handleErrors, e);
  }
}

export default function* saga() {
  yield takeEvery(FETCH_BASKET.BASE, handleFetchBasket);
  yield takeEvery(SUBMIT_PAYMENT.BASE, handleSubmitPayment);
  yield all([
    couponSaga(),
  ]);
}
