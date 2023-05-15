import { all } from 'redux-saga/effects';
import { saga as paymentSaga } from '../payment';
import { saga as subscriptionSaga } from '../subscription';

export default function* rootSaga() {
  yield all([
    paymentSaga(),
    subscriptionSaga(),
  ]);
}
