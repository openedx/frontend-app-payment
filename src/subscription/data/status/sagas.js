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

/**
 * post the successful 3DS status to stripe-checkout-complete endpoint
 */
export function* handleSuccessful3DS({ payload }) {
  const details = yield select(state => ({ ...state.subscription.details }));
  const status = yield select(state => ({ ...state.subscription.status }));
  try {
    yield put(clearMessages()); // Don't leave messages floating on the page after clicking submit
    const postData = {
      confirmation_client_secret: status.confirmationClientSecret,
      subscription_id: status.subscriptionId,
      program_title: details.programTitle,
    };
    const result = yield call(SubscriptionApiService.checkoutComplete, {
      ...payload,
      ...postData,
      payment_method_id: status.paymentMethodId,
    });

    yield put(subscriptionStatusReceived({
      status: result.status,
    }));

    if (result.status === 'requires_payment_method') {
      throw new Error('Could not complete the payment', { cause: 'requires_payment_method' });
    }
    // success segment event
    sendSubscriptionEvent({ details, success: true });
  } catch (error) {
    yield call(
      handleSubscriptionErrors,
      handleCustomErrors(error, error.cause ? error.cause : 'fallback-error'),
      true,
    );
    // failure segment event
    sendSubscriptionEvent({ details, success: false });
  }
}

export default handleSuccessful3DS;
