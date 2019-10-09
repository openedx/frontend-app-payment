import { combineReducers } from 'redux';
import { userAccount } from '@edx/frontend-auth';
import { reducer as formReducer } from 'redux-form';
import { reducer as i18nReducer } from '@edx/frontend-i18n';

import {
  reducer as paymentReducer,
  storeName as paymentStoreName,
} from '../payment';
import {
  reducer as feedbackReducer,
  storeName as feedbackStoreName,
} from '../feedback';

const identityReducer = (state) => {
  const newState = { ...state };
  return newState;
};

const createRootReducer = () =>
  combineReducers({
    // The authentication state is added as initialState when
    // creating the store in data/store.js.
    authentication: identityReducer,
    userAccount,
    [paymentStoreName]: paymentReducer,
    [feedbackStoreName]: feedbackReducer,
    form: formReducer,
    i18n: i18nReducer,
  });

export default createRootReducer;
