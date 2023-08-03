import { combineReducers } from 'redux';

import { getConfig } from '@edx/frontend-platform';
import {
  BASKET_DATA_RECEIVED,
  BASKET_PROCESSING,
  CAPTURE_KEY_DATA_RECEIVED,
  CAPTURE_KEY_PROCESSING,
  CLIENT_SECRET_DATA_RECEIVED,
  CLIENT_SECRET_PROCESSING,
  MICROFORM_STATUS,
  fetchBasket,
  submitPayment,
  fetchCaptureKey,
  fetchClientSecret,
  pollPaymentState,
} from './actions';

import { DEFAULT_STATUS } from '../checkout/payment-form/flex-microform/constants';
import {
  DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS,
  PAYMENT_STATE,
  POLLING_PAYMENT_STATES,
} from './constants';
import { chainReducers } from './utils';

/**
 * Internal State for the Payment State Polling Mechanism. Used entirely for Project Theseus.
 */
const paymentStatePollingInitialState = {
  /**
   * @see paymentProcessStatusIsPollingSelector
   */
  keepPolling: false,
  /**
   * This is replaceable by a configuration value. (`PAYMENT_STATE_POLLING_MAX_ERRORS`),
   *     however, this is our default.
   */
  retriesLeft: DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS,
};

/**
 * Initial basket state
 *
 * Certain of these values are reused for Theseus, information o how they are remapped can be found in the
 *   System Manual.
 */
const basketInitialState = {
  loading: true,
  loaded: false,
  submitting: false,
  redirect: false,
  isBasketProcessing: false,
  products: [],
  /** Modified by both getActiveOrder and pollPaymentState */
  paymentState: PAYMENT_STATE.DEFAULT,
  /** state specific to pollPaymentState */
  paymentStatePolling: paymentStatePollingInitialState,
};

const basket = (state = basketInitialState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case fetchBasket.TRIGGER: return { ...state, loading: true };
      case fetchBasket.FULFILL: return {
        ...state,
        loading: false,
        loaded: true,
      };

      case BASKET_DATA_RECEIVED: return { ...state, ...action.payload };

      case BASKET_PROCESSING: return {
        ...state,
        isBasketProcessing: action.payload,
      };

      case submitPayment.TRIGGER: return {
        ...state,
        paymentMethod: action.payload.method,
      };
      case submitPayment.REQUEST: return {
        ...state,
        submitting: true,
      };
      case submitPayment.SUCCESS: return {
        ...state,
        redirect: true,
      };
      case submitPayment.FULFILL: return {
        ...state,
        submitting: false,
        paymentMethod: undefined,
      };

      default:
    }
  }
  return state;
};

const captureContextInitialState = {
  isCaptureKeyProcessing: false,
  microformStatus: DEFAULT_STATUS,
  captureKeyId: '',
};

// Ecomm IDA Backend only, CyberSource Only
const captureKey = (state = captureContextInitialState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case fetchCaptureKey.TRIGGER: return state;
      case fetchCaptureKey.FULFILL: return state;

      case CAPTURE_KEY_DATA_RECEIVED: return { ...state, ...action.payload };

      case CAPTURE_KEY_PROCESSING: return {
        ...state,
        isCaptureKeyProcessing: action.payload,
      };

      case MICROFORM_STATUS: return {
        ...state,
        microformStatus: action.payload,
      };

      default:
    }
  }
  return state;
};

const clientSecretInitialState = {
  isClientSecretProcessing: false,
  clientSecretId: '',
};

// Commerce Coordinator & Ecommerce IDA Backends, Stripe
const clientSecret = (state = clientSecretInitialState, action = null) => {
  if (action != null) {
    switch (action.type) {
      case fetchClientSecret.TRIGGER: return state;
      case fetchClientSecret.FULFILL: return state;
      case CLIENT_SECRET_DATA_RECEIVED: return { ...state, ...action.payload };
      case CLIENT_SECRET_PROCESSING: return { ...state, isClientSecretProcessing: action.payload };

      default:
    }
  }
  return state;
};

/**
 * Payment State (Polling) Reducer
 *
 * > NOTE:
 * > The `PaymentProcessingModal` relies on the basket's `paymentState`, where as, the inner structure
 * > The Inner paymentStatePolling object in the basket is used only by the saga handler/worker, `handlePaymentState`
 *
 * @param {*} state A basket State Representation
 * @param action The Pending Action/Message for this Handler
 * @returns {*} A basket State Representation
 *
 * @see paymentStatePollingInitialState
 * @see PaymentProcessingModal
 * @see basketInitialState
 * @see handlePaymentState
 */
export const paymentState = (state = basketInitialState, action = null) => {
  // noinspection JSUnresolvedReference
  const maxErrors = getConfig().PAYMENT_STATE_POLLING_MAX_ERRORS || paymentStatePollingInitialState.retriesLeft;
  const shouldPoll = (payState) => POLLING_PAYMENT_STATES.includes(payState);

  if (action !== null && action !== undefined) {
    switch (action.type) {
      case pollPaymentState.TRIGGER:
        return {
          ...state,
          paymentStatePolling: {
            ...state.paymentStatePolling,
            keepPolling: shouldPoll(state.paymentState),
            retriesLeft: maxErrors,
          },
        };

      case pollPaymentState.FAILURE:
        return {
          ...state,
          paymentState: null,
          paymentStatePolling: {
            ...state.paymentStatePolling,
            keepPolling: false,
            retriesLeft: maxErrors,
          },
        };

      case pollPaymentState.FULFILL:
        return {
          ...state,
          paymentStatePolling: {
            ...state.paymentStatePolling,
            keepPolling: false,
            retriesLeft: maxErrors,
          },
        };

      case pollPaymentState.RECEIVED: {
        const isHttpError = action.payload.state === PAYMENT_STATE.HTTP_ERROR;
        const currRetriesLeft = (isHttpError ? state.paymentStatePolling.retriesLeft - 1 : maxErrors);
        return {
          ...state,
          paymentState: action.payload.state,
          paymentStatePolling: {
            ...state.paymentStatePolling,
            keepPolling: currRetriesLeft > 0 && shouldPoll(action.payload.state),
            retriesLeft: currRetriesLeft,
          },
        };
      }

      default:
    }
  }
  return state;
};

const reducer = combineReducers({
  basket: chainReducers([
    basket,
    paymentState,
  ]),
  captureKey,
  clientSecret,
});

export default reducer;
