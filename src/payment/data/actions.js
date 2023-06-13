import { createRoutine } from 'redux-saga-routines';

// Routines are action + action creator pairs in a series.
// Actions adhere to the flux standard action format.
// Routines by default are in the form of:
//
// Action                |   Action Creator
// -----------------------------------------------
// fetchBasket.TRIGGER   |   fetchBasket()
// fetchBasket.SUCCESS   |   fetchBasket.success()
// fetchBasket.FAILURE   |   fetchBasket.failure()
// fetchBasket.FULFILL   |   fetchBasket.fulfill()
//
// Created with redux-saga-routines
export const fetchCaptureKey = createRoutine('FETCH_CAPTURE_KEY');
export const fetchClientSecret = createRoutine('FETCH_CLIENT_SECRET');
export const submitPayment = createRoutine('SUBMIT_PAYMENT');
export const fetchBasket = createRoutine('FETCH_BASKET');
export const fetchActiveOrder = createRoutine('FETCH_ACTIVE_ORDER');
export const addCoupon = createRoutine('ADD_COUPON');
export const removeCoupon = createRoutine('REMOVE_COUPON');
export const updateQuantity = createRoutine('UPDATE_QUANTITY');
export const updatePaymentState = createRoutine('UPDATE_PAYMENT_STATE');

// Actions and their action creators
export const BASKET_DATA_RECEIVED = 'BASKET_DATA_RECEIVED';

export const basketDataReceived = basket => ({
  type: BASKET_DATA_RECEIVED,
  payload: basket,
});

export const BASKET_PROCESSING = 'BASKET_PROCESSING';

export const basketProcessing = isProcessing => ({
  type: BASKET_PROCESSING,
  payload: isProcessing,
});

export const CAPTURE_KEY_PROCESSING = 'CAPTURE_KEY_PROCESSING';

export const captureKeyProcessing = isProcessing => ({
  type: CAPTURE_KEY_PROCESSING,
  payload: isProcessing,
});

export const CLIENT_SECRET_PROCESSING = 'CLIENT_SECRET_PROCESSING';

export const clientSecretProcessing = isProcessing => ({
  type: CLIENT_SECRET_PROCESSING,
  payload: isProcessing,
});

export const MICROFORM_STATUS = 'MICROFORM_STATUS';

export const microformStatus = status => ({
  type: MICROFORM_STATUS,
  payload: status,
});

export const CAPTURE_KEY_START_TIMEOUT = 'CAPTURE_KEY_START_TIMEOUT';

export const captureKeyStartTimeout = () => ({
  type: CAPTURE_KEY_START_TIMEOUT,
});
export const CAPTURE_KEY_DATA_RECEIVED = 'CAPTURE_KEY_DATA_RECEIVED';

export const captureKeyDataReceived = captureKey => ({
  type: CAPTURE_KEY_DATA_RECEIVED,
  payload: captureKey,
});

export const CLIENT_SECRET_DATA_RECEIVED = 'CLIENT_SECRET_DATA_RECEIVED';

export const clientSecretDataReceived = clientSecret => ({
  type: CLIENT_SECRET_DATA_RECEIVED,
  payload: clientSecret,
});

export const PAYMENT_STATE_DATA_RECEIVED = 'PAYMENT_STATE_DATA_RECEIVED';

export const paymentStateDataReceived = paymentState => ({
  type: PAYMENT_STATE_DATA_RECEIVED,
  payload: paymentState,
});
