import { call, put, takeEvery } from 'redux-saga/effects';

// Actions
import {
  FETCH_BASKET,
  fetchBasketBegin,
  fetchBasketSuccess,
  fetchBasketReset,
} from './actions';

// Services
import * as PaymentsApiService from './service';


export function* handleFetchBasket() {
  yield put(fetchBasketBegin());
  const result = yield call(PaymentsApiService.getBasket);
  yield put(fetchBasketSuccess(result));
  yield put(fetchBasketReset());
}


export default function* paymentsSaga() {
  yield takeEvery(FETCH_BASKET.BASE, handleFetchBasket);
}
