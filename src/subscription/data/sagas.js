import {
  takeLatest,
} from 'redux-saga/effects';

// details
import { fetchSubscriptionDetails, submitSubscription } from './details/actions';
import { handleFetchSubscriptionDetails, handleSubmitSubscription } from './details/sagas';

export default function* saga() {
  yield takeLatest(submitSubscription.TRIGGER, handleSubmitSubscription);
  yield takeLatest(fetchSubscriptionDetails.TRIGGER, handleFetchSubscriptionDetails);
}
