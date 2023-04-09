import {
  takeLatest,
} from 'redux-saga/effects';

// details
import { fetchSubscriptionDetails, submitPayment } from './details/actions';
import { handleFetchSubscriptionDetails, handleSubmitPayment } from './details/sagas';

export default function* saga() {
  yield takeLatest(submitPayment.TRIGGER, handleSubmitPayment);
  yield takeLatest(fetchSubscriptionDetails.TRIGGER, handleFetchSubscriptionDetails);
}
