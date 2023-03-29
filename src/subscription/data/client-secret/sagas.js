import {
  call, put, select,
} from 'redux-saga/effects';

// Actions
import {
  clientSecretDataReceived,
  clientSecretProcessing,
  fetchSubscriptionClientSecret,
} from './actions';

// Sagas
import { handleErrors } from '../../../feedback';

// Services
import * as SubscriptionApiService from '../service';

function* isClientSecretProcessing() {
  return yield select(state => state.subscription.clientSecret.isClientSecretProcessing);
}

/**
 * Redux saga for getting the client secret key for a Stripe payment
 */
export function* handleFetchClientSecret() {
  if (yield isClientSecretProcessing()) {
    return;
  }

  try {
    yield put(clientSecretProcessing(true));
    // TODO: possibly add status for stripe elements loading?
    const result = yield call(SubscriptionApiService.getClientSecret);
    yield put(clientSecretDataReceived(result));
  } catch (error) {
    yield call(handleErrors, error, true);
  } finally {
    yield put(clientSecretProcessing(false));
    yield put(fetchSubscriptionClientSecret.fulfill());
  }
}

export default handleFetchClientSecret;
