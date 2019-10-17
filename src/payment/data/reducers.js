import { combineReducers } from 'redux';

import {
  BASKET_DATA_RECEIVED,
  BASKET_PROCESSING,
  fetchBasket,
  submitPayment,
} from './actions';

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

const reducer = combineReducers({
  basket,
});

export default reducer;
