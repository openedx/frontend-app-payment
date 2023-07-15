import {
  takeLatest,
} from 'redux-saga/effects';

// details
import { fetchSubscriptionDetails, submitSubscription } from './details/actions';
import { handleFetchSubscriptionDetails, handleSubmitSubscription } from './details/sagas';
import { sendSuccessful3DS } from './status/actions';
import { handleSuccessful3DS } from './status/sagas';

export default function* saga() {
  yield takeLatest(submitSubscription.TRIGGER, handleSubmitSubscription);
  yield takeLatest(fetchSubscriptionDetails.TRIGGER, handleFetchSubscriptionDetails);
  yield takeLatest(sendSuccessful3DS.TRIGGER, handleSuccessful3DS);
}
