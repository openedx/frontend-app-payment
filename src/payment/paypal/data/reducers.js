import { SUBMIT_PAYMENT_PAYPAL } from './actions';

const defaultState = {
  submitting: false,
};

const reducer = (state = defaultState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case SUBMIT_PAYMENT_PAYPAL.BEGIN:
        return {
          ...state,
          submitting: true,
        };
      case SUBMIT_PAYMENT_PAYPAL.FAILURE:
        return {
          ...state,
          submitting: false,
        };
      default:
    }
  }

  return state;
};

export default reducer;
