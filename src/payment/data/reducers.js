import { combineReducers } from 'redux';

import { FETCH_BASKET } from './actions';
import { reducer as coupon } from '../coupon';
import { reducer as cybersource } from '../cybersource';
import { reducer as paypal } from '../paypal';

export const basketInitialState = {
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

const reducer = combineReducers({
  basket,
  coupon,
  cybersource,
  paypal,
});

export default reducer;
