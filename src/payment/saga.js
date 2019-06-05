import { call, put, takeEvery } from 'redux-saga/effects';
// import { push } from 'connected-react-router';
import { logAPIErrorResponse } from '@edx/frontend-logging';

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
  try {
    yield put(fetchBasketBegin());
    const result = yield call(PaymentsApiService.getBasket);
    yield put(fetchBasketSuccess(result));
    yield put(fetchBasketReset());
  } catch (e) {
    logAPIErrorResponse(e);
    // TODO: Restore this once things are working better.
    // yield put(push('/error'));
  }
}


export default function* paymentsSaga() {
  yield takeEvery(FETCH_BASKET.BASE, handleFetchBasket);
}
