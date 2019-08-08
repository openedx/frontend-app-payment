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

import { reducer as cybersource } from '../cybersource';
import { reducer as paypal } from '../paypal';
import { configuration } from '../../environment';

const basketInitialState = {
  loading: true,
  loaded: false,
  submitting: false,
  products: [],
};

const basket = (state = basketInitialState, action = null) => {
  switch (action.type) {
    case BASKET_DATA_RECEIVED: return { ...state, ...action.payload };

    // For submission, we only really need to know whether it's actively submitting or not.
    case submitPayment.TRIGGER: return { ...state, submitting: true };
    case submitPayment.SUCCESS: return { ...state, submitting: false };
    case submitPayment.FAILURE: return { ...state, submitting: false };
    case submitPayment.FULFILL: return { ...state, submitting: false };

    case fetchBasket.TRIGGER: return { ...state, loading: true };
    case fetchBasket.SUCCESS: return { ...state, data: action.payload };
    case fetchBasket.FAILURE: return { ...state, error: action.payload };
    case fetchBasket.FULFILL: return { ...state, loading: false, loaded: true };

    case addCoupon.TRIGGER: return { ...state, isCouponProcessing: true };
    case addCoupon.SUCCESS: return { ...state, couponData: action.payload };
    case addCoupon.FAILURE: return { ...state, couponError: action.payload };
    case addCoupon.FULFILL: return { ...state, isCouponProcessing: false };

    case removeCoupon.TRIGGER: return { ...state, isCouponProcessing: true };
    case removeCoupon.SUCCESS: return { ...state, couponData: action.payload };
    case removeCoupon.FAILURE: return { ...state, couponError: action.payload };
    case removeCoupon.FULFILL: return { ...state, isCouponProcessing: false };

    case updateQuantity.TRIGGER: return { ...state, isQuantityProcessing: true };
    case updateQuantity.SUCCESS: return { ...state, quantityData: action.payload };
    case updateQuantity.FAILURE: return { ...state, quantityError: action.payload };
    case updateQuantity.FULFILL: return { ...state, isQuantityProcessing: false };

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
  cybersource,
  paypal,
});

export default reducer;
