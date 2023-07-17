import {
  takeLatest,
} from 'redux-saga/effects';

// details
import {
  fetchSubscriptionDetails,
  submitSubscription,
} from './details/actions';
import {
  handleFetchSubscriptionDetails,
  handleSubmitSubscription,
} from './details/sagas';
import {
  handleSuccessful3DS,
  handleUnSuccessful3DS,
} from './status/actions';
import {
  successful3DS,
  unSuccessful3DS,
} from './status/sagas';

export default function* saga() {
  yield takeLatest(fetchSubscriptionDetails.TRIGGER, handleFetchSubscriptionDetails);
  yield takeLatest(submitSubscription.TRIGGER, handleSubmitSubscription);
  yield takeLatest(handleSuccessful3DS.TRIGGER, successful3DS);
  yield takeLatest(handleUnSuccessful3DS.TRIGGER, unSuccessful3DS);
}
