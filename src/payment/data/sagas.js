import { all, call, put, takeEvery } from 'redux-saga/effects';

// Actions
import {
  FETCH_BASKET,
  fetchBasketBegin,
  fetchBasketSuccess,
} from './actions';

// Services
import * as PaymentApiService from './service';

import { saga as couponSaga } from '../coupon';


export function* handleFetchBasket() {
  yield put(fetchBasketBegin());
  const result = yield call(PaymentApiService.getBasket);
  yield put(fetchBasketSuccess(result));
}


export default function* saga() {
  yield takeEvery(FETCH_BASKET.BASE, handleFetchBasket);
  yield all([
    couponSaga(),
  ]);
}
