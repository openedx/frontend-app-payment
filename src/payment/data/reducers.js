import { combineReducers } from 'redux';
import Cookies from 'universal-cookie';

import {
  BASKET_DATA_RECEIVED,
  fetchBasket,
  addCoupon,
  removeCoupon,
  updateQuantity,
  submitPayment,
} from './actions';

import { configuration } from '../../environment';

const basketInitialState = {
  loading: true,
  loaded: false,
  submitting: false,
  redirect: false,
  products: [],
};

const basket = (state = basketInitialState, action = null) => {
  switch (action.type) {
    case BASKET_DATA_RECEIVED: return { ...state, ...action.payload };

    case submitPayment.TRIGGER: return {
      ...state,
      paymentMethod: action.payload.method,
    };
    case submitPayment.REQUEST: return {
      ...state,
      submitting: true,
      isBasketProcessing: true,
    };
    case submitPayment.SUCCESS: return {
      ...state,
      redirect: true,
    };
    case submitPayment.FULFILL: return {
      ...state,
      submitting: false,
      isBasketProcessing: false,
      paymentMethod: undefined,
    };

    case fetchBasket.TRIGGER: return { ...state, loading: true };
    case fetchBasket.SUCCESS: return { ...state, data: action.payload };
    case fetchBasket.FAILURE: return { ...state, error: action.payload };
    case fetchBasket.FULFILL: return { ...state, loading: false, loaded: true };

    case addCoupon.REQUEST: return { ...state, isBasketProcessing: true };
    case addCoupon.SUCCESS: return { ...state, couponData: action.payload };
    case addCoupon.FAILURE: return { ...state, couponError: action.payload };
    case addCoupon.FULFILL: return { ...state, isBasketProcessing: false };

    case removeCoupon.REQUEST: return { ...state, isBasketProcessing: true };
    case removeCoupon.SUCCESS: return { ...state, couponData: action.payload };
    case removeCoupon.FAILURE: return { ...state, couponError: action.payload };
    case removeCoupon.FULFILL: return { ...state, isBasketProcessing: false };

    case updateQuantity.REQUEST: return { ...state, isBasketProcessing: true };
    case updateQuantity.SUCCESS: return { ...state, quantityData: action.payload };
    case updateQuantity.FAILURE: return { ...state, quantityError: action.payload };
    case updateQuantity.FULFILL: return { ...state, isBasketProcessing: false };

    default:
      return state;
  }
};

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
