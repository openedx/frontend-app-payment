import {
  SUBSCRIPTION_STATUS_RECEIVED,
  submit3DS,
} from './actions';

export const CONFIRMATION_STATUS = {
  trialing: 'trialing',
  success: 'success',
  requires_action: '3DS',
};

const subscriptionStatusInitialState = {
  confirmationClientSecret: null,
  status: null, // CONFIRMATION_STATUS.succeeded,
  subscriptionId: null,
  price: null,

  // 3DS
  submitting: false,
  submitted: false,
};

export const subscriptionStatusReducer = (state = subscriptionStatusInitialState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case submit3DS.TRIGGER: return { ...state, submitting: true };
      case submit3DS.FULFILL: return {
        ...state,
        submitting: false,
        submitted: true,
      };
      case SUBSCRIPTION_STATUS_RECEIVED: return {
        ...state,
        ...action.payload,
        status: CONFIRMATION_STATUS[action.payload.status],
      };
      default:
    }
  }
  return state;
};

export default subscriptionStatusReducer;
