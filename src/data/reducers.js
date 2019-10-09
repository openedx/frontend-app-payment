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

const createRootReducer = () =>
  combineReducers({
    userAccount,
    [paymentStoreName]: paymentReducer,
    [feedbackStoreName]: feedbackReducer,
    form: formReducer,
    i18n: i18nReducer,
  });

export default createRootReducer;
