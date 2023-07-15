import {
  call, put, select,
} from 'redux-saga/effects';

import { sendSubscriptionEvent, handleCustomErrors } from '../utils';

// Actions
import { subscriptionStatusReceived } from './actions';

// Sagas
import { handleSubscriptionErrors, clearMessages } from '../../../feedback';

// Services
import * as SubscriptionApiService from '../service';

export function* handleSuccessful3DS({ payload }) {
  const details = yield select(state => ({ ...state.subscription.details }));
  const status = yield select(state => ({ ...state.subscription.status }));
  try {
    // yield put(subscriptionDetailsProcessing(true));
    yield put(clearMessages()); // Don't leave messages floating on the page after clicking submit
    const postData = {
      program_uuid: details.programUuid,
      program_title: details.programTitle,
      payment_method_id: status.paymentMethodId,
      confirmation_client_secret: status.confirmationClientSecret,
      subscription_id: status.subscription_id,
      secure_3d_status: payload.status,
    };
    const result = yield call(SubscriptionApiService.checkoutComplete, postData);

    // yield put(submitSubscription.success(result));
    yield put(subscriptionStatusReceived(result));
    // success segment event
    sendSubscriptionEvent({ details, success: true });
  } catch (error) {
    yield call(handleSubscriptionErrors, error, true);
    // failure segment event
    sendSubscriptionEvent({ details, success: false });
    // yield put(submitSubscription.failure());
  }
}

export function* handleUnSuccessful3DS() {
  const details = yield select(state => ({ ...state.subscription.details }));
  try {
    yield put(clearMessages()); // Don't leave messages floating on the page after clicking submit
    yield call(
      handleSubscriptionErrors,
      handleCustomErrors(new Error('Could not complete 3DS', {
        cause: 'requires_payment_method',
      }), 'requires_payment_method'),
      true,
    );
    // failure segment event
    sendSubscriptionEvent({ details, success: false });
  } catch (error) {
    yield call(
      handleSubscriptionErrors,
      handleCustomErrors(new Error('Something went wrong.', {
        cause: 'fallback_error',
      }), 'fallback_error'),
      true,
    );
  }
}

export default handleSuccessful3DS;
