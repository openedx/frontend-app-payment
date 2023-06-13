import {
  call, put, takeEvery, select, delay,
} from 'redux-saga/effects';
import { stopSubmit } from 'redux-form';
import { getConfig } from '@edx/frontend-platform';
import { getReduxFormValidationErrors, MINS_AS_MS, SECS_AS_MS } from './utils';
import { MESSAGE_TYPES } from '../../feedback/data/constants';

// Actions
import {
  basketDataReceived,
  basketProcessing,
  captureKeyDataReceived,
  clientSecretDataReceived,
  captureKeyProcessing,
  CAPTURE_KEY_START_TIMEOUT,
  captureKeyStartTimeout,
  microformStatus,
  fetchBasket,
  fetchActiveOrder,
  addCoupon,
  removeCoupon,
  updateQuantity,
  submitPayment,
  fetchCaptureKey,
  clientSecretProcessing,
  fetchClientSecret,
  paymentStateDataReceived,
  updatePaymentState,
} from './actions';

import { STATUS_LOADING } from '../checkout/payment-form/flex-microform/constants';

// Sagas
import { handleErrors, handleMessages, clearMessages } from '../../feedback';

// Services
import * as PaymentApiService from './service';
import { checkoutWithToken } from '../payment-methods/cybersource';
import { checkout as checkoutPaypal } from '../payment-methods/paypal';
import { checkout as checkoutApplePay } from '../payment-methods/apple-pay';
import { checkout as checkoutStripe } from '../payment-methods/stripe';
import { paymentProcessStatusShouldRunSelector } from './selectors';
import { PAYMENT_STATE } from './constants';

export const paymentMethods = {
  cybersource: checkoutWithToken,
  paypal: checkoutPaypal,
  'apple-pay': checkoutApplePay,
  stripe: checkoutStripe,
};

function* isBasketProcessing() {
  return yield select(state => state.payment.basket.isBasketProcessing);
}

function* isCaptureKeyProcessing() {
  return yield select(state => state.payment.captureKey.isCaptureKeyProcessing);
}

function* isClientSecretProcessing() {
  return yield select(state => state.payment.clientSecret.isClientSecretProcessing);
}

export function* handleReduxFormValidationErrors(error) {
  if (error.fieldErrors) {
    const fieldErrors = getReduxFormValidationErrors(error);
    yield put(stopSubmit('payment', fieldErrors));
  }
}

export function* handleDiscountCheck() {
  const basket = yield select(state => state.payment.basket);
  if (basket.products.length === 1) {
    const [product] = basket.products;
    const { courseKey } = product;
    if (product.productType === 'Seat') {
      const discount = yield call(
        PaymentApiService.getDiscountData,
        courseKey,
      );
      if (discount.discount_applicable) {
        const result = yield call(
          PaymentApiService.getBasket,
          discount.jwt,
        );
        result.discountJwt = discount.jwt;
        yield put(basketDataReceived(result));
        yield call(handleMessages, result.messages, false, window.location.search);
      }
    }
  }
}

export function* handleFetchBasket() {
  if (yield isBasketProcessing()) {
    // Do nothing if there is a request currently in flight to get or modify the basket
    return;
  }

  try {
    yield put(basketProcessing(true)); // we are going to modify the basket, don't make changes
    // TODO: Add switch for calling ecomemrce vs comerce coordinator with waffle flag
    const result = yield call(PaymentApiService.getBasket);

    // TODO: switch on results.paymentState, show checkout page, trigger polling, show reciept page
    yield put(basketDataReceived(result)); // update redux store with basket data
    yield call(handleMessages, result.messages, true, window.location.search);
    yield call(handleDiscountCheck); // check if a discount should be added to the basket
  } catch (error) {
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket)); // update redux store with basket data
      yield call(handleDiscountCheck); // check if a discount should be added to the basket
    }
  } finally {
    yield put(basketProcessing(false)); // we are done modifying the basket
    yield put(fetchBasket.fulfill()); // mark the basket as finished loading
  }
}

export function* handleFetchActiveOrder() {
  if (yield isBasketProcessing()) {
    // Do nothing if there is a request currently in flight to get or modify the basket
    return;
  }

  try {
    yield put(basketProcessing(true)); // we are going to modify the basket, don't make changes
    // TODO: Add switch for calling ecomemrce vs comerce coordinator with waffle flag
    const result = yield call(PaymentApiService.getActiveOrder);

    // TODO: switch on result.paymentState, show checkout page, trigger polling, show reciept page
    // TODO: THES-211 Decide if this should be broken out into a separate store
    // or use the same that we are for ecommerce
    yield put(basketDataReceived(result)); // update redux store with basket data
    // TODO: THES-207 for how coordinator will return errors to mfe
    // yield call(handleMessages, result.messages, true, window.location.search);
  } catch (error) {
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket)); // update redux store with basket data
    }
  } finally {
    yield put(basketProcessing(false)); // we are done modifying the basket
    yield put(fetchActiveOrder.fulfill()); // mark the basket as finished loading
    if (yield select((state) => paymentProcessStatusShouldRunSelector(state))) {
      yield put(updatePaymentState());
    }
  }
}

export function* handleCaptureKeyTimeout() {
  // Start at the 12min mark to leave 1 min of buffer on the 15min timeout
  yield delay(MINS_AS_MS(12));
  yield call(
    handleMessages,
    [{
      code: 'capture-key-2mins-message',
      messageType: MESSAGE_TYPES.INFO,
    }],
    true, // Clear other messages
    window.location.search,
  );

  yield delay(MINS_AS_MS(1));
  yield call(
    handleMessages,
    [{
      code: 'capture-key-1min-message',
      messageType: MESSAGE_TYPES.INFO,
    }],
    true, // Clear other messages
    window.location.search,
  );

  yield delay(MINS_AS_MS(1));
  yield put(clearMessages());
  yield put(fetchCaptureKey());
}

/**
 * Redux Saga for getting the capture context for a cybersource payment
 */
export function* handleFetchCaptureKey() {
  if (yield isCaptureKeyProcessing()) {
    // Do nothing if there is a request currently in flight
    return;
  }

  try {
    yield put(captureKeyProcessing(true)); // we are waiting for a capture key
    yield put(microformStatus(STATUS_LOADING)); // we are refreshing the capture key
    const result = yield call(PaymentApiService.getCaptureKey);
    yield put(captureKeyDataReceived(result)); // update redux store with capture key data
    yield put(captureKeyStartTimeout());
    // only start the timer if we're using the capture key
  } catch (error) {
    yield call(handleErrors, error, true);
  } finally {
    yield put(captureKeyProcessing(false)); // we are done capture key
    yield put(fetchCaptureKey.fulfill()); // mark the capture key as finished loading
  }
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
    const result = yield call(PaymentApiService.getClientSecret);
    yield put(clientSecretDataReceived(result));
  } catch (error) {
    yield call(handleErrors, error, true);
  } finally {
    yield put(clientSecretProcessing(false));
    yield put(fetchClientSecret.fulfill());
  }
}

/**
 * Many of the handlers here have identical error handling, and are also all processing the same
 * sort of response object (a basket).  This helper is just here to dedupe that code, since its
 * all identical.
 */
export function* performBasketOperation(operation, ...operationArgs) {
  if (yield isBasketProcessing()) {
    return;
  }

  try {
    yield put(basketProcessing(true));
    const result = yield call(operation, ...operationArgs);
    yield put(basketDataReceived(result));
    yield call(handleMessages, result.messages, true, window.location.search);
  } catch (error) {
    yield call(handleErrors, error, true);
    if (error.basket) {
      yield put(basketDataReceived(error.basket));
    }
  } finally {
    yield put(basketProcessing(false));
  }
}

export function* handleAddCoupon({ payload }) {
  yield call(performBasketOperation, PaymentApiService.postCoupon, payload.code);
}

export function* handleRemoveCoupon({ payload }) {
  yield call(performBasketOperation, PaymentApiService.deleteCoupon, payload.id);
}

export function* handleUpdateQuantity({ payload }) {
  yield call(performBasketOperation, PaymentApiService.postQuantity, payload);
}

export function* handleSubmitPayment({ payload }) {
  if (yield isBasketProcessing()) {
    return;
  }

  const { method, ...paymentArgs } = payload;
  try {
    yield put(basketProcessing(true));
    yield put(clearMessages()); // Don't leave messages floating on the page after clicking submit
    yield put(submitPayment.request());

    const paymentMethodCheckout = paymentMethods[method];
    const basket = yield select(state => ({ ...state.payment.basket }));
    yield call(paymentMethodCheckout, basket, paymentArgs);
    yield put(submitPayment.success());

    if (yield select((state) => paymentProcessStatusShouldRunSelector(state))) {
      yield put(updatePaymentState());
    }
  } catch (error) {
    // Do not handle errors on user aborted actions
    if (!error.aborted) {
      // Client side generated errors are simple error objects.  If we have one, wrap it in the
      // same format the API uses.
      if (error.code) {
        yield call(handleErrors, { messages: [error] }, true);
      } else {
        yield call(handleErrors, error, true);
        yield call(handleReduxFormValidationErrors, error);
      }

      if (error.basket) {
        yield put(basketDataReceived(error.basket));
        yield call(handleDiscountCheck);
      }
    }
  } finally {
    yield put(basketProcessing(false));
    yield put(submitPayment.fulfill());
  }
}

/**
 * Redux handler for payment status polling and updates
 *
 * Note:
 *  - This handler/worker loops until it is told to stop. via a state property (keepPolling), or a fatal state.
 */
export function* handlePaymentState() {
  const DEFAULT_DELAY_SECS = 5;
  let keepPolling = true;

  // noinspection JSUnresolvedReference
  const delaySecs = getConfig().PAYMENT_STATE_POLLING_DELAY_SECS || DEFAULT_DELAY_SECS;

  // NOTE: We may want to have a max errors check and have a fail state if there's a bad connection or something.

  while (keepPolling) {
    try {
      const basketId = yield select(state => state.payment.basket.basketId);
      const paymentNumber = yield select(state => (state.payment.basket.payments.length === 0
        ? null : state.payment.basket.payments[0].paymentNumber));

      if (!basketId || !paymentNumber) {
        // This shouldn't happen.
        //   I don't think we need to banner... shouldn't our parent calls recover? (They invoke this)
        keepPolling = false;
        yield put(updatePaymentState.fulfill());
        return;
      }

      const result = yield call(PaymentApiService.getCurrentPaymentState, paymentNumber, basketId);
      yield put(paymentStateDataReceived(result));

      if (!(yield select(state => state.payment.basket.paymentStatePolling.keepPolling))) {
        keepPolling = false;
        yield put(updatePaymentState.fulfill());
      } else {
        yield delay(SECS_AS_MS(delaySecs));
      }
    } catch (error) {
      // We dont quit on error.
      // yield call(handleErrors, error, true);
      yield put(paymentStateDataReceived({ state: PAYMENT_STATE.HTTP_ERROR }));
      yield delay(SECS_AS_MS(delaySecs));
    }
  }
}

export default function* saga() {
  yield takeEvery(fetchCaptureKey.TRIGGER, handleFetchCaptureKey);
  yield takeEvery(CAPTURE_KEY_START_TIMEOUT, handleCaptureKeyTimeout);
  yield takeEvery(fetchClientSecret.TRIGGER, handleFetchClientSecret);
  yield takeEvery(fetchBasket.TRIGGER, handleFetchBasket);
  yield takeEvery(fetchActiveOrder.TRIGGER, handleFetchActiveOrder);
  yield takeEvery(addCoupon.TRIGGER, handleAddCoupon);
  yield takeEvery(removeCoupon.TRIGGER, handleRemoveCoupon);
  yield takeEvery(updateQuantity.TRIGGER, handleUpdateQuantity);
  yield takeEvery(submitPayment.TRIGGER, handleSubmitPayment);
  yield takeEvery(updatePaymentState.TRIGGER, handlePaymentState);
}
