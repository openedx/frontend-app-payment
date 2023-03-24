import {
  SUBSCRIPTION_CLIENT_SECRET_DATA_RECEIVED,
  SUBSCRIPTION_CLIENT_SECRET_PROCESSING,
  fetchSubscriptionClientSecret,
} from './actions';

const clientSecretInitialState = {
  isClientSecretProcessing: false,
  clientSecretId: '',
};

export const clientSecretReducer = (state = clientSecretInitialState, action = null) => {
  if (action != null) {
    switch (action.type) {
      case fetchSubscriptionClientSecret.TRIGGER: return state;
      case fetchSubscriptionClientSecret.FULFILL: return state;
      case SUBSCRIPTION_CLIENT_SECRET_PROCESSING: return { ...state, isClientSecretProcessing: action.payload };
      case SUBSCRIPTION_CLIENT_SECRET_DATA_RECEIVED: return { ...state, clientSecretId: action.payload };

      default:
        return state;
    }
  }
  return state;
};

export default clientSecretReducer;
