import {
  takeLatest,
} from 'redux-saga/effects';

// details
import { fetchSubscriptionDetails, submitSubscription } from './details/actions';
import { handleFetchSubscriptionDetails, handleSubmitPayment } from './details/sagas';

export default function* saga() {
  yield takeLatest(submitSubscription.TRIGGER, handleSubmitPayment);
  yield takeLatest(fetchSubscriptionDetails.TRIGGER, handleFetchSubscriptionDetails);
}
