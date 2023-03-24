import {
  takeLatest,
} from 'redux-saga/effects';

// client-secret
import { fetchSubscriptionClientSecret } from './client-secret/actions';
import { handleFetchClientSecret } from './client-secret/sagas';
// details
import { fetchSubscriptionDetails, submitPayment } from './details/actions';
import { handleFetchSubscriptionDetails, handleSubmitPayment } from './details/sagas';

export default function* saga() {
  yield takeLatest(submitPayment.TRIGGER, handleSubmitPayment);
  yield takeLatest(fetchSubscriptionDetails.TRIGGER, handleFetchSubscriptionDetails);
  yield takeLatest(fetchSubscriptionClientSecret.TRIGGER, handleFetchClientSecret);
}
