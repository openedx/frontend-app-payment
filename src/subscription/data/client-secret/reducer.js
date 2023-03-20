import {
  CLIENT_SECRET_DATA_RECEIVED,
  CLIENT_SECRET_PROCESSING,
  fetchClientSecret,
} from './actions';

const clientSecretInitialState = {
  isClientSecretProcessing: false,
  clientSecretId: '',
};

export const clientSecretReducer = (state = clientSecretInitialState, action = null) => {
  if (action != null) {
    switch (action.type) {
      case fetchClientSecret.TRIGGER: return state;
      case fetchClientSecret.FULFILL: return state;
      case CLIENT_SECRET_DATA_RECEIVED: return { ...state, ...action.payload };
      case CLIENT_SECRET_PROCESSING: return { ...state, isClientSecretProcessing: action.payload };

      default:
    }
  }
  return state;
};

export default clientSecretReducer;
