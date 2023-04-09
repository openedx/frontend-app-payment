import {
  SUBSCRIPTION_DETAILS_RECEIVED,
  SUBSCRIPTION_DETAILS_PROCESSING,
  fetchSubscriptionDetails,
  submitPayment,
} from './actions';

const subscriptionDetailsInitialState = {
  loading: true,
  loaded: false,
  submitting: false,
  redirect: false,
  enableStripePaymentProcessor: true,
  isSubscriptionDetailsProcessing: false,
  products: [],
  // TODO: remove these once fetched from DB
  currency: 'USD',
  programTitle: 'Blockchain Fundamentals',
  certificateType: 'verified',
  organization: 'University of California, Berkeley',
  price: 49,
  paymentMethod: 'stripe',
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

      case submitPayment.TRIGGER: return {
        ...state,
        paymentMethod: action.payload.method,
      };
      case submitPayment.REQUEST: return {
        ...state,
        submitting: true,
      };
      case submitPayment.SUCCESS: return {
        ...state,
        redirect: true,
      };
      case submitPayment.FULFILL: return {
        ...state,
        submitting: false,
        paymentMethod: undefined,
      };

      default:
    }
  }
  return state;
};

export default subscriptionDetailsReducer;
