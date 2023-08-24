import {
  SUBSCRIPTION_DETAILS_RECEIVED,
  SUBSCRIPTION_DETAILS_PROCESSING,
  fetchSubscriptionDetails,
  submitSubscription,
} from './actions';

export const subscriptionDetailsInitialState = {
  loading: true,
  loaded: false,
  submitting: false,
  redirect: false,
  enableStripePaymentProcessor: true,
  isSubscriptionDetailsProcessing: false,
  products: [],
  paymentMethod: 'stripe',
  errorCode: null,
};

export const subscriptionDetailsReducer = (state = subscriptionDetailsInitialState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case fetchSubscriptionDetails.TRIGGER: return { ...state, loading: true };
      case fetchSubscriptionDetails.FULFILL: return {
        ...state,
        loading: false,
        loaded: true,
      };

      case SUBSCRIPTION_DETAILS_RECEIVED: return { ...state, ...action.payload };

      case SUBSCRIPTION_DETAILS_PROCESSING: return {
        ...state,
        isSubscriptionDetailsProcessing: action.payload,
      };

      case submitSubscription.REQUEST: return {
        ...state,
        submitting: true,
      };
      case submitSubscription.SUCCESS: return {
        ...state,
        submitting: false,

      };
      case submitSubscription.FAILURE: return {
        ...state,
        submitting: false,
      };

      default:
    }
  }
  return state;
};

export default subscriptionDetailsReducer;
