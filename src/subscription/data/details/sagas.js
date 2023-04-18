import {
  call, put, select,
} from 'redux-saga/effects';
import { stopSubmit } from 'redux-form';
import { getReduxFormValidationErrors } from '../../../payment/data/utils';

// Actions
import {
  subscriptionDetailsReceived,
  subscriptionDetailsProcessing,
  fetchSubscriptionDetails,
  submitPayment,
} from './actions';

// Sagas
import { handleSubscriptionErrors, handleMessages, clearMessages } from '../../../feedback';

// Services
import * as SubscriptionApiService from '../service';
import { subscriptionStripeCheckout } from '../../subscription-methods';

export const paymentMethods = {
  stripe: subscriptionStripeCheckout,
};

function* isSubscriptionDetailsProcessing() {
  return yield select(state => state.subscription.details.isSubscriptionDetailsProcessing);
}

export function* handleReduxFormValidationErrors(error) {
  if (error.fieldErrors) {
    const fieldErrors = getReduxFormValidationErrors(error);
    yield put(stopSubmit('payment', fieldErrors));
  }
}

export function* handleFetchSubscriptionDetails() {
  if (yield isSubscriptionDetailsProcessing()) {
    // Do nothing if there is a request currently in flight to get or modify the details
    return;
  }

  try {
    yield put(subscriptionDetailsProcessing(true)); // we are going to modify the details, don't make changes
    const result = yield call(SubscriptionApiService.getDetails);
    yield put(subscriptionDetailsReceived(result)); // update redux store with details data
    yield call(handleMessages, result.messages, true, window.location.search);
  } catch (error) {
    yield call(handleSubscriptionErrors, error, true);
    if (error.details) {
      yield put(subscriptionDetailsReceived(error.details)); // update redux store with details data
    }
  } finally {
    yield put(subscriptionDetailsProcessing(false)); // we are done modifying the details
    yield put(fetchSubscriptionDetails.fulfill()); // mark the details as finished loading
  }
}

/**
 * Many of the handlers here have identical error handling, and are also all processing the same
 * sort of response object (a details).  This helper is just here to dedupe that code, since its
 * all identical.
 */
export function* performSubscriptionDetailsOperation(operation, ...operationArgs) {
  if (yield isSubscriptionDetailsProcessing()) {
    return;
  }

  try {
    yield put(subscriptionDetailsProcessing(true));
    const result = yield call(operation, ...operationArgs);
    yield put(subscriptionDetailsReceived(result));
    yield call(handleMessages, result.messages, true, window.location.search);
  } catch (error) {
    // TODO: implement submitSubscriptionPayment errors with handleSubscriptionErrors
    yield call(handleSubscriptionErrors, error, true);
    if (error.details) {
      yield put(subscriptionDetailsReceived(error.details));
    }
  } finally {
    yield put(subscriptionDetailsProcessing(false));
  }
}

export function* handleSubmitPayment({ payload }) {
  if (yield isSubscriptionDetailsProcessing()) {
    return;
  }

  const { method, ...paymentArgs } = payload;
  try {
    yield put(subscriptionDetailsProcessing(true));
    yield put(clearMessages()); // Don't leave messages floating on the page after clicking submit
    yield put(submitPayment.request());
    const paymentMethodCheckout = paymentMethods[method];
    const details = yield select(state => ({ ...state.subscription.details }));
    yield call(paymentMethodCheckout, details, paymentArgs);
    yield put(submitPayment.success());
  } catch (error) {
    // Do not handle errors on user aborted actions
    if (!error.aborted) {
      // Client side generated errors are simple error objects.  If we have one, wrap it in the
      // same format the API uses.
      // TODO: implement submitSubscriptionPayment errors with handleSubscriptionErrors
      if (error.code) {
        yield call(handleSubscriptionErrors, { messages: [error] }, true);
      } else {
        yield call(handleSubscriptionErrors, error, true);
        yield call(handleReduxFormValidationErrors, error);
      }

      if (error.details) {
        yield put(subscriptionDetailsReceived(error.details));
      }
    }
  } finally {
    yield put(subscriptionDetailsProcessing(false));
    yield put(submitPayment.fulfill());
  }
}

export default handleSubmitPayment;
