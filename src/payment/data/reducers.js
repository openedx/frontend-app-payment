import { combineReducers } from 'redux';
import Cookies from 'universal-cookie';

import { FETCH_BASKET } from './actions';
import { reducer as coupon } from '../coupon';
import { reducer as cybersource } from '../cybersource';
import { reducer as paypal } from '../paypal';
import { configuration } from '../../environment';

const basketInitialState = {
  loading: false,
  submitting: false,
  products: [],
};

const basket = (state = basketInitialState, action = null) => {
  switch (action.type) {
    case FETCH_BASKET.BEGIN:
      return {
        ...state,
        loading: true,
        loaded: false,
      };
    case FETCH_BASKET.SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
        loaded: true,
      };
    case FETCH_BASKET.FAILURE:
      return {
        ...state,
        loading: false,
        loaded: false,
      };
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
  coupon,
  currency,
  cybersource,
  paypal,
});

export default reducer;
