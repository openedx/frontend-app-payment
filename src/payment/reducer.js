import { FETCH_BASKET } from './actions';

export const initialState = {
  loading: false,
  loadingError: null,
  payments: {},
};

const paymentsPage = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BASKET.BEGIN:
      return {
        ...state,
        loadingError: null,
        loading: true,
      };
    case FETCH_BASKET.SUCCESS:
      return {
        ...action.payload,
        ...state,
        loading: false,
      };
    case FETCH_BASKET.RESET:
      return {
        ...state,
        loadingError: null,
        loading: false,
      };
    default:
      return state;
  }
};

export default paymentsPage;
