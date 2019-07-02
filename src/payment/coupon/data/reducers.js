import { ADD_COUPON, REMOVE_COUPON, UPDATE_COUPON_DRAFT } from './actions';

const defaultState = {
  benefitValue: null,
  code: null,
  id: null,
  errorCode: null,
  loaded: false,
  loading: false,
};

const reducer = (state = defaultState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case ADD_COUPON.BEGIN:
        return {
          ...state,
          loading: true,
          loaded: false,
          errorCode: null,
        };
      case ADD_COUPON.SUCCESS:
        return {
          ...state,
          loading: false,
          loaded: true,
          errorCode: null,
          benefitValue: action.payload.benefitValue,
          code: action.payload.code,
          id: action.payload.id,
        };
      case ADD_COUPON.FAILURE:
        return {
          ...state,
          loading: false,
          loaded: false,
          errorCode: action.payload.errorCode,
          id: null,
        };
      case REMOVE_COUPON.BEGIN:
        return {
          ...state,
          loading: true,
          loaded: false,
          errorCode: null,
        };
      case REMOVE_COUPON.SUCCESS:
        return defaultState;
      case REMOVE_COUPON.FAILURE:
        return {
          ...state,
          loading: false,
          loaded: true, // There's still a loaded coupon.
          errorCode: action.payload.errorCode,
        };
      case UPDATE_COUPON_DRAFT:
        return {
          ...state,
          code: action.payload.code,
        };
      default:
    }
  }

  return state;
};

export default reducer;
