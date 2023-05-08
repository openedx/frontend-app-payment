import {
  call, put, select,
} from 'redux-saga/effects';
import { stopSubmit } from 'redux-form';
import { logError } from '@edx/frontend-platform/logging';

import { getReduxFormValidationErrors } from '../../../payment/data/utils';

// Actions
import {
  subscriptionDetailsReceived,
  subscriptionDetailsProcessing,
  fetchSubscriptionDetails,
  submitSubscription,
} from './actions';

import { subscriptionStatusReceived } from '../status/actions';

// Sagas
import { handleSubscriptionErrors, clearMessages } from '../../../feedback';

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
    yield put(stopSubmit('subscription', fieldErrors));
  }
}

const handleCustomErrors = (error, fallbackKey) => {
  const apiErrors = [{
    code: fallbackKey ? 'fallback-error' : error.cause,
    userMessage: error.message,
  }];
  const err = new Error();
  err.errors = apiErrors;
  return err;
};

export function* handleFetchSubscriptionDetails() {
  if (yield isSubscriptionDetailsProcessing()) {
    // Do nothing if there is a request currently in flight to get or modify the details
    return;
  }

  try {
    yield put(subscriptionDetailsProcessing(true)); // we are going to modify the details, don't make changes
    const result = yield call(SubscriptionApiService.getDetails);
    if (result.trialEnd === null || result.trialEnd === undefined) {
      yield put(subscriptionDetailsReceived({
        ...result,
        errorCode: 'subscription_expired',
      })); // update redux store with details data
      throw handleCustomErrors(new Error('Subscription Expired', {
        cause: 'subscription_expired',
      }));
    }
    yield put(subscriptionDetailsReceived(result));
  } catch (error) {
    const errors = error?.errors || [];
    if (
      errors.length
      && errors[0].code === 'empty_subscription'
    ) {
      yield put(subscriptionDetailsReceived({ errorCode: 'empty_subscription' })); // update redux store with details data
    }
    yield call(handleSubscriptionErrors, error, true);
  } finally {
    yield put(subscriptionDetailsProcessing(false)); // we are done modifying the details
    yield put(fetchSubscriptionDetails.fulfill()); // mark the details as finished loading
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
    yield put(submitSubscription.request());
    const paymentMethodCheckout = paymentMethods[method];
    const details = yield select(state => ({ ...state.subscription.details }));
    const postData = yield call(paymentMethodCheckout, details, paymentArgs);
    const result = yield call(SubscriptionApiService.postDetails, postData);

    yield put(submitSubscription.success(result));
    yield put(subscriptionStatusReceived(result));
  } catch (error) {
    // Do not handle errors on user aborted actions
    if (!error.aborted) {
      if (error.message && error.cause === 'create-paymentMethod') { // stripe payment method creation error
        yield call(handleSubscriptionErrors, handleCustomErrors(error, 'fallback'), true);
      } else {
        logError(error, {
          messagePrefix: 'Stripe-Checkout Post Error',
          paymentMethod: 'Create Subscription',
          paymentErrorType: 'v1/stripe-checkout/ Error',
        });
        yield call(handleSubscriptionErrors, error, true);
      }
    }
    yield put(submitSubscription.failure());
  } finally {
    yield put(subscriptionDetailsProcessing(false));
  }
}

export default handleSubmitPayment;
