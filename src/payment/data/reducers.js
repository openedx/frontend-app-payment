import { combineReducers } from 'redux';

import { FETCH_BASKET } from './actions';
import { reducer as coupon } from '../coupon';

export const basketInitialState = {
  loading: false,
  loadingError: null,
};

const basket = (state = basketInitialState, action = null) => {
  switch (action.type) {
    case FETCH_BASKET.BEGIN:
      return {
        ...state,
        loadingError: null,
        loading: true,
      };
    case FETCH_BASKET.SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
    case FETCH_BASKET.ERROR:
      return {
        ...state,
        loadingError: action.payload,
        loading: false,
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
