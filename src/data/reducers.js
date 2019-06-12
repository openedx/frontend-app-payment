import { combineReducers } from 'redux';
import { userAccount } from '@edx/frontend-auth';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';
import { reducer as i18nReducer } from '@edx/frontend-i18n';
import {
  reducer as paymentReducer,
  storeName as paymentStoreName,
} from '../payment';


const identityReducer = (state) => {
  const newState = { ...state };
  return newState;
};

const createRootReducer = history =>
  combineReducers({
    // The authentication state is added as initialState when
    // creating the store in data/store.js.
    authentication: identityReducer,
    configuration: identityReducer,
    userAccount,
    [paymentStoreName]: paymentReducer,
    router: connectRouter(history),
    form: formReducer,
    i18n: i18nReducer,
  });

export default createRootReducer;
