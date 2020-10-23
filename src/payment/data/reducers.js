import { combineReducers } from 'redux';

import {
  BASKET_DATA_RECEIVED,
  BASKET_PROCESSING,
  CAPTURE_KEY_DATA_RECEIVED,
  CAPTURE_KEY_PROCESSING,
  MICROFORM_STATUS,
  fetchBasket,
  submitPayment,
  fetchCaptureKey,
} from './actions';

import { DEFAULT_STATUS } from '../checkout/payment-form/flex-microform/constants';

const basketInitialState = {
  loading: true,
  loaded: false,
  submitting: false,
  redirect: false,
  isBasketProcessing: false,
  products: [],
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
  flexMicroformEnabled: true,
  microformStatus: DEFAULT_STATUS,
  captureKeyId: '',
};

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

const reducer = combineReducers({
  basket,
  captureKey,
});

export default reducer;
