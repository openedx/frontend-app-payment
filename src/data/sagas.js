import { all } from 'redux-saga/effects';
import { saga as paymentSaga } from '../payment';

export default function* rootSaga() {
  yield all([
    paymentSaga(),
  ]);
}
