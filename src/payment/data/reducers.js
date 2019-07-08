import { combineReducers } from 'redux';

import { FETCH_BASKET } from './actions';
import { reducer as coupon } from '../coupon';

export const basketInitialState = {
  loading: false,
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
        loaded: true,
      };
    default:
      return state;
  }
};

const reducer = combineReducers({
  basket,
  coupon,
});

export default reducer;
