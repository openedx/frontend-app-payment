import { combineReducers } from 'redux';
import Cookies from 'universal-cookie';

import {
  BASKET_DATA_RECEIVED,
  BASKET_PROCESSING,
  fetchBasket,
  submitPayment,
} from './actions';

import { configuration } from '../../environment';

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

/* istanbul ignore next */
function getCurrencyInitialState() {
  const cookie = new Cookies().get(configuration.CURRENCY_COOKIE_NAME);

  if (cookie && typeof cookie.code === 'string' && typeof cookie.rate === 'number') {
    return {
      currencyCode: cookie.code,
      conversionRate: cookie.rate,
    };
  }
  return {};
}

const currencyInitialState = getCurrencyInitialState();

const currency = (state = currencyInitialState) => ({ ...state });

const reducer = combineReducers({
  basket,
  currency,
});

export default reducer;
