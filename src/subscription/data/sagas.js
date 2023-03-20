import {
  takeEvery,
} from 'redux-saga/effects';

// client-secret
import { fetchClientSecret } from './client-secret/actions';
import { handleFetchClientSecret } from './client-secret/sagas';
// details
import { fetchSubscriptionDetails, submitPayment } from './details/actions';
import { handleFetchSubscriptionDetails, handleSubmitPayment } from './details/sagas';

export default function* saga() {
  yield takeEvery(fetchClientSecret.TRIGGER, handleFetchClientSecret);
  yield takeEvery(fetchSubscriptionDetails.TRIGGER, handleFetchSubscriptionDetails);
  yield takeEvery(submitPayment.TRIGGER, handleSubmitPayment);
}
